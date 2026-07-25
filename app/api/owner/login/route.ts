import {
  createOwnerSessionCookie,
  createOwnerSessionToken,
  verifyOwnerPassword,
} from "@/lib/owner-auth";
import {
  errorResponse,
  isSameOriginMutation,
  jsonResponse,
} from "@/lib/owner-api";
import {
  getOwnerAuthConfiguration,
  getOwnerConfigurationStatus,
} from "@/lib/owner-env";

export const dynamic = "force-dynamic";

const MAX_LOGIN_BODY_BYTES = 4_096;
const MAX_PASSWORD_BYTES = 1_024;
const LOGIN_WINDOW_MS = 15 * 60 * 1_000;
const MAX_LOGIN_FAILURES = 5;

type LoginAttempt = {
  failures: number;
  startedAt: number;
  blockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

function clientKey(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function activeAttempt(key: string, now: number): LoginAttempt | null {
  const attempt = loginAttempts.get(key);

  if (!attempt) return null;
  if (
    (attempt.blockedUntil > 0 && attempt.blockedUntil <= now) ||
    now - attempt.startedAt > LOGIN_WINDOW_MS
  ) {
    loginAttempts.delete(key);
    return null;
  }

  return attempt;
}

function recordFailure(key: string, now: number): void {
  const current = activeAttempt(key, now) ?? {
    failures: 0,
    startedAt: now,
    blockedUntil: 0,
  };
  const failures = current.failures + 1;

  loginAttempts.set(key, {
    failures,
    startedAt: current.startedAt,
    blockedUntil:
      failures >= MAX_LOGIN_FAILURES ? now + LOGIN_WINDOW_MS : 0,
  });

  if (loginAttempts.size > 500) {
    for (const [storedKey, attempt] of loginAttempts) {
      if (
        now - attempt.startedAt > LOGIN_WINDOW_MS &&
        attempt.blockedUntil <= now
      ) {
        loginAttempts.delete(storedKey);
      }
    }
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return errorResponse(
      403,
      "CROSS_SITE_REQUEST",
      "Cross-site login requests are not allowed.",
    );
  }

  const configuration = getOwnerAuthConfiguration();
  const configured = getOwnerConfigurationStatus();

  if (!configuration) {
    return errorResponse(
      503,
      "AUTH_NOT_CONFIGURED",
      "Owner login is not configured on the server.",
      { configured },
    );
  }

  const now = Date.now();
  const key = clientKey(request);
  const attempt = activeAttempt(key, now);

  if (attempt?.blockedUntil && attempt.blockedUntil > now) {
    const retryAfter = Math.ceil((attempt.blockedUntil - now) / 1_000);
    const response = errorResponse(
      429,
      "TOO_MANY_LOGIN_ATTEMPTS",
      "Too many login attempts. Please wait before trying again.",
    );
    response.headers.set("Retry-After", String(retryAfter));
    return response;
  }

  const contentLength = Number(request.headers.get("Content-Length"));

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_LOGIN_BODY_BYTES
  ) {
    return errorResponse(
      413,
      "LOGIN_BODY_TOO_LARGE",
      "The login request is too large.",
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_JSON",
      "Send the password as a valid JSON request.",
    );
  }

  const password =
    typeof payload === "object" &&
    payload !== null &&
    "password" in payload &&
    typeof payload.password === "string"
      ? payload.password
      : null;

  if (
    password === null ||
    password.length === 0 ||
    new TextEncoder().encode(password).byteLength > MAX_PASSWORD_BYTES
  ) {
    return errorResponse(
      400,
      "INVALID_PASSWORD",
      "A password is required.",
    );
  }

  const passwordMatches = await verifyOwnerPassword(
    password,
    configuration.password,
    configuration.sessionSecret,
  );

  if (!passwordMatches) {
    recordFailure(key, now);
    return errorResponse(401, "LOGIN_FAILED", "The password is incorrect.");
  }

  loginAttempts.delete(key);
  const token = await createOwnerSessionToken(configuration.sessionSecret);

  return jsonResponse(
    { ok: true, authenticated: true },
    {
      status: 200,
      headers: { "Set-Cookie": createOwnerSessionCookie(token) },
    },
  );
}
