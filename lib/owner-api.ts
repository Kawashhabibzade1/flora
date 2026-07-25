import type { OwnerConfigurationStatus } from "@/lib/owner-env";

interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  configured?: OwnerConfigurationStatus;
  githubStatus?: number;
  requestId?: string;
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(JSON.stringify(body), { ...init, headers });
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  extra: Partial<Omit<ApiErrorBody, "ok" | "error">> = {},
): Response {
  return jsonResponse(
    {
      ok: false,
      error: { code, message },
      ...extra,
    } satisfies ApiErrorBody,
    { status },
  );
}

export function isSameOriginMutation(request: Request): boolean {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return false;
  }

  const origin = request.headers.get("Origin");
  return origin === null || origin === new URL(request.url).origin;
}
