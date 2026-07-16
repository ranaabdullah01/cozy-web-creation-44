// Local Bun preview server that MIRRORS Cloudflare Pages routing:
// - static files under /public are served as-is
// - everything else is dispatched to the matching functions/*.ts handler
// so the Lovable preview behaves like production (minus D1/R2 bindings).
import { file } from "bun";
import { join, extname } from "node:path";
import { existsSync, statSync } from "node:fs";

const args = process.argv.slice(2);
let port = 8080;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) port = Number(args[i + 1]);
}

const PUBLIC = join(import.meta.dir, "public");
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
};

// Minimal mock env so functions/*.ts can run locally.
const mockEnv = {
  DB: null,
  BUCKET: null,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || "dev-token",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || "",
};

async function dispatchFunction(request, pathname) {
  // Try exact match first: functions/api/foo.ts, then dynamic [key], then catch-all
  const tryPaths = [];
  const clean = pathname.replace(/^\/+/, "");

  tryPaths.push({ file: join(import.meta.dir, "functions", clean + ".ts"), params: {} });
  tryPaths.push({ file: join(import.meta.dir, "functions", clean, "index.ts"), params: {} });

  // /api/images/<key> -> functions/api/images/[key].ts
  const parts = clean.split("/");
  if (parts.length >= 3 && parts[0] === "api" && parts[1] === "images") {
    tryPaths.push({
      file: join(import.meta.dir, "functions/api/images/[key].ts"),
      params: { key: parts.slice(2).join("/") },
    });
  }

  // Catch-all: functions/[[path]].ts
  tryPaths.push({
    file: join(import.meta.dir, "functions/[[path]].ts"),
    params: { path: clean },
  });

  for (const t of tryPaths) {
    if (!existsSync(t.file)) continue;
    const mod = await import(t.file);
    const method = request.method.toUpperCase();
    const handler = mod[`onRequest${method[0]}${method.slice(1).toLowerCase()}`] || mod.onRequest;
    if (!handler) continue;
    return handler({ request, env: mockEnv, params: t.params, next: async () => new Response("Not found", { status: 404 }) });
  }
  return null;
}

Bun.serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);

    // 1. static file wins if it exists
    const staticFile = join(PUBLIC, path === "/" ? "/__nope" : path);
    if (existsSync(staticFile) && statSync(staticFile).isFile()) {
      const type = MIME[extname(staticFile).toLowerCase()] || "application/octet-stream";
      return new Response(file(staticFile), { headers: { "content-type": type } });
    }

    // 2. dispatch to a function
    try {
      const res = await dispatchFunction(req, path);
      if (res) return res;
    } catch (err) {
      console.error("Function error:", err);
      return new Response("Function error: " + String(err), { status: 500 });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Cloudflare-like preview on http://0.0.0.0:${port}`);
