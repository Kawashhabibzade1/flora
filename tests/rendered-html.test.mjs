import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: {
        accept: "text/html",
        host: "flora.example",
        "x-forwarded-host": "flora.example",
        "x-forwarded-proto": "https",
      },
    }),
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
  assert.match(html, /Instagram · @flora\.hijab23/);
  assert.match(html, /WhatsApp · FLORA/);
  assert.match(html, /TikTok · @flora_hijab\.23/);
  assert.match(html, /Mazar-i-Shareef, Afghanistan/);
  assert.match(html, /https:\/\/flora\.example\/og\.png/);
  assert.doesNotMatch(html, /Berlin|Germany|Complimentary delivery/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("ships branded assets, interactions and accessible motion controls", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
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
  assert.doesNotMatch(page, /\/images\/(?:flora-hero|flora-collection|rose-garden|pearl-modal|sienna-silk|atelier-abaya)/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /summary_large_image/);
  assert.doesNotMatch(page, /announcement|Berlin|Germany/i);
  assert.doesNotMatch(layout, /Berlin|Germany/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes cinematic-drift/);
  assert.doesNotMatch(css, /\.announcement/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
