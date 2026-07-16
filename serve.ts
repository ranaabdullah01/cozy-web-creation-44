// Minimal static file server for local preview (Bun).
// Accepts --port <n> from the Lovable harness; defaults to 8080.
import { file } from "bun";
import { join, extname } from "node:path";
import { existsSync, statSync } from "node:fs";

const args = process.argv.slice(2);
let port = 8080;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) port = Number(args[i + 1]);
}

const ROOT = join(import.meta.dir, "public");
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
};

Bun.serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    let full = join(ROOT, path);
    if (!existsSync(full) || statSync(full).isDirectory()) full = join(ROOT, "index.html");
    const type = MIME[extname(full).toLowerCase()] || "application/octet-stream";
    return new Response(file(full), { headers: { "content-type": type } });
  },
});

console.log(`Static server on http://0.0.0.0:${port}  (root: ${ROOT})`);
