import type { GitHubConfiguration } from "@/lib/owner-env";
import {
  GITHUB_COLLECTION_DIRECTORY,
  MAX_IMAGE_BYTES,
  hasExpectedMagicBytes,
  isSupportedMimeType,
  type SupportedMimeType,
} from "@/lib/github-image-upload";

const GITHUB_API_VERSION = "2026-03-10";
const COLLECTION_REQUEST_TIMEOUT_MS = 15_000;
const COLLECTION_FILENAME_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._-]{0,179}\.(?:jpe?g|png|webp)$/i;

interface GitHubContentItem {
  mode?: unknown;
  path?: unknown;
  sha?: unknown;
  size?: unknown;
  type?: unknown;
}

export interface GitHubCollectionImage {
  filename: string;
  sha: string;
}

export interface SignedGitHubCollectionImage {
  filename: string;
  src: string;
}

export class GitHubCollectionError extends Error {
  readonly upstreamStatus: number;

  constructor(message: string, upstreamStatus = 0) {
    super(message);
    this.name = "GitHubCollectionError";
    this.upstreamStatus = upstreamStatus;
  }
}

function repositoryPath(configuration: GitHubConfiguration): string {
  return `${encodeURIComponent(configuration.owner)}/${encodeURIComponent(
    configuration.repo,
  )}`;
}

function githubHeaders(
  configuration: GitHubConfiguration,
  accept: string,
): HeadersInit {
  return {
    Accept: accept,
    Authorization: `Bearer ${configuration.token}`,
    "User-Agent": "flora-public-collection",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
}

function normalizeMimeType(value: string | null): string {
  return value?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}

function mimeTypeForFilename(filename: string): SupportedMimeType | null {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  return extension === "webp" ? "image/webp" : null;
}

function isGitObjectSha(value: string): boolean {
  return /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(value);
}

async function collectionSigningKey(
  configuration: GitHubConfiguration,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(
      [
        "flora-collection-signing-v1",
        configuration.owner,
        configuration.repo,
        configuration.branch,
        configuration.token,
      ].join("\0"),
    ),
  );

  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function signaturePayload(filename: string, sha: string): ArrayBuffer {
  return new TextEncoder().encode(
    ["flora-collection-image-v1", filename, sha].join("\0"),
  ).buffer;
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const characters = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(characters)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlDecode(value: string): ArrayBuffer | null {
  if (!/^[A-Za-z0-9_-]{43}$/u.test(value)) {
    return null;
  }

  try {
    const padded = `${value.replaceAll("-", "+").replaceAll("_", "/")}=`;
    return Uint8Array.from(
      atob(padded),
      (character) => character.charCodeAt(0),
    ).buffer;
  } catch {
    return null;
  }
}

export function isCollectionFilename(value: string): boolean {
  return COLLECTION_FILENAME_PATTERN.test(value);
}

export function isCollectionImageSha(value: string): boolean {
  return isGitObjectSha(value);
}

export async function listGitHubCollectionImages(
  configuration: GitHubConfiguration,
): Promise<GitHubCollectionImage[]> {
  const repository = repositoryPath(configuration);
  let response: Response;

  try {
    response = await fetch(
      `https://api.github.com/repos/${repository}/git/trees/${encodeURIComponent(
        configuration.branch,
      )}?recursive=1`,
      {
        headers: githubHeaders(configuration, "application/vnd.github+json"),
        redirect: "manual",
        signal: AbortSignal.timeout(COLLECTION_REQUEST_TIMEOUT_MS),
      },
    );
  } catch {
    throw new GitHubCollectionError("GitHub could not be reached.");
  }

  if (!response.ok) {
    throw new GitHubCollectionError(
      "GitHub did not return the collection.",
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new GitHubCollectionError(
      "GitHub returned an invalid collection response.",
      response.status,
    );
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as { tree?: unknown }).tree) ||
    (payload as { truncated?: unknown }).truncated === true
  ) {
    throw new GitHubCollectionError(
      "GitHub returned an invalid collection response.",
      response.status,
    );
  }

  const images = new Map<string, GitHubCollectionImage>();
  const prefix = `${GITHUB_COLLECTION_DIRECTORY}/`;

  for (const entry of (payload as { tree: GitHubContentItem[] }).tree) {
    if (
      entry.mode !== "100644" ||
      entry.type !== "blob" ||
      typeof entry.path !== "string" ||
      typeof entry.sha !== "string" ||
      typeof entry.size !== "number" ||
      entry.size <= 0 ||
      entry.size > MAX_IMAGE_BYTES ||
      !entry.path.startsWith(prefix) ||
      entry.path.slice(prefix.length).includes("/")
    ) {
      continue;
    }

    const filename = entry.path.slice(prefix.length);

    if (
      !isCollectionFilename(filename) ||
      !isGitObjectSha(entry.sha)
    ) {
      continue;
    }

    images.set(filename.toLowerCase(), { filename, sha: entry.sha });
  }

  return [...images.values()].sort((left, right) =>
    right.filename.localeCompare(left.filename, "en"),
  );
}

export async function signGitHubCollectionImages(
  images: GitHubCollectionImage[],
  configuration: GitHubConfiguration,
): Promise<SignedGitHubCollectionImage[]> {
  const key = await collectionSigningKey(configuration);

  return Promise.all(
    images.map(async ({ filename, sha }) => {
      const signature = base64UrlEncode(
        await crypto.subtle.sign(
          "HMAC",
          key,
          signaturePayload(filename, sha),
        ),
      );
      const query = new URLSearchParams({ filename, sha, signature });

      return {
        filename,
        src: `/api/collection/image?${query.toString()}`,
      };
    }),
  );
}

export async function hasValidCollectionImageSignature(
  filename: string,
  sha: string,
  signature: string,
  configuration: GitHubConfiguration,
): Promise<boolean> {
  const signatureBytes = base64UrlDecode(signature);

  if (!signatureBytes) {
    return false;
  }

  const key = await collectionSigningKey(configuration);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    signaturePayload(filename, sha),
  );
}

