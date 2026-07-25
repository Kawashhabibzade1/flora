export interface OwnerConfigurationStatus {
  auth: boolean;
  github: boolean;
}

export interface OwnerAuthConfiguration {
  password: string;
  sessionSecret: string;
}

export interface GitHubConfiguration {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

const MIN_OWNER_PASSWORD_LENGTH = 8;

function readSecret(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readTrimmedBinding(name: string): string | undefined {
  const value = readSecret(name)?.trim();
  return value ? value : undefined;
}

export function getOwnerAuthConfiguration(): OwnerAuthConfiguration | null {
  const password = readSecret("OWNER_PASSWORD");
  const sessionSecret = readSecret("OWNER_SESSION_SECRET");

  if (
    !password ||
    password.length < MIN_OWNER_PASSWORD_LENGTH ||
    !sessionSecret ||
    sessionSecret.length < 32
  ) {
    return null;
  }

  return { password, sessionSecret };
}

export function getGitHubConfiguration(): GitHubConfiguration | null {
  const token = readSecret("GITHUB_TOKEN");
  const owner = readTrimmedBinding("GITHUB_OWNER");
  const repo = readTrimmedBinding("GITHUB_REPO");
  const branch = readTrimmedBinding("GITHUB_BRANCH") ?? "main";

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo, branch };
}

export function getOwnerConfigurationStatus(): OwnerConfigurationStatus {
  return {
    auth: getOwnerAuthConfiguration() !== null,
    github: getGitHubConfiguration() !== null,
  };
}
