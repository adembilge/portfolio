import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const englishPages = ["index.html"];
const normalize = (text) => text.replace(/\s+/g, " ").trim();
// Translate marked rich paragraphs as a unit so emphasis does not change
// Italian word order or spacing around apostrophes and punctuation.
const tokens = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<p\b(?=[^>]*\bdata-i18n-rich\b)[^>]*>[\s\S]*?<\/p>|<[^>]+>|[^<]+/g;
const attributes = /\b(alt|data-alt|aria-label|placeholder|title)="([^"]+)"/g;
const meaningful = (text) => /[a-zA-Z]/.test(text);

export function units(html) {
  const result = [];
  for (const token of html.match(tokens) || []) {
    if (token.startsWith("<script") || token.startsWith("<!--")) continue;
    if (token.startsWith("<")) {
      if (token.startsWith("<p") && token.includes("data-i18n-rich"))
        result.push(normalize(token.replace(/^<p\b[^>]*>|<\/p>$/g, "")));
      for (const match of token.matchAll(attributes)) if (meaningful(match[2])) result.push(normalize(match[2]));
      if (token.startsWith("<meta") && /(?:name="description"|property="og:(?:title|description)")/.test(token))
        result.push(normalize(token.match(/content="([^"]+)"/)[1]));
    } else if (meaningful(token)) result.push(normalize(token));
  }
  return [...new Set(result)];
}

export function translate(html, file, dictionary) {
  const missing = [];
  const text = (value) => {
    const key = normalize(value);
    if (!meaningful(key)) return value;
    if (!(key in dictionary)) { missing.push(key); return value; }
    const escaped = dictionary[key].replace(/&(?!(?:amp|quot|lt|gt|#\d+);)/g, "&amp;");
    return value.slice(0, value.indexOf(value.trim())) + escaped + value.slice(value.trimEnd().length);
  };
  let output = html.replace(tokens, (token) => {
    if (token.startsWith("<script") || token.startsWith("<!--")) return token;
    if (token.startsWith("<p") && token.includes("data-i18n-rich"))
      return token.replace(/^(<p\b[^>]*>)([\s\S]*?)(<\/p>)$/, (_, open, content, close) => open + text(content) + close);
    if (!token.startsWith("<")) return text(token);
    let tag = token.replace(attributes, (_, name, value) => `${name}="${text(value).replaceAll('"', '&quot;')}"`);
    if (tag.startsWith("<meta") && /(?:name="description"|property="og:(?:title|description)")/.test(tag))
      tag = tag.replace(/content="([^"]+)"/, (_, value) => `content="${text(value).replaceAll('"', '&quot;')}"`);
    return tag;
  });
  if (missing.length) throw Error(`${file}: missing Italian translations:\n${[...new Set(missing)].join("\n")}`);
  output = output.replace('<html lang="en">', '<html lang="it">');
  const destination = `it/${file}`;
  // Rebase all local URLs from the English page to its Italian counterpart.
  output = output.replace(/\b(href|src|data-src|data-demo)="([^"]+)"/g, (original, attribute, ref) => {
    if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(ref)) return original;
    const [, pathname, suffix] = ref.match(/^([^?#]*)(.*)$/);
    let target = posix.normalize(posix.join(posix.dirname(file), pathname));
    if (englishPages.includes(target)) target = `it/${target}`;
    // Language switches on the translated page point back to the same English route.
    if (target === `it/${file}` && ref.includes("it/")) target = file;
    return `${attribute}="${posix.relative(posix.dirname(destination), target)}${suffix}"`;
  });
  output = output.replace(/\bsrcset="([^"]+)"/g, (_, value) => `srcset="${value.split(",").map((candidate) => {
    const [ref, descriptor] = candidate.trim().split(/\s+/);
    const target = posix.normalize(posix.join(posix.dirname(file), ref));
    return `${posix.relative(posix.dirname(destination), target)} ${descriptor}`;
  }).join(", ")}"`);
  const canonical = `https://adembilge.dev/${destination}`;
  output = output.replace(/(<link\s+rel="canonical"\s+href=")[^"]+/, `$1${canonical}`)
    .replace(/(<meta property="og:url" content=")[^"]+/, `$1${canonical}`)
    .replace(/class="language-switch"([^>]+)lang="it" hreflang="it"[^>]*>IT</g,
      'class="language-switch"$1lang="en" hreflang="en" aria-label="Read in English" title="English">EN<');
  // Role fragments need a different word order in Italian.
  output = output.replace(/<span class="accent">Software<\/span>\s*Ingegnere/g, '<span class="accent">Ingegnere</span> software')
    .replace(/<span class="accent">Machine Learning<\/span>\s*Ingegnere/g, '<span class="accent">Ingegnere</span> machine learning');
  return output;
}

export function generate(check = false) {
  const dictionary = JSON.parse(readFileSync(join(root, "locales/it.json"), "utf8"));
  for (const file of englishPages) {
    const translated = translate(readFileSync(join(root, file), "utf8"), file, dictionary);
    const destination = join(root, "it", file);
    if (check) {
      if (readFileSync(destination, "utf8") !== translated) throw Error(`Run npm run localize: Italian page is stale: it/${file}`);
    } else {
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, translated);
    }
  }
  console.log(`PASS: ${englishPages.length} complete Italian pages ${check ? "verified" : "generated"}.`);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) generate(process.argv.includes("--check"));
