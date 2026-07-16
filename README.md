# AK Real Estate — Cloudflare Pages + D1 + R2

Pure static site (HTML/CSS/JS) with Cloudflare Pages Functions for the API.
No React, no build step, no framework.

## Structure

- `public/` — static site (served as-is)
- `functions/api/` — Cloudflare Pages Functions (D1 + R2)
- `schema.sql` — D1 schema
- `wrangler.toml` — bindings (D1, R2)
- `_routes.json` — routes `/api/*` to Functions, everything else static

## First-time deploy

1. **Push this repo to GitHub.**
2. **Create D1 database (if not done):**
   ```
   npx wrangler d1 create ak-realestate
   ```
   Copy the `database_id` into `wrangler.toml`.
3. **Apply schema:**
   ```
   npx wrangler d1 execute ak-realestate --remote --file=schema.sql
   ```
4. **Create R2 bucket (if not done):**
   ```
   npx wrangler r2 bucket create ak-realestate-media
   ```
   Enable public access in Cloudflare dashboard → R2 → your bucket → Settings → Public access → r2.dev subdomain (or custom domain).
5. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.**
   - Build command: *(none)*
   - Output directory: `public`
6. **Pages project → Settings → Functions → Bindings:**
   - D1: `DB` → `ak-realestate`
   - R2: `BUCKET` → `ak-realestate-media`
7. **Pages project → Settings → Environment variables:**
   - `ADMIN_TOKEN` — a long random string (used to protect POST endpoints)
   - `R2_PUBLIC_URL` — the public URL of your R2 bucket (e.g. `https://pub-xxx.r2.dev`)

## Admin

Visit `/admin.html`, paste your `ADMIN_TOKEN`, upload images and add listings.

## Local preview

- Static only (no D1/R2): `bun run dev` → http://localhost:8080
- Full Pages + Functions locally: `npx wrangler pages dev public --d1 DB=ak-realestate --r2 BUCKET=ak-realestate-media`

The Lovable in-editor preview shows only the static frontend. Deploy to Cloudflare Pages to exercise the D1/R2 APIs.
