import { hasValidOwnerSession } from "@/lib/owner-auth";
import { jsonResponse } from "@/lib/owner-api";
import {
  getOwnerAuthConfiguration,
  getOwnerConfigurationStatus,
} from "@/lib/owner-env";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const configuration = getOwnerAuthConfiguration();
  const configured = getOwnerConfigurationStatus();
  const authenticated = configuration
    ? await hasValidOwnerSession(request, configuration.sessionSecret)
    : false;

  return jsonResponse({ authenticated, configured }, { status: 200 });
}
