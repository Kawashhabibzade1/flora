"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaArrowUpFromBracket,
  FaCheck,
  FaGithub,
  FaLock,
  FaRightFromBracket,
} from "react-icons/fa6";
import styles from "./owner.module.css";

type Configuration = {
  auth: boolean;
  github: boolean;
};

type SessionResponse = {
  authenticated?: boolean;
  configured?: Configuration;
  error?: { message?: string };
};

type UploadResponse = {
  ok?: boolean;
  filename?: string;
  path?: string;
  githubUrl?: string;
  error?: { message?: string };
};

const initialConfiguration: Configuration = {
  auth: false,
  github: false,
};

function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadFallbackMessage(status: number): string {
  if (status === 401) {
    return "Your owner session expired. Please sign in and try again.";
  }

  if (status === 413) {
    return "The image is too large. Choose an image of 10 MB or less.";
  }

  if (status === 415) {
    return "Choose a valid JPEG, PNG or WebP image.";
  }

  if (status >= 500) {
    return `The upload service returned HTTP ${status}. Your image was not saved; please try again.`;
  }

  return "The image could not be uploaded. Please try again.";
}

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function OwnerPage() {
  const [booting, setBooting] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] =
    useState<Configuration>(initialConfiguration);
  const [githubVerified, setGithubVerified] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef("");

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/owner/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const payload = await readJson<SessionResponse>(response);

        if (!active) return;
        setAuthenticated(Boolean(payload?.authenticated));
        setConfigured(payload?.configured ?? initialConfiguration);
      } catch {
        if (active) {
          setError("The private atelier could not be reached. Please try again.");
        }
      } finally {
        if (active) setBooting(false);
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authenticated || !configured.github) {
      return;
    }

    let active = true;

    const verifyGitHub = async () => {
      try {
        const response = await fetch("/api/owner/github-status", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (active) setGithubVerified(response.ok);
      } catch {
        if (active) setGithubVerified(false);
      }
    };

    void verifyGitHub();
    return () => {
      active = false;
    };
  }, [authenticated, configured.github]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const updatePreview = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextUrl = file ? URL.createObjectURL(file) : "";
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  };

  const chooseFile = (file: File | null) => {
    setError("");
    setMessage("");
    setUploaded(null);

    if (!file) {
      setSelectedFile(null);
      updatePreview(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSelectedFile(null);
      updatePreview(null);
      setError("Choose a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      updatePreview(null);
      setError("The image must be 10 MB or smaller.");
      return;
    }

    setSelectedFile(file);
    updatePreview(file);
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/owner/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await readJson<SessionResponse>(response);

      if (!response.ok) {
        setError(
          payload?.error?.message ??
            "The atelier could not be unlocked. Please try again.",
        );
        return;
      }

      setPassword("");
      setAuthenticated(true);
      setMessage("Welcome back. The private atelier is open.");

      const sessionResponse = await fetch("/api/owner/session", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const session = await readJson<SessionResponse>(sessionResponse);
      setConfigured(session?.configured ?? configured);
    } catch {
      setError("The private atelier could not be reached. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const submitUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    setWorking(true);
    setError("");
    setMessage("Creating the GitHub commit…");
    setUploaded(null);

    try {
      const data = new FormData();
      data.append("file", selectedFile);
      const response = await fetch("/api/owner/upload", {
        method: "POST",
        credentials: "same-origin",
        body: data,
      });
      const payload = await readJson<UploadResponse>(response);

      if (!response.ok) {
        if (response.status === 401) setAuthenticated(false);
        setMessage("");
        setError(
          payload?.error?.message ??
            uploadFallbackMessage(response.status),
        );
        return;
      }

      setUploaded(payload);
      setMessage("The image was committed to GitHub successfully.");
      setSelectedFile(null);
      updatePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setMessage("");
      setError("The upload connection was interrupted. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const logout = async () => {
    setWorking(true);
    setError("");

    try {
      await fetch("/api/owner/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setAuthenticated(false);
      setSelectedFile(null);
      updatePreview(null);
      setUploaded(null);
      setMessage("");
      setWorking(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    chooseFile(event.dataTransfer.files.item(0));
  };

  return (
    <main className={styles.portal}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Back to FLORA">
          <img src="/images/flora-logo-round.png" alt="" />
          <span>
            FLORA
            <small>Private atelier</small>
          </span>
        </Link>
        <Link className={styles.backLink} href="/">
          <FaArrowLeft aria-hidden="true" />
          View website
        </Link>
      </header>

      <section className={styles.stage}>
        <div className={styles.portrait} aria-hidden="true">
          <span className={styles.portraitIndex}>FLORA · PRIVATE 01</span>
          <svg viewBox="0 0 560 720" role="presentation">
            <path
              className={styles.arch}
              d="M80 690V292C80 151 165 60 280 60s200 91 200 232v398"
            />
            <path
              className={styles.hijabBack}
              d="M302 132c-92 6-159 83-159 183 0 71 30 112 6 191-17 57-54 113-20 184h300c18-66-16-116-40-168-29-65 28-142 8-234-20-91-78-161-95-156Z"
            />
            <path
              className={styles.face}
              d="M300 190c-46 9-79 49-76 103 2 32 18 59 42 76 17 12 26 34 22 54l-7 33c43 14 80 6 111-19l-34-68c20-27 31-61 24-97-10-51-43-91-82-82Z"
            />
            <path
              className={styles.profileLine}
              d="M300 212c-25 24-31 60-18 91 8 20 25 30 45 36 11 3 20 12 20 24"
            />
            <path
              className={styles.hijabLine}
              d="M198 264c53 6 96-25 119-82M170 387c45-4 85 21 113 68 32 54 91 88 138 105"
            />
            <path
              className={styles.fabricLine}
              d="M119 690c57-88 82-183 75-282M429 690c-22-89-65-158-135-209"
            />
          </svg>
          <div className={styles.petals}>
            <i />
            <i />
            <i />
          </div>
          <p>
            A quiet place for
            <br />
            new FLORA chapters.
          </p>
        </div>

        <div className={styles.panel}>
          {booting ? (
            <div className={styles.loading} aria-live="polite">
              <span />
              <p>Opening the private atelier…</p>
            </div>
          ) : authenticated ? (
            <div className={styles.workspace}>
              <div className={styles.panelTopline}>
                <span>Owner studio</span>
                <button type="button" onClick={logout} disabled={working}>
                  <FaRightFromBracket aria-hidden="true" />
                  Sign out
                </button>
              </div>

              <p className={styles.eyebrow}>Collection archive · upload</p>
              <h1>
                Add a new
                <br />
                <em>FLORA piece.</em>
              </h1>
              <p className={styles.intro}>
                Choose one finished product image. It will be validated and
                committed directly to the configured GitHub collection.
              </p>

              <div className={styles.statusRow} aria-label="Connection status">
                <span data-ready={configured.auth}>
                  <i>{configured.auth ? <FaCheck /> : "!"}</i>
                  Owner access
                </span>
                <span data-ready={githubVerified === true}>
                  <i>{githubVerified === true ? <FaCheck /> : "!"}</i>
                  {githubVerified === null
                    ? "GitHub checking"
                    : githubVerified
                      ? "GitHub connected"
                      : "GitHub unavailable"}
                </span>
              </div>

              <form className={styles.uploadForm} onSubmit={submitUpload}>
                <label
                  className={`${styles.dropzone} ${
                    dragActive ? styles.dropzoneActive : ""
                  }`}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      chooseFile(event.target.files?.item(0) ?? null)
                    }
                  />
                  {previewUrl ? (
                    <span className={styles.preview}>
                      <img src={previewUrl} alt="Selected upload preview" />
                      <span>
                        <strong>{selectedFile?.name}</strong>
                        <small>
                          {selectedFile ? fileSize(selectedFile.size) : ""}
                        </small>
                      </span>
                    </span>
                  ) : (
                    <span className={styles.dropzonePrompt}>
                      <i>
                        <FaArrowUpFromBracket aria-hidden="true" />
                      </i>
                      <span>
                        <strong>Drop the image here</strong>
                        <small>or click to choose · JPEG, PNG, WebP · max 10 MB</small>
                      </span>
                    </span>
                  )}
                </label>

                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={
                    working ||
                    !selectedFile ||
                    !configured.github ||
                    githubVerified !== true
                  }
                >
                  <FaGithub aria-hidden="true" />
                  <span>{working ? "Uploading…" : "Commit image to GitHub"}</span>
                  <i aria-hidden="true">↗</i>
                </button>
              </form>

              {!configured.github && (
                <p className={styles.configurationNote}>
                  GitHub is not connected yet. Add the repository and token as
                  protected hosting secrets before uploading.
                </p>
              )}

              {configured.github && githubVerified === false && (
                <p className={styles.configurationNote}>
                  The repository, branch or GitHub token could not be verified.
                  Replace the token before uploading.
                </p>
              )}

              {uploaded?.githubUrl && (
                <div className={styles.successCard}>
                  <span>
                    <FaCheck aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{uploaded.filename}</strong>
                    <p>
                      Saved to GitHub. It appears automatically in the live
                      collection within about a minute; no website deployment
                      is needed.
                    </p>
                    <a
                      href={uploaded.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open GitHub commit ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form className={styles.loginForm} onSubmit={submitLogin}>
              <p className={styles.eyebrow}>FLORA · owner access</p>
              <h1>
                Welcome back,
                <br />
                <em>enter softly.</em>
              </h1>
              <p className={styles.intro}>
                This private space is reserved for the FLORA owner and new
                collection uploads.
              </p>

              <label className={styles.passwordField}>
                <span>Owner password</span>
                <i>
                  <FaLock aria-hidden="true" />
                </i>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your private password"
                  required
                  disabled={working || !configured.auth}
                />
              </label>

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={working || !configured.auth || password.length === 0}
              >
                <FaLock aria-hidden="true" />
                <span>{working ? "Unlocking…" : "Enter the atelier"}</span>
                <i aria-hidden="true">→</i>
              </button>

              {!configured.auth && (
                <p className={styles.configurationNote}>
                  Owner login is ready in the website code and awaits its
                  protected password and session secrets.
                </p>
              )}
            </form>
          )}

          <div className={styles.feedback} aria-live="polite" aria-atomic="true">
            {error && <p data-kind="error">{error}</p>}
            {!error && message && <p data-kind="success">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