export async function downloadGitHubCollectionImage(
  filename: string,
  sha: string,
  configuration: GitHubConfiguration,
): Promise<{ body: ArrayBuffer; mimeType: SupportedMimeType }> {
  const expectedMimeType = mimeTypeForFilename(filename);

  if (
    !isCollectionFilename(filename) ||
    !isGitObjectSha(sha) ||
    !expectedMimeType
  ) {
    throw new TypeError("Invalid collection filename.");
  }

  const repository = repositoryPath(configuration);
  let response: Response;

  try {
    response = await fetch(
      `https://api.github.com/repos/${repository}/git/blobs/${encodeURIComponent(
        sha,
      )}`,
      {
        headers: githubHeaders(
          configuration,
          "application/vnd.github.raw+json",
        ),
        redirect: "manual",
        signal: AbortSignal.timeout(COLLECTION_REQUEST_TIMEOUT_MS),
      },
    );
  } catch {
    throw new GitHubCollectionError("GitHub could not be reached.");
  }

  if (!response.ok) {
    throw new GitHubCollectionError(
      "GitHub did not return the image.",
      response.status,
    );
  }

  const contentLength = Number(response.headers.get("Content-Length"));
  const upstreamMimeType = normalizeMimeType(
    response.headers.get("Content-Type"),
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_IMAGE_BYTES
  ) {
    throw new GitHubCollectionError(
      "GitHub returned an oversized image.",
      response.status,
    );
  }

  const body = await response.arrayBuffer();

  if (
    body.byteLength === 0 ||
    body.byteLength > MAX_IMAGE_BYTES ||
    !hasExpectedMagicBytes(new Uint8Array(body), expectedMimeType) ||
    (upstreamMimeType !== "application/octet-stream" &&
      isSupportedMimeType(upstreamMimeType) &&
      upstreamMimeType !== expectedMimeType)
  ) {
    throw new GitHubCollectionError(
      "GitHub returned an invalid image.",
      response.status,
    );
  }

  return { body, mimeType: expectedMimeType };
}
