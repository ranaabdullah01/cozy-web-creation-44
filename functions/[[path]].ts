// Catch-all Cloudflare Pages Function.
// Renders every non-/api page server-side by pulling data from D1.
// This means NOTHING is static — every HTML response is generated per request.

interface Env {
  DB: D1Database | null;
  BUCKET: R2Bucket | null;
  ADMIN_TOKEN: string;
  R2_PUBLIC_URL?: string;
}

const DEMO_LISTINGS = [
  { id: 1, title: "Palm Signature Villa", community: "Palm Jumeirah", price: 24500000, beds: 5, baths: 6, area: 8200, type: "Villa",      image_url: "/images/hero.jpg" },
  { id: 2, title: "Marina Sky Penthouse", community: "Dubai Marina",   price: 8900000,  beds: 4, baths: 5, area: 4100, type: "Penthouse", image_url: "/images/hero.jpg" },
  { id: 3, title: "Downtown Boulevard",   community: "Downtown Dubai", price: 3450000,  beds: 2, baths: 3, area: 1650, type: "Apartment", image_url: "/images/hero.jpg" },
];

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // route
  if (path === "/admin" || path === "/admin/") return renderAdmin();
  if (path !== "/" && path !== "") return new Response("Not found", { status: 404 });

  // fetch listings from D1 (fall back to demo)
  let listings = DEMO_LISTINGS;
  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(
        "SELECT id, title, community, price, beds, baths, area, type, image_key FROM listings ORDER BY created_at DESC LIMIT 30"
      ).all();
      if (results.length) {
        const base = (env.R2_PUBLIC_URL || "").replace(/\/$/, "");
        listings = (results as any[]).map((r) => ({
          ...r,
          image_url: r.image_key ? `${base}/${r.image_key}` : "/images/hero.jpg",
        }));
      }
    } catch (e) {
      console.error("D1 error", e);
    }
  }

  return htmlResponse(renderHome(listings));
};

/* ---------- html helpers ---------- */

const fmt = (n: number) => "AED " + Number(n).toLocaleString("en-US");
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function htmlResponse(body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=30, s-maxage=30",
    },
  });
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Luxury villas, penthouses and off-plan investments across Dubai.">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="Curated luxury properties across Palm Jumeirah, Dubai Marina, Downtown and more.">
<meta property="og:type" content="website"><meta property="og:image" content="/images/hero.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head><body>
<header class="nav"><div class="container nav-inner">
<a href="/" class="brand">AK<span> REAL ESTATE</span></a>
<nav class="nav-links">
<a href="/#properties">Properties</a><a href="/#communities">Communities</a>
<a href="/#offplan">Off-Plan</a><a href="/#contact">Contact</a>
</nav>
<a href="/#contact" class="nav-cta">Book a Viewing</a>
</div></header>
${body}
<footer id="contact"><div class="container">
<div class="foot-grid">
  <div><div class="brand" style="margin-bottom:14px">AK<span> REAL ESTATE</span></div>
    <p style="max-width:340px;line-height:1.7">Luxury property advisory · Dubai, UAE</p></div>
  <div><h4>Contact</h4><a href="tel:+971500000000">+971 50 000 0000</a>
    <a href="mailto:hello@ak-realestate.ae">hello@ak-realestate.ae</a></div>
  <div><h4>Explore</h4><a href="/#properties">Properties</a>
    <a href="/#communities">Communities</a><a href="/#offplan">Off-Plan</a></div>
  <div><h4>Office</h4><a>DIFC, Dubai</a><a>Mon – Sat · 9am – 7pm</a></div>
</div>
<div class="foot-bar">© ${new Date().getFullYear()} AK Real Estate · Rendered on Cloudflare</div>
</div></footer>
</body></html>`;
}

function renderHome(listings: any[]) {
  const cards = listings.map((p) => `
    <article class="card">
      <div class="card-img" style="background-image:url('${esc(p.image_url)}')">
        <span class="card-badge">${esc(p.type || "Residence")}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(p.title)}</h3>
        <div class="card-community">${esc(p.community || "Dubai")}</div>
        <div class="card-price">${fmt(p.price)}</div>
        <div class="card-meta">
          <span>${p.beds || "—"} Beds</span>
          <span>${p.baths || "—"} Baths</span>
          <span>${p.area ? Number(p.area).toLocaleString() + " sqft" : "—"}</span>
        </div>
      </div>
    </article>`).join("");

  const body = `
<section class="hero"><div class="container hero-inner">
  <div class="eyebrow">Dubai · Curated Portfolio</div>
  <h1>Extraordinary homes for those who <em>demand more</em>.</h1>
  <p>From Palm Jumeirah beachfront villas to Downtown sky-piercing penthouses — a private collection of Dubai's finest residences.</p>
  <div class="btn-row"><a href="#properties" class="btn btn-gold">Explore Portfolio</a>
  <a href="#contact" class="btn btn-ghost">Speak to an Advisor</a></div>
</div></section>

<section id="properties"><div class="container">
  <div class="section-head"><div class="eyebrow">Featured</div>
    <h2>Signature Properties</h2>
    <p>Hand-picked residences across Dubai's most sought-after addresses.</p></div>
  <div class="grid">${cards || '<div class="empty">No properties yet.</div>'}</div>
