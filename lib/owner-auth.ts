const SESSION_COOKIE_NAME = "flora_owner_session";
const SESSION_VERSION = 1;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const textEncoder = new TextEncoder();

interface SessionPayload {
  v: number;
  exp: number;
  nonce: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch {
    return null;
  }
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return difference === 0;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function hmac(value: string, secret: string): Promise<Uint8Array> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );
  return new Uint8Array(signature);
}

export async function verifyOwnerPassword(
  candidate: string,
  expected: string,
  sessionSecret: string,
): Promise<boolean> {
  const [candidateDigest, expectedDigest] = await Promise.all([
    hmac(candidate, sessionSecret),
    hmac(expected, sessionSecret),
  ]);

  return constantTimeEqual(candidateDigest, expectedDigest);
}

export async function createOwnerSessionToken(
  sessionSecret: string,
): Promise<string> {
  const nonce = new Uint8Array(18);
  crypto.getRandomValues(nonce);

  const payload: SessionPayload = {
    v: SESSION_VERSION,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    nonce: bytesToBase64Url(nonce),
  };
  const encodedPayload = bytesToBase64Url(
    textEncoder.encode(JSON.stringify(payload)),
  );
  const signature = bytesToBase64Url(
    await hmac(encodedPayload, sessionSecret),
  );

  return `${encodedPayload}.${signature}`;
}

export async function verifyOwnerSessionToken(
  token: string,
  sessionSecret: string,
): Promise<boolean> {
  const parts = token.split(".");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  const [encodedPayload, encodedSignature] = parts;
  const suppliedSignature = base64UrlToBytes(encodedSignature);

  if (!suppliedSignature) {
    return false;
  }

  const expectedSignature = await hmac(encodedPayload, sessionSecret);

  if (!constantTimeEqual(suppliedSignature, expectedSignature)) {
    return false;
  }

  const payloadBytes = base64UrlToBytes(encodedPayload);

  if (!payloadBytes) {
    return false;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(payloadBytes),
    ) as Partial<SessionPayload>;

    return (
      payload.v === SESSION_VERSION &&
      typeof payload.exp === "number" &&
      Number.isSafeInteger(payload.exp) &&
      payload.exp > Math.floor(Date.now() / 1000) &&
      typeof payload.nonce === "string" &&
      payload.nonce.length >= 16
    );
  } catch {
    return false;
  }
}

function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const cookieName = part.slice(0, separator).trim();

    if (cookieName === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return null;
}

export async function hasValidOwnerSession(
  request: Request,
  sessionSecret: string,
): Promise<boolean> {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  return token
    ? verifyOwnerSessionToken(token, sessionSecret)
    : Promise.resolve(false);
}

export function createOwnerSessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/api/owner",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join("; ");
}

export function clearOwnerSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/api/owner",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ].join("; ");
}
