// Fetches data from Cloudflare Pages Functions (D1-backed).
// Falls back to demo data when APIs return nothing (e.g. local static preview).

const DEMO_LISTINGS = [
  { title: "Palm Signature Villa", community: "Palm Jumeirah", price: 24500000, beds: 5, baths: 6, area: 8200, image_url: "/images/hero.jpg" },
  { title: "Marina Sky Penthouse", community: "Dubai Marina",   price: 8900000,  beds: 4, baths: 5, area: 4100, image_url: "/images/hero.jpg" },
  { title: "Downtown Boulevard",   community: "Downtown Dubai", price: 3450000,  beds: 2, baths: 3, area: 1650, image_url: "/images/hero.jpg" },
];

const fmt = (n) => "AED " + Number(n).toLocaleString("en-US");

async function loadListings() {
  const el = document.getElementById("listings-grid");
  try {
    const res = await fetch("/api/listings");
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    render(el, data.length ? data : DEMO_LISTINGS);
  } catch {
    render(el, DEMO_LISTINGS);
  }
}

function render(el, items) {
  if (!items.length) { el.innerHTML = '<div class="empty">No properties yet.</div>'; return; }
  el.innerHTML = items.map((p) => `
    <article class="card">
      <div class="card-img" style="background-image:url('${p.image_url || "/images/hero.jpg"}')">
        <span class="card-badge">${p.type || "Residence"}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(p.title)}</h3>
        <div class="card-community">${escapeHtml(p.community || "Dubai")}</div>
        <div class="card-price">${fmt(p.price)}</div>
        <div class="card-meta">
          <span>${p.beds || "—"} Beds</span>
          <span>${p.baths || "—"} Baths</span>
          <span>${p.area ? p.area.toLocaleString() + " sqft" : "—"}</span>
        </div>
      </div>
    </article>
  `).join("");
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

document.addEventListener("DOMContentLoaded", loadListings);