</div></section>

<section id="communities" style="background:#0f1216"><div class="container">
  <div class="section-head"><div class="eyebrow">Locations</div>
    <h2>Prestigious Communities</h2>
    <p>Live where Dubai's finest choose to reside.</p></div>
  <div class="grid">
    <article class="card"><div class="card-img" style="background-image:url('/images/hero.jpg')"></div><div class="card-body"><h3 class="card-title">Palm Jumeirah</h3><div class="card-community">Iconic beachfront living</div></div></article>
    <article class="card"><div class="card-img" style="background-image:url('/images/hero.jpg')"></div><div class="card-body"><h3 class="card-title">Downtown Dubai</h3><div class="card-community">Heart of the city</div></div></article>
    <article class="card"><div class="card-img" style="background-image:url('/images/hero.jpg')"></div><div class="card-body"><h3 class="card-title">Dubai Marina</h3><div class="card-community">Waterfront skyline</div></div></article>
  </div>
</div></section>

<section id="offplan" class="cta"><div class="container cta-inner">
  <div class="eyebrow">Investment</div><h2>Off-Plan Opportunities</h2>
  <p>Secure tomorrow's landmarks at today's prices — flexible payment plans and premium developer partnerships.</p>
  <a href="#contact" class="btn btn-gold">Request Brochure</a>
</div></section>`;
  return shell("AK Real Estate — Luxury Homes in Dubai", body);
}

function renderAdmin() {
  const body = `
<div style="max-width:720px;margin:0 auto;padding:60px 20px">
  <h1 style="font-family:var(--font-serif);font-size:32px;margin:0 0 8px">Add a Property</h1>
  <p style="color:var(--muted);margin:0 0 32px">Requires your <code>ADMIN_TOKEN</code>.</p>

  <div class="field"><label>Admin Token</label><input id="token" type="password" placeholder="paste token"></div>
  <hr style="border:0;border-top:1px solid rgba(255,255,255,.08);margin:24px 0">

  <h2 style="font-family:var(--font-serif);font-weight:500">1. Upload Image</h2>
  <div class="field"><label>Image file</label><input id="file" type="file" accept="image/*"></div>
  <button class="btn btn-ghost" onclick="upload()">Upload to R2</button>
  <div class="field" style="margin-top:14px"><label>Image key</label><input id="image_key" placeholder="uploads/…"></div>

  <hr style="border:0;border-top:1px solid rgba(255,255,255,.08);margin:24px 0">
  <h2 style="font-family:var(--font-serif);font-weight:500">2. Property Details</h2>
  <div class="field"><label>Title</label><input id="title"></div>
  <div class="row">
    <div class="field"><label>Price (AED)</label><input id="price" type="number"></div>
    <div class="field"><label>Community</label><input id="community"></div>
  </div>
  <div class="row">
    <div class="field"><label>Beds</label><input id="beds" type="number"></div>
    <div class="field"><label>Baths</label><input id="baths" type="number"></div>
  </div>
  <div class="row">
    <div class="field"><label>Area (sqft)</label><input id="area" type="number"></div>
    <div class="field"><label>Type</label>
      <select id="type"><option>Villa</option><option>Penthouse</option><option>Apartment</option><option>Townhouse</option></select>
    </div>
  </div>
  <button class="btn btn-gold" onclick="save()">Save Property</button>
  <div id="msg" style="margin-top:16px"></div>
</div>
<style>
.field{display:block;margin-bottom:16px}
.field label{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.field input,.field select{width:100%;padding:12px 14px;background:var(--panel);border:1px solid rgba(255,255,255,.1);color:var(--ink);border-radius:10px;font-family:inherit;font-size:15px}
.field input:focus{outline:0;border-color:var(--gold)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.ok{background:rgba(80,180,120,.15);color:#8ee0a3;padding:12px;border-radius:10px}
.err{background:rgba(220,80,80,.15);color:#f4a1a1;padding:12px;border-radius:10px}
</style>
<script>
const $ = id => document.getElementById(id);
const msg = (t,c) => { $('msg').className=c; $('msg').textContent=t; };
async function upload(){
  const f=$('file').files[0]; if(!f) return msg('Choose a file','err');
  const fd=new FormData(); fd.append('file',f);
  const r=await fetch('/api/upload',{method:'POST',headers:{'x-admin-token':$('token').value},body:fd});
  if(!r.ok) return msg('Upload failed: '+await r.text(),'err');
  const j=await r.json(); $('image_key').value=j.key; msg('Uploaded ✓ '+j.key,'ok');
}
async function save(){
  const b={title:$('title').value,price:Number($('price').value),community:$('community').value,
    beds:Number($('beds').value)||null,baths:Number($('baths').value)||null,
    area:Number($('area').value)||null,type:$('type').value,image_key:$('image_key').value||null};
  const r=await fetch('/api/listings',{method:'POST',
    headers:{'content-type':'application/json','x-admin-token':$('token').value},body:JSON.stringify(b)});
  if(!r.ok) return msg('Save failed: '+await r.text(),'err');
  msg('Saved ✓','ok');
  ['title','price','community','beds','baths','area','image_key'].forEach(i=>$(i).value='');
}
</script>`;
  return htmlResponse(shell("Admin · AK Real Estate", body));
}
