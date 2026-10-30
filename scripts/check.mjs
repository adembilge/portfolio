import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { Script } from "node:vm";
import { execFileSync } from "node:child_process";
import { collectSite, pages } from "./site-files.mjs";
import { generate } from "./localize.mjs";

const root = resolve(import.meta.dirname, "..");
generate(true);
const files = pages;
const errors = [];
const site = collectSite();
errors.push(...site.errors);
let references = 0;
const ids = new Map();
for (const file of files) {
  const html = readFileSync(join(root, file), "utf8");
  const found = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
  ids.set(file, new Set(found));
  if (new Set(found).size !== found.length)
    errors.push(`${file}: duplicate IDs`);
  if ([...html.matchAll(/<h1(?:\s|>)/g)].length !== 1)
    errors.push(`${file}: expected one h1`);
  if (!html.includes('name="description"'))
    errors.push(`${file}: missing meta description`);
  if (!html.includes('rel="canonical"'))
    errors.push(`${file}: missing canonical URL`);
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]*"/.test(img[0]))
      errors.push(`${file}: image has no alt attribute`);
    if (!/\bwidth="\d+"/.test(img[0]) || !/\bheight="\d+"/.test(img[0]))
      errors.push(`${file}: image dimensions missing`);
  }
}
for (const file of files) {
  const html = readFileSync(join(root, file), "utf8");
  for (const match of html.matchAll(
    /(?:href|src|data-src|data-demo)="([^"]+)"/g,
  )) {
    const ref = match[1].replaceAll("&amp;", "&");
    if (/^(?:https?:|mailto:|data:)/.test(ref)) continue;
    const [path, fragment] = ref.split("#");
    const name = path
      ? resolve(
          dirname(join(root, file)),
          decodeURIComponent(path.split("?")[0]),
        )
      : join(root, file);
    references++;
    if (!existsSync(name)) {
      errors.push(`${file}: missing ${ref}`);
      continue;
    }
    const key = name.slice(root.length + 1).replaceAll("\\", "/");
    if (fragment && ids.has(key) && !ids.get(key).has(fragment))
      errors.push(`${file}: missing target ${ref}`);
  }
}
for (const file of [
  "js/motion-preference.js",
  "js/portfolio.js",
  "js/motion.js",
  "js/preferences.js",
]) {
  try {
    new Script(readFileSync(join(root, file), "utf8"), { filename: file });
  } catch (error) {
    errors.push(error.message);
  }
}
// Preserve all original professional destinations. Run this when Git history is available.
try {
  const original = execFileSync("git", ["show", "HEAD:index.html"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const current = readFileSync(join(root, "index.html"), "utf8");
  const urls = [
    ...new Set([...original.matchAll(/href="([^"]+)"/g)].map((x) => x[1])),
  ].filter(
    (x) =>
      /^(https?:|mailto:)/.test(x) &&
      // These two project rows were explicitly removed from Selected work.
      !["https://github.com/adembilge/TidyEdit", "https://github.com/adembilge/Quantization-Dithering-and-Color-Transforming"].includes(x) &&
      !x.includes("fonts.googleapis.com") &&
      !x.includes("fonts.gstatic.com"),
  );
  // The ULAK role now links to its SD-WAN product at the user's request.
  const replacements = new Map([
    ["https://drive.google.com/file/d/1ys39d1oD9EsqbKiRuj7r-zCJSb8d4q0g/view?usp=sharing", "https://drive.google.com/file/d/1SU4Akrs10lnI31IMvst_2y5pDVThCM8S/view?usp=sharing"],
    ["https://www.ulakhaberlesme.com.tr/en/cozumler/5g-private-network-en/", "https://www.ulakhaberlesme.com.tr/en/urun/sd-wan-en/"],
  ]);
  for (const url of urls)
    if (!current.includes(replacements.get(url) || url))
      errors.push(`Original professional link lost: ${url}`);
  console.log(`Preserved ${urls.length} original professional destinations.`);
} catch (error) {
  console.log(
    "Git baseline unavailable; static integrity checks still completed.",
  );
}
const size = (name) => statSync(join(root, name)).size;
try {
  for (const test of ["test-motion.mjs", "test-preferences.mjs", "test-profile.mjs"])
    execFileSync(process.execPath, [join(root, "scripts", test)], { stdio: "inherit" });
} catch {
  errors.push("JavaScript or preference regression checks failed.");
}
console.log(
  `Checked ${files.length} pages, ${references} local references, JavaScript syntax, headings, metadata, and image alternatives.`,
);
console.log(`Verified ${site.files.length} deployable files, including CSS URLs, responsive images, and exact filename capitalization.`);
console.log(
  `Homepage: ${size("index.html")} bytes. CSS: ${size("css/portfolio.css")} bytes. JavaScript: ${size("js/portfolio.js")} bytes.`,
);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("PASS: static integrity checks.");
