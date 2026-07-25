import {
  GitHubCollectionError,
  listGitHubCollectionImages,
  signGitHubCollectionImages,
} from "@/lib/github-collection";
import { getGitHubConfiguration } from "@/lib/owner-env";
import {
  matchRuntimeCache,
  putRuntimeCache,
} from "@/lib/runtime-cache";

export const dynamic = "force-dynamic";

function collectionJson(
  body: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  const status = init.status ?? 200;
  headers.set(
    "Cache-Control",
    status >= 400
      ? "no-store"
      : "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
  );
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Robots-Tag", "noindex");

  return new Response(JSON.stringify(body), { ...init, headers });
}

export async function GET(request: Request): Promise<Response> {
  const configuration = getGitHubConfiguration();

  if (!configuration) {
    return collectionJson(
      {
        ok: false,
        error: {
          code: "COLLECTION_UNAVAILABLE",
          message: "The live collection is temporarily unavailable.",
        },
      },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  requestUrl.search = "";
  const cacheKey = new Request(requestUrl, { method: "GET" });
  const cachedResponse = await matchRuntimeCache(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const images = await signGitHubCollectionImages(
      await listGitHubCollectionImages(configuration),
      configuration,
    );
    const response = collectionJson({ ok: true, images });
    await putRuntimeCache(cacheKey, response);
    return response;
  } catch (error) {
    const upstreamStatus =
      error instanceof GitHubCollectionError
        ? error.upstreamStatus
        : undefined;

    return collectionJson(
      {
        ok: false,
        error: {
          code: "COLLECTION_UNAVAILABLE",
          message: "The live collection could not be refreshed.",
        },
        ...(upstreamStatus ? { upstreamStatus } : {}),
      },
      { status: 502 },
    );
  }
}
