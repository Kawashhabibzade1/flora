import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function requestRoute(pathname = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const headers = {
    accept: "text/html",
    host: "flora.example",
    "x-forwarded-host": "flora.example",
    "x-forwarded-proto": "https",
    ...(init.headers ?? {}),
  };

  return worker.fetch(
    new Request(`https://flora.example${pathname}`, { ...init, headers }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

async function render() {
  return requestRoute("/");
}

test("server-renders the FLORA editorial homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>FLORA — Hijab &amp; Women’s Fashion<\/title>/i);
  assert.match(html, /Poise,/);
  assert.match(html, /in every/);
  assert.match(html, /A new language of modesty/);
  assert.match(html, /The new silhouettes/);
  assert.match(html, /Most loved/);
  assert.match(html, /Ivory Column/);
  assert.match(html, /Aurora Bloom Abaya/);
  assert.match(html, /\/images\/Hijabs\/9ab14720-0822-4800-bcc8-8471c152dd96\.JPG/);
  assert.match(html, /The full collection/);
  assert.match(html, /45 images/);
  assert.match(html, />دری<\/button>/);
  assert.doesNotMatch(html, />DR<\/button>/);
  assert.match(html, />EN<\/button>/);
  assert.match(html, />Dashboard<\/a>/);
  assert.match(html, /href="\/owner"/);
  assert.match(html, /social-rail--instagram/);
  assert.match(html, /social-rail--whatsapp/);
  assert.match(html, /social-rail--tiktok/);
  assert.match(html, /https:\/\/www\.instagram\.com\/flora\.hijab23/);
  assert.match(html, /https:\/\/whatsapp\.com\/channel\/0029VbCgrZb5PO15pQJGrB1X/);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@flora_hijab\.23/);
  assert.match(html, /Mazar-i-Shareef, Afghanistan/);
  assert.match(html, /Designed and developed by Mir Kawash Habibazada/);
  assert.match(
    html,
    /https:\/\/www\.linkedin\.com\/in\/kawash-habibzada-790964158\//,
  );
  assert.match(html, /https:\/\/flora\.example\/og\.png/);
  assert.doesNotMatch(html, /Berlin|Germany|Complimentary delivery/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("ships branded assets, interactions and accessible motion controls", async () => {
  const [page, layout, css, packageJson, hijabFiles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readdir(new URL("../public/images/Hijabs/", import.meta.url)),
  ]);

  await Promise.all([
    access(new URL("../public/images/flora-logo-full.png", import.meta.url)),
    access(new URL("../public/images/flora-logo-round.png", import.meta.url)),
    access(new URL("../public/images/Hijabs/9ab14720-0822-4800-bcc8-8471c152dd96.JPG", import.meta.url)),
    access(new URL("../public/images/Hijabs/d119ab5c-8f71-42aa-91f3-f4ecfe7cf6f6.JPG", import.meta.url)),
    access(new URL("../public/images/Hijabs/0081dc8a-1a8b-4aab-8073-ae084195cec5.JPG", import.meta.url)),
    access(new URL("../public/images/Hijabs/0c470774-9318-47ab-ad6d-ea154cfed48f.JPG", import.meta.url)),
    access(new URL("../public/images/Hijabs/9edfb055-ee5f-4096-a5b1-1a118d3d0a4a.JPG", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(page, /setMenuOpen/);
  assert.match(page, /setSelectedProduct/);
  assert.match(page, /submitNewsletter/);
  assert.match(page, /\/images\/Hijabs\//);
  assert.match(page, /collectionImages\.map/);
  assert.match(page, /fetch\("\/api\/collection"/);
  assert.match(page, /collectionImages\.length/);
  assert.match(page, /new URL\(image\.src, window\.location\.origin\)/);
  assert.match(page, /\[collectionImages\.length\]/);
  assert.match(page, /FaInstagram/);
  assert.match(page, /FaWhatsapp/);
  assert.match(page, /FaTiktok/);
  assert.doesNotMatch(page, /header-shop-link|Shop \/ Contact/);
  const collectionFiles = hijabFiles.filter((file) =>
    /\.(?:jpe?g|png|webp)$/i.test(file),
  );
  assert.equal(collectionFiles.length, 45);
  for (const filename of collectionFiles) {
    assert.ok(page.includes(filename), `collection is missing ${filename}`);
  }
  assert.doesNotMatch(page, /\/images\/(?:flora-hero|flora-collection|rose-garden|pearl-modal|sienna-silk|atelier-abaya)/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /summary_large_image/);
  assert.doesNotMatch(page, /announcement|Berlin|Germany/i);
  assert.doesNotMatch(layout, /Berlin|Germany/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes cinematic-drift/);
  assert.match(css, /\.collection-tile\.is-visible/);
  assert.match(css, /@keyframes social-pop/);
  assert.match(css, /\.social-rail/);
  assert.doesNotMatch(css, /\.announcement/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("ships a private owner portal and protected upload API", async () => {
  const [
    ownerPage,
    ownerCss,
    ownerAuth,
    uploadRoute,
    githubUpload,
    collectionRoute,
    collectionImageRoute,
    githubCollection,
    runtimeCache,
  ] =
    await Promise.all([
      readFile(new URL("../app/owner/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/owner/owner.module.css", import.meta.url), "utf8"),
      readFile(new URL("../lib/owner-auth.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../app/api/owner/upload/route.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../lib/github-image-upload.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../app/api/collection/route.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../app/api/collection/image/route.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../lib/github-collection.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../lib/runtime-cache.ts", import.meta.url),
        "utf8",
      ),
    ]);

  assert.match(ownerPage, /Welcome back,/);
  assert.match(ownerPage, /Commit image to GitHub/);
  assert.match(ownerPage, /image\/jpeg,image\/png,image\/webp/);
  assert.match(ownerPage, /appears automatically in the live/);
  assert.match(ownerPage, /no website deployment\s+is needed/);
  assert.match(ownerCss, /@keyframes draw-line/);
  assert.match(ownerCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(ownerAuth, /HttpOnly/);
  assert.match(ownerAuth, /Secure/);
  assert.match(ownerAuth, /SameSite=Strict/);
  assert.match(ownerAuth, /crypto\.subtle/);
  assert.match(uploadRoute, /hasValidOwnerSession/);
  assert.match(uploadRoute, /MAX_IMAGE_BYTES/);
  assert.match(ownerPage, /github-status/);
  assert.match(ownerPage, /GitHub connected/);
  assert.match(githubUpload, /Buffer\.from\(/);
  assert.match(githubUpload, /AbortSignal\.timeout\(90_000\)/);
  assert.match(githubUpload, /Contents: Read and write/);
  assert.doesNotMatch(githubUpload, /for \(const byte of chunk\)/);
  assert.match(collectionRoute, /listGitHubCollectionImages/);
  assert.match(collectionRoute, /signGitHubCollectionImages/);
  assert.match(collectionImageRoute, /hasValidCollectionImageSignature/);
  assert.match(collectionImageRoute, /Cross-Origin-Resource-Policy/);
  assert.match(collectionImageRoute, /max-age=31536000, immutable/);
  assert.match(githubCollection, /\/git\/trees\//);
  assert.match(githubCollection, /entry\.mode !== "100644"/);
  assert.match(githubCollection, /entry\.type !== "blob"/);
  assert.match(githubCollection, /crypto\.subtle\.sign/);
  assert.match(githubCollection, /crypto\.subtle\.verify/);
  assert.match(githubCollection, /redirect: "manual"/);
  assert.match(githubCollection, /hasExpectedMagicBytes/);
  assert.doesNotMatch(githubCollection, /download_url|html_url|Location/);
  assert.match(runtimeCache, /cache\.match/);
  assert.match(runtimeCache, /cache\.put/);

  const compiledUploader = ts.transpileModule(githubUpload, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const uploaderModule = await import(
    `data:text/javascript;base64,${Buffer.from(compiledUploader).toString("base64")}`,
  );
  const largeImageBytes = new Uint8Array(6 * 1024 * 1024);
  largeImageBytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const encodedLargeImage = uploaderModule.bytesToBase64(largeImageBytes);
  assert.equal(
    Buffer.from(encodedLargeImage, "base64").byteLength,
    largeImageBytes.byteLength,
  );
  assert.deepEqual(
    [...Buffer.from(encodedLargeImage, "base64").subarray(0, 8)],
    [...largeImageBytes.subarray(0, 8)],
  );

  const ownerResponse = await requestRoute("/owner");
  assert.equal(ownerResponse.status, 200);
  const ownerHtml = await ownerResponse.text();
  assert.match(ownerHtml, /<title>Private Atelier \| FLORA<\/title>/i);
  assert.match(ownerHtml, /Opening the private atelier/);
  assert.match(ownerHtml, /noindex/);

  const sessionResponse = await requestRoute("/api/owner/session", {
    headers: { accept: "application/json" },
  });
  assert.equal(sessionResponse.status, 200);
  assert.match(
    sessionResponse.headers.get("cache-control") ?? "",
    /no-store/i,
  );
  assert.deepEqual(await sessionResponse.json(), {
    authenticated: false,
    configured: { auth: false, github: false },
  });

  const collectionResponse = await requestRoute("/api/collection", {
    headers: { accept: "application/json" },
  });
  assert.equal(collectionResponse.status, 503);
  assert.match(
    collectionResponse.headers.get("cache-control") ?? "",
    /no-store/i,
  );
  assert.deepEqual(await collectionResponse.json(), {
    ok: false,
    error: {
      code: "COLLECTION_UNAVAILABLE",
      message: "The live collection is temporarily unavailable.",
    },
  });

  const traversalResponse = await requestRoute(
    "/api/collection/image?filename=..%2Fsecret.jpg",
    { headers: { accept: "image/*" } },
  );
  assert.equal(traversalResponse.status, 400);
  assert.match(
    traversalResponse.headers.get("cache-control") ?? "",
    /no-store/i,
  );

  const duplicateFilenameResponse = await requestRoute(
    "/api/collection/image?filename=photo.jpg&filename=other.jpg",
    { headers: { accept: "image/*" } },
  );
  assert.equal(duplicateFilenameResponse.status, 400);

  const crossSiteLogin = await requestRoute("/api/owner/login", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      origin: "https://attacker.example",
      "sec-fetch-site": "cross-site",
    },
    body: JSON.stringify({ password: "not-a-real-password" }),
  });
  assert.equal(crossSiteLogin.status, 403);

  const unconfiguredLogin = await requestRoute("/api/owner/login", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      origin: "https://flora.example",
    },
    body: JSON.stringify({ password: "not-a-real-password" }),
  });
  assert.equal(unconfiguredLogin.status, 503);

  process.env.OWNER_PASSWORD = "test12345";
  process.env.OWNER_SESSION_SECRET =
    "test-session-secret-that-is-longer-than-thirty-two-characters";

  try {
    const loginResponse = await requestRoute("/api/owner/login", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        origin: "https://flora.example",
      },
      body: JSON.stringify({
        password: "test12345",
      }),
    });
    assert.equal(loginResponse.status, 200);
    const cookie = loginResponse.headers.get("set-cookie") ?? "";
    assert.match(cookie, /flora_owner_session=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=Strict/i);

    const authenticatedSession = await requestRoute("/api/owner/session", {
      headers: {
        accept: "application/json",
        cookie: cookie.split(";")[0],
      },
    });
    assert.equal(authenticatedSession.status, 200);
    assert.equal((await authenticatedSession.json()).authenticated, true);

    const uploadWithoutCookie = await requestRoute("/api/owner/upload", {
      method: "POST",
      headers: {
        accept: "application/json",
        origin: "https://flora.example",
      },
      body: new FormData(),
    });
    assert.equal(uploadWithoutCookie.status, 401);
  } finally {
    delete process.env.OWNER_PASSWORD;
    delete process.env.OWNER_SESSION_SECRET;
  }
});
