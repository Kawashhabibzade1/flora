import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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
  assert.match(html, /The full collection/);
  assert.match(html, /43 images/);
  assert.match(html, />DR<\/button>/);
  assert.match(html, />EN<\/button>/);
  assert.match(html, /social-rail--instagram/);
  assert.match(html, /social-rail--whatsapp/);
  assert.match(html, /social-rail--tiktok/);
  assert.match(html, /https:\/\/www\.instagram\.com\/flora\.hijab23/);
  assert.match(html, /https:\/\/whatsapp\.com\/channel\/0029VbCgrZb5PO15pQJGrB1X/);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@flora_hijab\.23/);
  assert.match(html, /Mazar-i-Shareef, Afghanistan/);
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
  assert.match(page, /FaInstagram/);
  assert.match(page, /FaWhatsapp/);
  assert.match(page, /FaTiktok/);
  assert.doesNotMatch(page, /header-shop-link|Shop \/ Contact/);
  assert.equal(hijabFiles.filter((file) => /\.jpe?g$/i.test(file)).length, 43);
  for (const filename of hijabFiles.filter((file) => /\.jpe?g$/i.test(file))) {
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
