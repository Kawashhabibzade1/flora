import { clearOwnerSessionCookie } from "@/lib/owner-auth";
import {
  errorResponse,
  isSameOriginMutation,
  jsonResponse,
} from "@/lib/owner-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return errorResponse(
      403,
      "CROSS_SITE_REQUEST",
      "Cross-site logout requests are not allowed.",
    );
  }

  return jsonResponse(
    { ok: true, authenticated: false },
    {
      status: 200,
      headers: { "Set-Cookie": clearOwnerSessionCookie() },
    },
  );
}
