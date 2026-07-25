import { hasValidOwnerSession } from "@/lib/owner-auth";
import { errorResponse, jsonResponse } from "@/lib/owner-api";
import {
  getGitHubConfiguration,
  getOwnerAuthConfiguration,
} from "@/lib/owner-env";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const auth = getOwnerAuthConfiguration();

  if (!auth || !(await hasValidOwnerSession(request, auth.sessionSecret))) {
    return errorResponse(
      401,
      "AUTHENTICATION_REQUIRED",
      "Log in as the owner before checking GitHub.",
    );
  }

  const github = getGitHubConfiguration();

  if (!github) {
    return errorResponse(
      503,
      "GITHUB_NOT_CONFIGURED",
      "GitHub image upload is not configured on the server.",
    );
  }

  const repository = `${encodeURIComponent(github.owner)}/${encodeURIComponent(
    github.repo,
  )}`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/branches/${encodeURIComponent(
        github.branch,
      )}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${github.token}`,
          "User-Agent": "flora-owner-upload",
          "X-GitHub-Api-Version": "2026-03-10",
        },
        signal: AbortSignal.timeout(12_000),
      },
    );

    if (!response.ok) {
      return errorResponse(
        502,
        "GITHUB_CONNECTION_FAILED",
        "The configured GitHub repository, branch or token could not be verified.",
        { githubStatus: response.status },
      );
    }

    return jsonResponse({
      connected: true,
      repository: `${github.owner}/${github.repo}`,
      branch: github.branch,
    });
  } catch {
    return errorResponse(
      502,
      "GITHUB_CONNECTION_FAILED",
      "GitHub could not be reached in time. Please try again.",
    );
  }
}
