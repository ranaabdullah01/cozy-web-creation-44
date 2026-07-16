# AK Web Services — Static Site

Pure HTML / CSS / JavaScript. No build step. Host anywhere.

## Files
- `index.html` — page structure
- `styles.css` — design system (navy + gold luxury theme)
- `script.js` — smooth scroll + lead form submission

## Deploy

### GitHub Pages
1. Push this `static-site/` folder to a GitHub repo (or move files to repo root).
2. Repo → Settings → Pages → Deploy from branch → `main` / root.
3. Done — your site is live at `https://<user>.github.io/<repo>/`.

### Cloudflare Pages
1. Cloudflare Dashboard → Pages → Create → Connect to Git.
2. Build command: *(leave empty)*
3. Build output directory: `/` (or `static-site` if you keep the folder).
4. Deploy.

## Lead form
`script.js` posts to your existing Cloudflare Worker at
`https://ak-realestate-api.ranabullah01.workers.dev/api/leads`.
Change `API_URL` in `script.js` if your endpoint differs.

## Images
Hero and property images are loaded from Unsplash CDN — no local assets needed.
Swap the URLs in `index.html` for your own photos anytime.
