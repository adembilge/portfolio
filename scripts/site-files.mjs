import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, posix, resolve } from "node:path";

export const root = resolve(import.meta.dirname, "..");
export const pages = ["index.html", ...readdirSync(join(root, "blog"))
  .filter((name) => name.endsWith(".html")).map((name) => `blog/${name}`)];
export const canonicalBase = "https://adembilge.dev/";

function references(file, source) {
  const found = [];
  const add = (ref, metadata = false) => found.push({ ref, metadata });
  if (file.endsWith(".html")) {
    for (const match of source.matchAll(/\b(?:href|src|data-src|data-demo)="([^"]+)"/g))
      add(match[1]);
    for (const match of source.matchAll(/\bsrcset="([^"]+)"/g))
      for (const candidate of match[1].split(","))
        add(candidate.trim().replace(/\s+\d+(?:\.\d+)?[wx]$/, ""));
    for (const match of source.matchAll(/<meta\b[^>]*>/g)) {
      if (!/(?:og:image|twitter:image)/.test(match[0])) continue;
      const url = match[0].match(/\bcontent="([^"]+)"/)?.[1];
      if (url?.startsWith(canonicalBase)) add("/" + url.slice(canonicalBase.length), true);
    }
  }
  if (file.endsWith(".css"))
    for (const match of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g))
      add(match[1] ?? match[2] ?? match[3]);
  return found;
}

function exactPath(path) {
  let directory = root;
  for (const segment of path.split("/")) {
    if (!readdirSync(directory).includes(segment)) return false;
    directory = join(directory, segment);
    if (lstatSync(directory).isSymbolicLink()) return false;
  }
  return lstatSync(directory).isFile();
}

export function collectSite() {
  const files = new Set();
  const errors = [];
  const links = [];
  const queue = [...pages, "robots.txt", "sitemap.xml", ".nojekyll", "fonts/OFL.txt"];
  if (existsSync(join(root, "CNAME"))) queue.push("CNAME");
  while (queue.length) {
    const file = queue.shift();
    if (files.has(file)) continue;
    try {
      if (!exactPath(file)) {
        errors.push(`Missing file, incorrect capitalization, or symlink: ${file}`);
        continue;
      }
    } catch {
      errors.push(`Missing file: ${file}`);
      continue;
    }
    files.add(file);
    if (!/\.(?:html|css)$/.test(file)) continue;
    const source = readFileSync(join(root, file), "utf8");
    for (const { ref: original, metadata } of references(file, source)) {
      const ref = original.replaceAll("&amp;", "&");
      if (!ref || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref)) continue;
      // Only social-preview metadata is deliberately rooted at the canonical site.
      if (ref.startsWith("/") && !metadata) {
        errors.push(`${file}: root-relative link breaks repository Pages URLs: ${ref}`);
        continue;
      }
      const [pathname] = ref.split(/[?#]/);
      let decoded;
      try { decoded = decodeURIComponent(pathname); }
      catch { errors.push(`${file}: invalid URL encoding: ${ref}`); continue; }
      if (decoded.includes("\\")) {
        errors.push(`${file}: use URL forward slashes: ${ref}`);
        continue;
      }
      const target = metadata ? decoded.slice(1) : decoded
        ? posix.normalize(posix.join(posix.dirname(file), decoded)) : file;
      if (target === ".." || target.startsWith("../")) {
        errors.push(`${file}: reference escapes site: ${ref}`);
        continue;
      }
      const fragment = ref.includes("#") ? ref.slice(ref.indexOf("#") + 1) : "";
      links.push({ file, ref, target, fragment });
      queue.push(target);
    }
  }
  for (const {file, ref, target, fragment} of links) {
    if (!fragment || !target.endsWith(".html") || !files.has(target)) continue;
    const ids = [...readFileSync(join(root, target), "utf8").matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    if (!ids.includes(decodeURIComponent(fragment))) errors.push(`${file}: missing anchor ${ref}`);
  }
  return { files: [...files].sort(), errors: [...new Set(errors)], references: links.length, links };
}
