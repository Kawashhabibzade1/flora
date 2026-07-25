import { Buffer } from "node:buffer";
import type { GitHubConfiguration } from "@/lib/owner-env";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const DESTINATION_DIRECTORY = "public/images/Hijabs";

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SupportedMimeType = keyof typeof extensionByMimeType;

interface GitHubContentsResponse {
  content?: {
    html_url?: string;
    path?: string;
    sha?: string;
  };
}

export class GitHubUploadError extends Error {
  readonly githubStatus: number;
  readonly requestId?: string;

  constructor(message: string, githubStatus: number, requestId?: string) {
    super(message);
    this.name = "GitHubUploadError";
    this.githubStatus = githubStatus;
    this.requestId = requestId;
  }
}

function isSupportedMimeType(value: string): value is SupportedMimeType {
  return Object.hasOwn(extensionByMimeType, value);
}

function hasExpectedMagicBytes(
  bytes: Uint8Array,
  mimeType: SupportedMimeType,
): boolean {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return pngSignature.every((value, index) => bytes[index] === value);
  }

  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).toString("base64");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function uploadFailureMessage(status: number): string {
  if (status === 401) {
    return "The configured GitHub token is invalid or has expired.";
  }

  if (status === 403) {
    return 'GitHub is connected, but this token cannot upload. Give it "Contents: Read and write" access to the flora repository.';
  }

  if (status === 404) {
    return "The configured GitHub repository or branch was not found.";
  }

  if (status === 409 || status === 422) {
    return "GitHub could not create the image commit.";
  }

  if (status === 429) {
    return "GitHub temporarily rate-limited the upload.";
  }

  return "GitHub did not accept the image upload.";
}

export function validateImage(
  file: File,
): { bytesPromise: Promise<Uint8Array>; extension: string } {
  if (file.size === 0) {
    throw new TypeError("The selected image is empty.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new RangeError("The selected image is larger than 10 MB.");
  }

  if (!isSupportedMimeType(file.type)) {
    throw new TypeError("Only JPEG, PNG, and WebP images are allowed.");
  }

  return {
    extension: extensionByMimeType[file.type],
    bytesPromise: file.arrayBuffer().then((buffer) => {
      const bytes = new Uint8Array(buffer);

      if (!hasExpectedMagicBytes(bytes, file.type as SupportedMimeType)) {
        throw new TypeError(
          "The file contents do not match the selected image format.",
        );
      }

      return bytes;
    }),
  };
}

export async function uploadImageToGitHub(
  bytes: Uint8Array,
  extension: string,
  configuration: GitHubConfiguration,
): Promise<{
  filename: string;
  path: string;
  githubUrl: string;
  sha: string;
}> {
  const filename = `flora-${Date.now().toString(36)}-${crypto.randomUUID()}.${extension}`;
  const path = `${DESTINATION_DIRECTORY}/${filename}`;
  const repository = `${encodeURIComponent(configuration.owner)}/${encodeURIComponent(configuration.repo)}`;
  let response: Response;

  try {
    response = await fetch(
      `https://api.github.com/repos/${repository}/contents/${encodePath(path)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${configuration.token}`,
          "Content-Type": "application/json",
          "User-Agent": "flora-owner-upload",
          "X-GitHub-Api-Version": "2026-03-10",
        },
        body: JSON.stringify({
          branch: configuration.branch,
          content: bytesToBase64(bytes),
          message: `Add hijab image ${filename}`,
        }),
        signal: AbortSignal.timeout(90_000),
      },
    );
  } catch {
    throw new GitHubUploadError(
      "GitHub could not be reached in time. Please try again.",
      0,
    );
  }

  const requestId = response.headers.get("X-GitHub-Request-Id") ?? undefined;

  if (!response.ok) {
    throw new GitHubUploadError(
      uploadFailureMessage(response.status),
      response.status,
      requestId,
    );
  }

  const payload = (await response.json()) as GitHubContentsResponse;
  const uploadedPath = payload.content?.path;
  const githubUrl = payload.content?.html_url;
  const sha = payload.content?.sha;

  if (!uploadedPath || !githubUrl || !sha) {
    throw new GitHubUploadError(
      "GitHub accepted the request but returned an incomplete upload response.",
      response.status,
      requestId,
    );
  }

  return { filename, path: uploadedPath, githubUrl, sha };
}
