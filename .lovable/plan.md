
# Cloudflare Pages + D1 + R2 rebuild

## What you get

- **Frontend:** plain `index.html` + CSS + JS (the design we already have), built as a static site — served by Cloudflare Pages.
- **Backend:** Cloudflare Pages Functions in `/functions/api/*.ts` — no TanStack Start, no Workers SSR.
- **Database:** your existing D1, bound as `env.DB`.
- **Images/files:** your existing R2 bucket, bound as `env.BUCKET`.
- **Deploy:** you push to GitHub → Cloudflare Pages auto-builds. Lovable preview will only show the static frontend (D1/R2 bindings don't exist in Lovable's sandbox).

## Repo layout after the change

```text
/
├── public/                     # static assets served as-is
│   ├── index.html              # main page (previous design, no heavy animation)
│   ├── styles.css
│   ├── app.js                  # fetches /api/* and renders listings
│   └── images/hero.jpg
├── functions/
│   └── api/
│       ├── listings.ts         # GET list, POST create (admin)
│       ├── communities.ts      # GET list
│       ├── offplan.ts          # GET list
│       ├── upload.ts           # POST image -> R2, returns public URL
│       └── images/[key].ts     # GET image from R2 (if bucket is private)
├── schema.sql                  # D1 schema (listings, communities, offplan)
├── wrangler.toml               # pages_build_output_dir, D1 + R2 bindings
├── _routes.json                # tells Pages which paths hit Functions
└── README.md                   # deploy + binding setup steps
```

## D1 schema (schema.sql)

```sql
CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  beds INTEGER, baths INTEGER, area INTEGER,
  community TEXT, type TEXT,
  image_key TEXT,            -- R2 object key
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE communities (id INTEGER PRIMARY KEY, name TEXT, image_key TEXT);
CREATE TABLE offplan     (id INTEGER PRIMARY KEY, name TEXT, developer TEXT, handover TEXT, image_key TEXT);
```

## wrangler.toml (bindings)

```toml
name = "ak-realestate"
pages_build_output_dir = "public"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "ak-realestate"
database_id = "YOUR_D1_ID"     # you paste this

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "ak-realestate-media"
```

## Function example

```ts
// functions/api/listings.ts
interface Env { DB: D1Database; BUCKET: R2Bucket; ADMIN_TOKEN: string }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM listings ORDER BY created_at DESC LIMIT 50"
  ).all();
  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN)
    return new Response("Unauthorized", { status: 401 });
  const body = await request.json();
  await env.DB.prepare(
    "INSERT INTO listings (title, price, beds, baths, area, community, type, image_key) VALUES (?,?,?,?,?,?,?,?)"
  ).bind(body.title, body.price, body.beds, body.baths, body.area, body.community, body.type, body.image_key).run();
  return Response.json({ ok: true });
};
```

## Deploy steps (you run these once)

1. Push repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → Connect repo.
3. Build command: *(none)* — output dir: `public`.
4. In Pages project → **Settings → Bindings**: add D1 binding `DB` → your DB, R2 binding `BUCKET` → your bucket.
5. In **Settings → Variables**: add `ADMIN_TOKEN` (any random string, used to protect POST endpoints).
6. Run once locally to create tables: `npx wrangler d1 execute ak-realestate --remote --file=schema.sql`

## What I will remove from the current project

- `src/` (all TanStack Start / React code)
- `src/routes/`, `src/router.tsx`, `routeTree.gen.ts`
- `vite.config.ts`, `tsconfig*.json` — replaced by nothing (pure static + Pages Functions build)
- `package.json` — trimmed to only `wrangler` as devDep for local testing (optional)

## What you need to confirm

1. **D1 database name and ID** — paste them so I fill `wrangler.toml`. (Or leave placeholders and you fill them.)
2. **R2 bucket name** — same.
3. Should I keep an **admin page** (`public/admin.html`) for adding listings + uploading images, protected by the `ADMIN_TOKEN`? Recommended yes.
4. Should the R2 bucket be **public** (simpler — images served from `pub-xxx.r2.dev` or a custom domain) or **private** (served through `/api/images/[key]`)?

Reply with those four answers (or just "go, use placeholders, public bucket, yes admin") and I'll build it.
