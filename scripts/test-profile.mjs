import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { collectSite, pages } from "./site-files.mjs";
import { translate, units } from "./localize.mjs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const text = markup => markup.replace(/<\/?strong>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
assert.deepEqual(pages, ["index.html", "it/index.html"], "Only the two homepages are published");
assert.ok(!collectSite().files.some(file => /(?:^|\/)(?:blog|articles)(?:\/|\.)/.test(file)), "No Writing routes or assets are packaged");
assert.ok(!html.includes('href="#blog"'), "No stale Writing navigation");
assert.deepEqual([...html.matchAll(/<span class="role-line[^\"]*">([^<]+)<\/span>/g)].map(m => m[1]),
  ["AI Engineer", "Software Engineer", "Applied Researcher"]);
assert.equal(text(html.match(/<p\b[^>]*class="hero-description"[^>]*>([\s\S]*?)<\/p>/)[1]), "I build intelligent applications by combining machine learning and AI agents with experience in software engineering.");
const richEnglish = "Experience in <strong>AI engineering</strong>.";
const richItalian = "Esperienza nell’<strong>ingegneria AI</strong>.";
assert.deepEqual(units(`<p data-i18n-rich>${richEnglish}</p>`), [richEnglish]);
assert.equal(translate(`<p data-i18n-rich>${richEnglish}</p>`, "index.html", { [richEnglish]: richItalian }), `<p data-i18n-rich>${richItalian}</p>`, "Emphasis preserves Italian apostrophes and punctuation");
const jobs = [...html.matchAll(/<article class="role-row[\s\S]*?<\/article>/g)].map(m => m[0]);
assert.equal(jobs.length, 4);
for (const job of jobs) {
  const summaries = [...job.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map(m => text(m[1]).replace(/\s*\+$/, ""));
  assert.deepEqual(summaries, ["Summary", "Contributions"]);
  const story = job.match(/<div class="disclosure-body">([\s\S]*?)<\/div>/)[1];
  assert.equal([...story.matchAll(/<p\b[^>]*>/g)].length, 2, "Each job story has two paragraphs");
  const words = text(story).split(" ").length;
  assert.ok(words >= 120 && words <= 170, `Job story length: ${words}`);
  assert.ok(job.indexOf('<p class="secondary">') < job.indexOf('class="disclosure-pair"'), "Job context stays outside the controls");
}
assert.equal([...html.matchAll(/<details name="education"/g)].length, 6);
for (const university of ["polimi", "hacettepe", "czestochowa"])
  assert.equal([...html.matchAll(new RegExp(`data-university="${university}"`, "g"))].length, 3, "Each university maps two disclosures to one photo");
assert.ok(!html.includes("First-author") && !html.includes("<strong>Bilge, F.A.</strong>"));
assert.ok(html.includes("58.0% accuracy") && html.includes("35.0%"));
console.log("PASS profile: headline order, job stories, context placement, university mappings, research highlights, and Writing removal.");
