import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { root, pages, canonicalBase, collectSite } from "./site-files.mjs";

const site = collectSite();
assert.deepEqual(site.errors, [], "Source references must pass before testing Pages.");
const output = resolve(root, "dist");
const manifest = new Set(site.files);
const built = readdirSync(output, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name).slice(output.length + 1).replaceAll("\\", "/")).sort();
assert.deepEqual(built, site.files, "Build must contain only the deployable site files.");
const base = new URL(process.env.SITE_URL || canonicalBase).href.replace(/\/*$/, "/");
for (const page of pages) {
  const html = readFileSync(join(output, page), "utf8");
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  assert.equal(canonical, base + (page === "index.html" ? "" : page), `Canonical URL: ${page}`);
}
assert.ok(readFileSync(join(output, "robots.txt"), "utf8").includes(base + "sitemap.xml"));
assert.ok(readFileSync(join(output, "sitemap.xml"), "utf8").includes(`<loc>${base}</loc>`));

const server = createServer((request, response) => {
  let path;
  try { path = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400).end(); return; }
  if (path.startsWith("/portfolio/")) path = path.slice("/portfolio".length);
  const file = path === "/" ? "index.html" : path.slice(1);
  // Exact manifest lookup emulates the case-sensitive paths served by GitHub Pages.
  if (!manifest.has(file)) { response.writeHead(404).end(); return; }
  response.writeHead(200).end(readFileSync(join(output, file)));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const prefix of ["/", "/portfolio/"]) {
    for (const file of site.files) {
      const response = await fetch(new URL(prefix + file, origin));
      assert.equal(response.status, 200, `Missing deployed file: ${prefix}${file}`);
    }
    for (const { file, ref } of site.links) {
      if (ref.startsWith("/")) continue; // Canonical social-preview metadata.
      const url = new URL(ref, origin + prefix + file);
      assert.ok(url.pathname.startsWith(prefix), `Link escaped project prefix: ${file}: ${ref}`);
      const response = await fetch(url);
      assert.equal(response.status, 200, `Broken deployed reference: ${url}`);
    }
    for (const privatePath of [".git/config", ".github/workflows/static.yml", "docs/image-sources.md", "README.md", "css/Portfolio.css"])
      assert.equal((await fetch(origin + prefix + privatePath)).status, 404);
    console.log(`PASS ${prefix}: ${site.files.length} files and ${site.references} relative references; repository files excluded.`);
  }
  console.log(`PASS production canonical URLs, sitemap, and robots.txt for ${base}`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
