import {
  GitHubCollectionError,
  downloadGitHubCollectionImage,
  hasValidCollectionImageSignature,
  isCollectionFilename,
  isCollectionImageSha,
} from "@/lib/github-collection";
import { getGitHubConfiguration } from "@/lib/owner-env";
import {
  matchRuntimeCache,
  putRuntimeCache,
} from "@/lib/runtime-cache";

export const dynamic = "force-dynamic";

function imageError(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const filenames = searchParams.getAll("filename");
  const shas = searchParams.getAll("sha");
  const signatures = searchParams.getAll("signature");
  const hasUnknownParameter = [...searchParams.keys()].some(
    (key) => !["filename", "sha", "signature"].includes(key),
  );

  if (
    hasUnknownParameter ||
    filenames.length !== 1 ||
    shas.length !== 1 ||
    signatures.length !== 1 ||
    !isCollectionFilename(filenames[0]) ||
    !isCollectionImageSha(shas[0])
  ) {
    return imageError(400, "Invalid image request.");
  }

  const configuration = getGitHubConfiguration();

  if (!configuration) {
    return imageError(503, "The image service is temporarily unavailable.");
  }

  if (
    !(await hasValidCollectionImageSignature(
      filenames[0],
      shas[0],
      signatures[0],
      configuration,
    ))
  ) {
    return imageError(403, "Invalid image signature.");
  }

  const canonicalUrl = new URL("/api/collection/image", request.url);
  canonicalUrl.search = new URLSearchParams({
    filename: filenames[0],
    sha: shas[0],
    signature: signatures[0],
  }).toString();
  const cacheKey = new Request(canonicalUrl, { method: "GET" });
  const cachedResponse = await matchRuntimeCache(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const image = await downloadGitHubCollectionImage(
      filenames[0],
      shas[0],
      configuration,
    );

    const response = new Response(image.body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": image.mimeType,
        "Content-Disposition": `inline; filename="${filenames[0]}"`,
        "Content-Security-Policy": "default-src 'none'",
        "Cross-Origin-Resource-Policy": "same-origin",
        ETag: `"${shas[0]}"`,
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex",
      },
    });
    await putRuntimeCache(cacheKey, response);
    return response;
  } catch (error) {
    if (
      error instanceof GitHubCollectionError &&
      error.upstreamStatus === 404
    ) {
      return imageError(404, "Image not found.");
    }

    return imageError(502, "The image could not be loaded.");
  }
}
