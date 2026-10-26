import { cp, mkdir, rm, readFile, writeFile, lstat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { root, canonicalBase, collectSite } from "./site-files.mjs";
execFileSync(process.execPath, [resolve(root, "scripts/check.mjs")], {
  cwd: root,
  stdio: "inherit",
});
const output = resolve(root, "dist");
// Only replace this build directory inside the repository, never a linked target.
if (dirname(output) !== root) throw Error("Build directory must stay inside the repository.");
try {
  if ((await lstat(output)).isSymbolicLink()) throw Error("Refusing to replace a linked build directory.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const url = new URL(process.env.SITE_URL || canonicalBase);
if (!/^https?:$/.test(url.protocol) || url.search || url.hash || url.username || url.password)
  throw Error("SITE_URL must be an HTTP(S) site URL without credentials, query, or fragment.");
const base = url.href.replace(/\/*$/, "/");
const site = collectSite();
if (site.errors.length) throw Error(site.errors.join("\n"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of site.files) {
  const destination = resolve(output, file);
  await mkdir(dirname(destination), { recursive: true });
  if (/\.(?:html|xml|txt)$/.test(file)) {
    const source = await readFile(resolve(root, file), "utf8");
    await writeFile(destination, source.replaceAll(canonicalBase, base));
  } else await cp(resolve(root, file), destination);
}
console.log(`Packaged ${site.files.length} site files in ${output} for ${base}`);
