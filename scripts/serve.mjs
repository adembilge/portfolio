import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const project = resolve(import.meta.dirname, "..");
const root = process.argv.includes("--dist") ? resolve(project, "dist") : project;
const base = process.argv.find((arg) => arg.startsWith("--base="))?.slice(7) || "/";
if (!base.startsWith("/") || !base.endsWith("/") || base.includes("..") || base.includes("\\"))
  throw Error("--base must be a URL prefix such as /portfolio/.");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      const name = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (base !== "/" && name === base.slice(0, -1)) {
        res.writeHead(308, { Location: base }).end();
        return;
      }
      if (!name.startsWith(base)) { res.writeHead(404).end("Not found"); return; }
      let path = resolve(root, name.slice(base.length));
      if (path !== root && !path.startsWith(root + sep)) {
        res.writeHead(403).end();
        return;
      }
      if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
      const body = await readFile(path);
      res
        .writeHead(200, {
          "Content-Type": types[extname(path)] || "application/octet-stream",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        })
        .end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:4173${base}`));
