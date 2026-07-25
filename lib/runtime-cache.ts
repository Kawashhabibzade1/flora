type RuntimeCacheStorage = {
  default?: Cache;
};

function getDefaultRuntimeCache(): Cache | null {
  const cacheStorage = (
    globalThis as typeof globalThis & {
      caches?: RuntimeCacheStorage;
    }
  ).caches;

  return cacheStorage?.default ?? null;
}

export async function matchRuntimeCache(
  request: Request,
): Promise<Response | null> {
  const cache = getDefaultRuntimeCache();

  if (!cache) return null;

  try {
    return (await cache.match(request)) ?? null;
  } catch {
    return null;
  }
}

export async function putRuntimeCache(
  request: Request,
  response: Response,
): Promise<void> {
  const cache = getDefaultRuntimeCache();

  if (!cache || !response.ok) return;

  try {
    await cache.put(request, response.clone());
  } catch {
    // The public collection still works when a local runtime has no Cache API.
  }
}
