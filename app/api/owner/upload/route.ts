import {
  GitHubUploadError,
  MAX_IMAGE_BYTES,
  uploadImageToGitHub,
  validateImage,
} from "@/lib/github-image-upload";
import { hasValidOwnerSession } from "@/lib/owner-auth";
import {
  errorResponse,
  isSameOriginMutation,
  jsonResponse,
} from "@/lib/owner-api";
import {
  getGitHubConfiguration,
  getOwnerAuthConfiguration,
  getOwnerConfigurationStatus,
} from "@/lib/owner-env";

export const dynamic = "force-dynamic";

const MAX_MULTIPART_OVERHEAD_BYTES = 128 * 1024;

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return errorResponse(
      403,
      "CROSS_SITE_REQUEST",
      "Cross-site upload requests are not allowed.",
    );
  }

  const authConfiguration = getOwnerAuthConfiguration();
  const configured = getOwnerConfigurationStatus();

  if (!authConfiguration) {
    return errorResponse(
      503,
      "AUTH_NOT_CONFIGURED",
      "Owner login is not configured on the server.",
      { configured },
    );
  }

  if (
    !(await hasValidOwnerSession(
      request,
      authConfiguration.sessionSecret,
    ))
  ) {
    return errorResponse(
      401,
      "AUTHENTICATION_REQUIRED",
      "Log in as the owner before uploading an image.",
    );
  }

  const githubConfiguration = getGitHubConfiguration();

  if (!githubConfiguration) {
    return errorResponse(
      503,
      "GITHUB_NOT_CONFIGURED",
      "GitHub image upload is not configured on the server.",
      { configured },
    );
  }

  const contentLength = Number(request.headers.get("Content-Length"));

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_IMAGE_BYTES + MAX_MULTIPART_OVERHEAD_BYTES
  ) {
    return errorResponse(
      413,
      "IMAGE_TOO_LARGE",
      "The selected image is larger than 10 MB.",
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      400,
      "INVALID_MULTIPART_FORM",
      "Send the image as multipart form data.",
    );
  }

  const files = formData.getAll("file");

  if (files.length !== 1 || !(files[0] instanceof File)) {
    return errorResponse(
      400,
      "IMAGE_REQUIRED",
      "Select exactly one image in the file field.",
    );
  }

  try {
    const { bytesPromise, extension } = validateImage(files[0]);
    const bytes = await bytesPromise;
    const uploaded = await uploadImageToGitHub(
      bytes,
      extension,
      githubConfiguration,
    );

    return jsonResponse(
      { ok: true, ...uploaded },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RangeError) {
      return errorResponse(413, "IMAGE_TOO_LARGE", error.message);
    }

    if (error instanceof TypeError) {
      return errorResponse(415, "INVALID_IMAGE", error.message);
    }

    if (error instanceof GitHubUploadError) {
      return errorResponse(
        502,
        "GITHUB_UPLOAD_FAILED",
        error.message,
        {
          githubStatus: error.githubStatus,
          requestId: error.requestId,
        },
      );
    }

    return errorResponse(
      500,
      "UPLOAD_FAILED",
      "The image could not be uploaded.",
    );
  }
}
