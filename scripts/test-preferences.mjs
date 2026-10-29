import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";
import { englishPages, root } from "./localize.mjs";
import { join, posix } from "node:path";

const source = readFileSync(join(root, "js/preferences.js"), "utf8");
function preview({ saved, blocked = false, lang = "en" } = {}) {
  const handlers = new Map();
  const storage = new Map(saved ? [["portfolio-theme", saved]] : []);
  const buttons = [0, 1].map(() => ({
    hidden: true, attributes: {}, listeners: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
  }));
  const language = { href: "it/index.html", getAttribute() { return this.href; } };
  const meta = { setAttribute(name, value) { this[name] = value; } };
  const document = {
    documentElement: { lang, dataset: {} },
    querySelectorAll(selector) { return selector === ".theme-toggle" ? buttons : selector === ".language-switch" ? [language] : []; },
    querySelector() { return meta; },
    addEventListener(name, callback) { handlers.set(name, callback); },
    dispatchEvent() {},
  };
  const context = createContext({
    document, URL, Event,
    location: { href: "https://example.com/portfolio/index.html?motion=full#education", hash: "#education" },
    localStorage: {
      getItem(key) { if (blocked) throw Error("Blocked"); return storage.get(key); },
      setItem(key, value) { if (blocked) throw Error("Blocked"); storage.set(key, value); },
    },
    addEventListener(name, callback) { handlers.set(name, callback); },
  });
  new Script(source).runInContext(context);
  return { document, handlers, storage, buttons, meta, language };
}
for (const saved of [undefined, "invalid", "dark", "light"]) {
  const page = preview({ saved });
  assert.equal(page.document.documentElement.dataset.theme, saved === "light" ? "light" : "dark", "Theme restored before CSS loads");
  page.handlers.get("DOMContentLoaded")();
  assert.ok(page.buttons.every((button) => !button.hidden));
  page.buttons[0].listeners.click();
  const next = saved === "light" ? "dark" : "light";
  assert.equal(page.storage.get("portfolio-theme"), next);
  assert.ok(page.buttons.every((button) => button.attributes["aria-pressed"] === String(next === "dark")), "All menu/header controls stay synchronized");
  assert.equal(preview({ saved: page.storage.get("portfolio-theme") }).document.documentElement.dataset.theme, next, "Choice survives navigation/reload");
  assert.equal(page.language.href, "https://example.com/portfolio/it/index.html?motion=full#education", "Language switch preserves section, motion and repository prefix");
  page.handlers.get("storage")({ key: "portfolio-theme", newValue: "light" });
  assert.equal(page.document.documentElement.dataset.theme, "light", "Other tabs synchronize theme");
}
const blocked = preview({ blocked: true, lang: "it" });
blocked.handlers.get("DOMContentLoaded")();
blocked.buttons[0].listeners.click();
assert.equal(blocked.document.documentElement.dataset.theme, "light", "Theme still switches with blocked storage");
assert.equal(blocked.buttons[0].title, "Passa al tema scuro");

for (const file of englishPages) {
  const english = readFileSync(join(root, file), "utf8");
  const italian = readFileSync(join(root, "it", file), "utf8");
  assert.ok(italian.includes('<html lang="it">'), file);
  assert.ok(italian.includes(`https://adembilge.dev/it/${file}`), "Italian canonical and alternate URLs");
  assert.ok(english.includes('hreflang="it"') && italian.includes('hreflang="en"'));
  for (const html of [english, italian]) {
    assert.ok(html.includes('class="language-switch"'), "Static language link available without scripting");
    assert.ok(html.includes('class="theme-toggle"'), "Theme control exists on every route");
    assert.ok(html.includes('js/preferences.js?v=brown-13"></script>'), "Blocking theme bootstrap before first paint");
    assert.equal([...html.matchAll(/class="theme-toggle"/g)].length, 1, "Only one theme toggle per page");
    const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
    assert.ok(!header.includes('class="theme-toggle"'), "Homepage top bar has no theme toggle");
    assert.ok(html.match(/<dialog\b[\s\S]*?<\/dialog>/)[0].includes('class="theme-toggle"'), "Homepage theme toggle is in the menu");
    assert.ok(html.includes('<svg class="theme-to-light"') && html.includes('<svg class="theme-to-dark"'), "Theme toggle has sun and moon icons");
  }
  for (const [route, html, target] of [[file, english, `it/${file}`], [`it/${file}`, italian, file]]) {
    const href = html.match(/class="language-switch"\s+href="([^"]+)"/)[1];
    assert.equal(posix.normalize(posix.join(posix.dirname(route), href)), target, "Language toggle leads to the equivalent page");
  }
  const englishIDs = [...english.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const italianIDs = [...italian.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(italianIDs, englishIDs, "Section anchors and interactions preserved in translation");
}
console.log("PASS: themes persist, blocked storage degrades safely, localized controls synchronize, and all remaining routes preserve navigation.");
