import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

export const Route = createFileRoute("/admin")({ component: AdminApp });

const API_BASE = "https://ak-realestate-api.ranabullah01.workers.dev";
const TOKEN_KEY = "ak_admin_token";

/* ---------------- Types ---------------- */
type Listing = {
  id?: number | string; title: string; type: string; status: string; price: number;
  community: string; building?: string; bedrooms: number; bathrooms: number; sqft: number;
  floor?: string; view?: string; furnishing?: string; parking?: number; permit?: string;
  description?: string; features?: string[] | string; images?: string[] | string;
  whatsappText?: string; featured?: boolean;
};
type Offplan = {
  id?: number | string; projectName: string; developer: string; community: string;
  types?: string[] | string; startingPrice: number; handoverDate?: string;
  paymentPlan?: { downPayment?: string; duringConstruction?: string; onHandover?: string };
  description?: string; highlights?: string[] | string; goldenVisaEligible?: boolean;
  image?: string; brochureWhatsApp?: string; featured?: boolean;
};
type Community = {
  id?: number | string; name: string; slug?: string; description?: string; lifestyle?: string;
  avgApartmentPrice?: string; avgVillaPrice?: string; avgRentalYield?: string;
  avgRent1BR?: string; avgRent2BR?: string; highlights?: string[] | string;
  nearbyLandmarks?: string[] | string; metroStation?: string; communityType?: string;
  popular?: boolean;
};
type Profile = Record<string, string>;
type Lead = Record<string, any>;

/* ---------------- Helpers ---------------- */
async function api<T = any>(path: string, opts: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (opts.body && !(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  return r.json();
}

function compress(file: File, maxW = 1200): Promise<Blob> {
  return new Promise((resolve) => {
    const rd = new FileReader();
    rd.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
        c.width = w; c.height = h;
        c.getContext("2d")!.drawImage(img, 0, 0, w, h);
        c.toBlob((b) => resolve(b!), "image/jpeg", 0.8);
      };
      img.src = e.target!.result as string;
    };
    rd.readAsDataURL(file);
  });
}

async function uploadImage(file: File): Promise<string | null> {
  const blob = await compress(file);
  const fd = new FormData();
  fd.append("file", blob, file.name);
  const r = await api<{ success: boolean; url?: string; message?: string }>(
    "/api/upload", { method: "POST", body: fd }, true
  );
  return r.success ? r.url! : null;
}

/* ---------------- Root ---------------- */
function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) { setChecking(false); return; }
    api<{ success: boolean }>("/admin/verify", {}, true).then((r) => {
      if (r.success) setToken(t); else localStorage.removeItem(TOKEN_KEY);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  if (checking) return <div className="min-h-screen grid place-items-center bg-[#0A1628] text-white">Loading…</div>;
  if (!token) return <Login onLogin={(t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;
  return <Dashboard onLogout={() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }} />;
}

/* ---------------- Login ---------------- */
function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const r = await api<{ success: boolean; token?: string; message?: string }>(
        "/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) }
      );
      if (r.success && r.token) onLogin(r.token);
      else setErr(r.message || "Invalid password");
    } catch { setErr("Connection error"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#0A1628] p-5">
      <form onSubmit={submit} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-[#0A1628]">AK Web Services</h1>
          <p className="text-gray-500 mt-1">Admin Panel</p>
        </div>
        <label className="block text-sm font-semibold mb-2">Password</label>
        <input
          type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#C9A84C]"
          placeholder="Enter admin password" required autoFocus
        />
        {err && <div className="text-red-600 text-sm mt-3">{err}</div>}
        <button
          type="submit" disabled={loading}
          className="w-full mt-5 py-3 bg-[#C9A84C] hover:bg-[#B3963A] text-[#0A1628] font-semibold rounded-lg transition disabled:opacity-50"
        >{loading ? "Logging in…" : "Login"}</button>
      </form>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
type Tab = "listings" | "offplan" | "communities" | "profile" | "leads";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [offplan, setOffplan] = useState<Offplan[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function notify(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function reloadAll() {
    const [l, o, c, p, ld] = await Promise.all([
      api<any>(`/api/listings?t=${Date.now()}`),
      api<any>(`/api/offplan?t=${Date.now()}`),
      api<any>(`/api/communities?t=${Date.now()}`),
      api<any>(`/api/agent-profile?t=${Date.now()}`),
      api<any>("/admin/leads", {}, true),
    ]);
    if (l.success) setListings(l.listings || []);
    if (o.success) setOffplan(o.projects || []);
    if (c.success) setCommunities(c.communities || []);
    if (p.success) setProfile(p.profile || {});
    if (ld.success) setLeads(ld.leads || []);
  }

  useEffect(() => { reloadAll(); }, []);

  async function logout() {
    await api("/admin/logout", { method: "POST" }, true).catch(() => {});
    onLogout();
  }

  const stats = useMemo(() => {
    const active = listings.filter(l => l.status === "for-sale" || l.status === "for-rent").length;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);
    const dt = (l: any) => new Date(l.created_at || l.createdAt);
    return {
      active, offplan: offplan.length, communities: communities.length,
      leads: leads.length,
      today: leads.filter(l => dt(l) >= today).length,
      week: leads.filter(l => dt(l) >= weekAgo).length,
      month: leads.filter(l => dt(l) >= monthAgo).length,
    };
  }, [listings, offplan, communities, leads]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A1628]">
      <header className="bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">AK Web Services Admin</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-[#C9A84C] hover:underline">View Site</a>
            <button onClick={logout} className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold text-sm hover:bg-[#B3963A]">Logout</button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.leads} extra={`Today ${stats.today} · Week ${stats.week} · Month ${stats.month}`} />
        <StatCard label="Active Listings" value={stats.active} />
        <StatCard label="Off-Plan" value={stats.offplan} />
        <StatCard label="Communities" value={stats.communities} />
      </section>

      <nav className="max-w-7xl mx-auto px-5 flex gap-2 border-b border-gray-200 overflow-x-auto">
        {(["listings", "offplan", "communities", "profile", "leads"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition ${tab === t ? "border-[#C9A84C] text-[#0A1628]" : "border-transparent text-gray-500 hover:text-[#0A1628]"}`}>
            {t}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-6">
        {tab === "listings" && <ListingsTab items={listings} reload={reloadAll} notify={notify} />}
        {tab === "offplan" && <OffplanTab items={offplan} reload={reloadAll} notify={notify} />}
        {tab === "communities" && <CommunitiesTab items={communities} reload={reloadAll} notify={notify} />}
        {tab === "profile" && <ProfileTab profile={profile} reload={reloadAll} notify={notify} />}
        {tab === "leads" && <LeadsTab items={leads} />}
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, extra }: { label: string; value: number; extra?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-3xl font-display font-bold mt-1">{value}</div>
      {extra && <div className="text-xs text-gray-500 mt-2">{extra}</div>}
    </div>
  );
}

/* ---------------- Generic modal ---------------- */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-black leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A84C] text-sm";

/* ---------------- Listings ---------------- */
function ListingsTab({ items, reload, notify }: { items: Listing[]; reload: () => void; notify: (m: string, t?: "success" | "error") => void }) {
  const [editing, setEditing] = useState<Listing | null>(null);
  const [open, setOpen] = useState(false);

  async function del(id: any) {
    if (!confirm("Delete this listing?")) return;
    const r = await api<any>(`/api/listings/${id}`, { method: "DELETE" }, true);
    if (r.success) { notify("Deleted"); reload(); } else notify(r.message || "Failed", "error");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl font-bold">Listings</h2>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold text-sm hover:bg-[#B3963A]">+ Add Listing</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><Th>Image</Th><Th>Title</Th><Th>Price</Th><Th>Community</Th><Th>Status</Th><Th>Featured</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-500">No listings yet.</td></tr>}
            {items.map(l => {
              const imgs = Array.isArray(l.images) ? l.images : (typeof l.images === "string" && l.images ? l.images.split(",") : []);
              return (
                <tr key={l.id} className="border-t">
                  <td className="p-3">{imgs[0] && <img src={imgs[0]} alt="" className="w-14 h-14 object-cover rounded" />}</td>
                  <td className="p-3 font-semibold">{l.title}</td>
                  <td className="p-3">AED {Number(l.price).toLocaleString()}</td>
                  <td className="p-3">{l.community}</td>
                  <td className="p-3">{l.status}</td>
                  <td className="p-3">{l.featured ? "⭐" : ""}</td>
                  <td className="p-3">
                    <button onClick={() => { setEditing(l); setOpen(true); }} className="px-3 py-1 bg-[#0A1628] text-white rounded text-xs mr-1">Edit</button>
                    <button onClick={() => del(l.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={editing ? "Edit Listing" : "New Listing"} onClose={() => setOpen(false)}>
          <ListingForm initial={editing} onSaved={() => { setOpen(false); reload(); notify("Saved"); }} onError={(m) => notify(m, "error")} />
        </Modal>
      )}
    </div>
  );
}

function Th({ children }: { children: ReactNode }) { return <th className="p-3 font-semibold text-xs uppercase tracking-wide text-gray-600">{children}</th>; }

function ListingForm({ initial, onSaved, onError }: { initial: Listing | null; onSaved: () => void; onError: (m: string) => void }) {
  const asArr = (v: any): string[] => Array.isArray(v) ? v : (typeof v === "string" && v ? v.split(",") : []);
  const [f, setF] = useState<any>({
    title: initial?.title || "", type: initial?.type || "Apartment", status: initial?.status || "for-sale",
    price: initial?.price || 0, community: initial?.community || "", building: initial?.building || "",
    bedrooms: initial?.bedrooms || 0, bathrooms: initial?.bathrooms || 0, sqft: initial?.sqft || 0,
    floor: initial?.floor || "", view: initial?.view || "", furnishing: initial?.furnishing || "",
    parking: initial?.parking || 0, permit: initial?.permit || "", description: initial?.description || "",
    features: asArr(initial?.features).join(", "),
    images: asArr(initial?.images),
    whatsappText: initial?.whatsappText || "I'm interested in this property",
    featured: !!initial?.featured,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(e.target.files)) {
      const u = await uploadImage(file);
      if (u) urls.push(u);
    }
    set("images", [...f.images, ...urls]);
    setUploading(false);
    e.target.value = "";
  }

  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = {
      id: initial?.id || null, ...f,
      price: Number(f.price) || 0, bedrooms: Number(f.bedrooms) || 0, bathrooms: Number(f.bathrooms) || 0,
      sqft: Number(f.sqft) || 0, parking: Number(f.parking) || 0,
      features: String(f.features).split(",").map((s: string) => s.trim()).filter(Boolean),
      images: f.images.join(","),
    };
    const r = await api<any>("/api/listings", { method: "POST", body: JSON.stringify(payload) }, true);
    setSaving(false);
    if (r.success) onSaved(); else onError(r.message || "Save failed");
  }

  return (
    <form onSubmit={save} className="grid grid-cols-2 gap-4">
      <Field label="Title"><input className={inputCls} value={f.title} onChange={e => set("title", e.target.value)} required /></Field>
      <Field label="Type">
        <select className={inputCls} value={f.type} onChange={e => set("type", e.target.value)}>
          {["Apartment", "Villa", "Penthouse", "Studio", "Townhouse"].map(x => <option key={x}>{x}</option>)}
        </select>
      </Field>
      <Field label="Status">
        <select className={inputCls} value={f.status} onChange={e => set("status", e.target.value)}>
          {["for-sale", "for-rent", "sold"].map(x => <option key={x}>{x}</option>)}
        </select>
      </Field>
      <Field label="Price (AED)"><input type="number" className={inputCls} value={f.price} onChange={e => set("price", e.target.value)} /></Field>
      <Field label="Community"><input className={inputCls} value={f.community} onChange={e => set("community", e.target.value)} /></Field>
      <Field label="Building"><input className={inputCls} value={f.building} onChange={e => set("building", e.target.value)} /></Field>
      <Field label="Bedrooms"><input type="number" className={inputCls} value={f.bedrooms} onChange={e => set("bedrooms", e.target.value)} /></Field>
      <Field label="Bathrooms"><input type="number" className={inputCls} value={f.bathrooms} onChange={e => set("bathrooms", e.target.value)} /></Field>
      <Field label="Sqft"><input type="number" className={inputCls} value={f.sqft} onChange={e => set("sqft", e.target.value)} /></Field>
      <Field label="Floor"><input className={inputCls} value={f.floor} onChange={e => set("floor", e.target.value)} /></Field>
      <Field label="View"><input className={inputCls} value={f.view} onChange={e => set("view", e.target.value)} /></Field>
      <Field label="Furnishing"><input className={inputCls} value={f.furnishing} onChange={e => set("furnishing", e.target.value)} /></Field>
      <Field label="Parking"><input type="number" className={inputCls} value={f.parking} onChange={e => set("parking", e.target.value)} /></Field>
      <Field label="Permit"><input className={inputCls} value={f.permit} onChange={e => set("permit", e.target.value)} /></Field>
      <div className="col-span-2"><Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={e => set("description", e.target.value)} /></Field></div>
      <div className="col-span-2"><Field label="Features (comma separated)"><input className={inputCls} value={f.features} onChange={e => set("features", e.target.value)} /></Field></div>
      <div className="col-span-2"><Field label="WhatsApp Text"><input className={inputCls} value={f.whatsappText} onChange={e => set("whatsappText", e.target.value)} /></Field></div>
      <div className="col-span-2">
        <Field label="Images (uploaded to R2)">
          <input type="file" accept="image/*" multiple onChange={onFiles} className="text-sm" />
          {uploading && <div className="text-xs text-gray-500 mt-1">Uploading…</div>}
          <div className="flex flex-wrap gap-2 mt-2">
            {f.images.map((u: string, i: number) => (
              <div key={i} className="relative">
                <img src={u} alt="" className="w-20 h-20 object-cover rounded" />
                <button type="button" onClick={() => set("images", f.images.filter((_: any, j: number) => j !== i))}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
              </div>
            ))}
          </div>
        </Field>
      </div>
      <label className="col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.featured} onChange={e => set("featured", e.target.checked)} /> Featured
      </label>
      <div className="col-span-2 flex justify-end gap-2">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

/* ---------------- Offplan ---------------- */
function OffplanTab({ items, reload, notify }: { items: Offplan[]; reload: () => void; notify: (m: string, t?: "success" | "error") => void }) {
  const [editing, setEditing] = useState<Offplan | null>(null);
  const [open, setOpen] = useState(false);
  async function del(id: any) {
    if (!confirm("Delete this project?")) return;
    const r = await api<any>(`/api/offplan/${id}`, { method: "DELETE" }, true);
    if (r.success) { notify("Deleted"); reload(); } else notify(r.message || "Failed", "error");
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl font-bold">Off-Plan Projects</h2>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold text-sm">+ Add Project</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><Th>Project</Th><Th>Developer</Th><Th>Community</Th><Th>Starting</Th><Th>Golden Visa</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No projects yet.</td></tr>}
            {items.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-semibold">{p.projectName}</td>
                <td className="p-3">{p.developer}</td>
                <td className="p-3">{p.community}</td>
                <td className="p-3">AED {Number(p.startingPrice).toLocaleString()}</td>
                <td className="p-3">{p.goldenVisaEligible ? "✅" : ""}</td>
                <td className="p-3">
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="px-3 py-1 bg-[#0A1628] text-white rounded text-xs mr-1">Edit</button>
                  <button onClick={() => del(p.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={editing ? "Edit Project" : "New Project"} onClose={() => setOpen(false)}>
          <OffplanForm initial={editing} onSaved={() => { setOpen(false); reload(); notify("Saved"); }} onError={(m) => notify(m, "error")} />
        </Modal>
      )}
    </div>
  );
}

function OffplanForm({ initial, onSaved, onError }: { initial: Offplan | null; onSaved: () => void; onError: (m: string) => void }) {
  const asArr = (v: any): string[] => Array.isArray(v) ? v : (typeof v === "string" && v ? v.split(",") : []);
  const stripPct = (v: any) => String(v || "").replace("%", "");
  const [f, setF] = useState<any>({
    projectName: initial?.projectName || "", developer: initial?.developer || "",
    community: initial?.community || "", types: asArr(initial?.types).join(", "),
    startingPrice: initial?.startingPrice || 0, handoverDate: initial?.handoverDate || "",
    downPayment: stripPct(initial?.paymentPlan?.downPayment) || "20",
    duringConstruction: stripPct(initial?.paymentPlan?.duringConstruction) || "50",
    onHandover: stripPct(initial?.paymentPlan?.onHandover) || "30",
    description: initial?.description || "", highlights: asArr(initial?.highlights).join(", "),
    goldenVisaEligible: !!initial?.goldenVisaEligible, image: initial?.image || "",
    brochureWhatsApp: initial?.brochureWhatsApp || "I'm interested in this off-plan project",
    featured: !!initial?.featured,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const u = await uploadImage(file);
    if (u) set("image", u);
    setUploading(false); e.target.value = "";
  }

  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = {
      id: initial?.id || null, ...f,
      startingPrice: Number(f.startingPrice) || 0,
      types: String(f.types).split(",").map((s: string) => s.trim()).filter(Boolean),
      highlights: String(f.highlights).split(",").map((s: string) => s.trim()).filter(Boolean),
      paymentPlan: {
        downPayment: f.downPayment, duringConstruction: f.duringConstruction, onHandover: f.onHandover,
        display: `${f.downPayment}% Down | ${f.duringConstruction}% Construction | ${f.onHandover}% Handover`,
      },
    };
    const r = await api<any>("/api/offplan", { method: "POST", body: JSON.stringify(payload) }, true);
    setSaving(false);
    if (r.success) onSaved(); else onError(r.message || "Save failed");
  }

  return (
    <form onSubmit={save} className="grid grid-cols-2 gap-4">
      <Field label="Project Name"><input className={inputCls} value={f.projectName} onChange={e => set("projectName", e.target.value)} required /></Field>
      <Field label="Developer"><input className={inputCls} value={f.developer} onChange={e => set("developer", e.target.value)} /></Field>
      <Field label="Community"><input className={inputCls} value={f.community} onChange={e => set("community", e.target.value)} /></Field>
      <Field label="Starting Price (AED)"><input type="number" className={inputCls} value={f.startingPrice} onChange={e => set("startingPrice", e.target.value)} /></Field>
      <Field label="Handover Date"><input className={inputCls} value={f.handoverDate} onChange={e => set("handoverDate", e.target.value)} /></Field>
      <Field label="Types (comma separated)"><input className={inputCls} value={f.types} onChange={e => set("types", e.target.value)} /></Field>
      <Field label="Down Payment %"><input type="number" className={inputCls} value={f.downPayment} onChange={e => set("downPayment", e.target.value)} /></Field>
      <Field label="During Construction %"><input type="number" className={inputCls} value={f.duringConstruction} onChange={e => set("duringConstruction", e.target.value)} /></Field>
      <Field label="On Handover %"><input type="number" className={inputCls} value={f.onHandover} onChange={e => set("onHandover", e.target.value)} /></Field>
      <div className="col-span-2"><Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={e => set("description", e.target.value)} /></Field></div>
      <div className="col-span-2"><Field label="Highlights (comma separated)"><input className={inputCls} value={f.highlights} onChange={e => set("highlights", e.target.value)} /></Field></div>
      <div className="col-span-2"><Field label="Brochure WhatsApp Text"><input className={inputCls} value={f.brochureWhatsApp} onChange={e => set("brochureWhatsApp", e.target.value)} /></Field></div>
      <div className="col-span-2">
        <Field label="Project Image">
          <input type="file" accept="image/*" onChange={onFile} className="text-sm" />
          {uploading && <div className="text-xs text-gray-500 mt-1">Uploading…</div>}
          {f.image && <img src={f.image} alt="" className="w-32 h-32 object-cover rounded mt-2" />}
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.goldenVisaEligible} onChange={e => set("goldenVisaEligible", e.target.checked)} /> Golden Visa Eligible</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={e => set("featured", e.target.checked)} /> Featured</label>
      <div className="col-span-2 flex justify-end">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

/* ---------------- Communities ---------------- */
function CommunitiesTab({ items, reload, notify }: { items: Community[]; reload: () => void; notify: (m: string, t?: "success" | "error") => void }) {
  const [editing, setEditing] = useState<Community | null>(null);
  const [open, setOpen] = useState(false);
  async function del(id: any) {
    if (!confirm("Delete this community?")) return;
    const r = await api<any>(`/api/communities/${id}`, { method: "DELETE" }, true);
    if (r.success) { notify("Deleted"); reload(); } else notify(r.message || "Failed", "error");
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl font-bold">Communities</h2>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold text-sm">+ Add Community</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><Th>Name</Th><Th>Type</Th><Th>Avg Apartment</Th><Th>Avg Villa</Th><Th>Popular</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No communities yet.</td></tr>}
            {items.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3">{c.communityType}</td>
                <td className="p-3">{c.avgApartmentPrice}</td>
                <td className="p-3">{c.avgVillaPrice}</td>
                <td className="p-3">{c.popular ? "⭐" : ""}</td>
                <td className="p-3">
                  <button onClick={() => { setEditing(c); setOpen(true); }} className="px-3 py-1 bg-[#0A1628] text-white rounded text-xs mr-1">Edit</button>
                  <button onClick={() => del(c.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={editing ? "Edit Community" : "New Community"} onClose={() => setOpen(false)}>
          <CommunityForm initial={editing} onSaved={() => { setOpen(false); reload(); notify("Saved"); }} onError={(m) => notify(m, "error")} />
        </Modal>
      )}
    </div>
  );
}

function CommunityForm({ initial, onSaved, onError }: { initial: Community | null; onSaved: () => void; onError: (m: string) => void }) {
  const asArr = (v: any): string[] => Array.isArray(v) ? v : (typeof v === "string" && v ? v.split(",") : []);
  const [f, setF] = useState<any>({
    name: initial?.name || "", slug: initial?.slug || "", description: initial?.description || "",
    lifestyle: initial?.lifestyle || "", avgApartmentPrice: initial?.avgApartmentPrice || "",
    avgVillaPrice: initial?.avgVillaPrice || "", avgRentalYield: initial?.avgRentalYield || "",
    avgRent1BR: initial?.avgRent1BR || "", avgRent2BR: initial?.avgRent2BR || "",
    highlights: asArr(initial?.highlights).join(", "), nearbyLandmarks: asArr(initial?.nearbyLandmarks).join(", "),
    metroStation: initial?.metroStation || "", communityType: initial?.communityType || "Family",
    popular: !!initial?.popular,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = {
      id: initial?.id || null, ...f,
      slug: f.slug || f.name.toLowerCase().replace(/\s+/g, "-"),
      highlights: String(f.highlights).split(",").map((s: string) => s.trim()).filter(Boolean),
      nearbyLandmarks: String(f.nearbyLandmarks).split(",").map((s: string) => s.trim()).filter(Boolean),
    };
    const r = await api<any>("/api/communities", { method: "POST", body: JSON.stringify(payload) }, true);
    setSaving(false);
    if (r.success) onSaved(); else onError(r.message || "Save failed");
  }

  return (
    <form onSubmit={save} className="grid grid-cols-2 gap-4">
      <Field label="Name"><input className={inputCls} value={f.name} onChange={e => set("name", e.target.value)} required /></Field>
      <Field label="Slug"><input className={inputCls} value={f.slug} onChange={e => set("slug", e.target.value)} placeholder="auto" /></Field>
      <Field label="Type">
        <select className={inputCls} value={f.communityType} onChange={e => set("communityType", e.target.value)}>
          {["Family", "Luxury", "Waterfront", "Urban", "Beachfront", "Investment"].map(x => <option key={x}>{x}</option>)}
        </select>
      </Field>
      <Field label="Lifestyle"><input className={inputCls} value={f.lifestyle} onChange={e => set("lifestyle", e.target.value)} /></Field>
      <Field label="Avg Apartment Price"><input className={inputCls} value={f.avgApartmentPrice} onChange={e => set("avgApartmentPrice", e.target.value)} /></Field>
      <Field label="Avg Villa Price"><input className={inputCls} value={f.avgVillaPrice} onChange={e => set("avgVillaPrice", e.target.value)} /></Field>
      <Field label="Avg Rental Yield"><input className={inputCls} value={f.avgRentalYield} onChange={e => set("avgRentalYield", e.target.value)} /></Field>
      <Field label="Avg Rent 1BR"><input className={inputCls} value={f.avgRent1BR} onChange={e => set("avgRent1BR", e.target.value)} /></Field>
      <Field label="Avg Rent 2BR"><input className={inputCls} value={f.avgRent2BR} onChange={e => set("avgRent2BR", e.target.value)} /></Field>
      <Field label="Metro Station"><input className={inputCls} value={f.metroStation} onChange={e => set("metroStation", e.target.value)} /></Field>
      <div className="col-span-2"><Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={e => set("description", e.target.value)} /></Field></div>
      <div className="col-span-2"><Field label="Highlights (comma separated)"><input className={inputCls} value={f.highlights} onChange={e => set("highlights", e.target.value)} /></Field></div>
      <div className="col-span-2"><Field label="Nearby Landmarks (comma separated)"><input className={inputCls} value={f.nearbyLandmarks} onChange={e => set("nearbyLandmarks", e.target.value)} /></Field></div>
      <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.popular} onChange={e => set("popular", e.target.checked)} /> Popular</label>
      <div className="col-span-2 flex justify-end">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

/* ---------------- Profile ---------------- */
function ProfileTab({ profile, reload, notify }: { profile: Profile; reload: () => void; notify: (m: string, t?: "success" | "error") => void }) {
  const [f, setF] = useState<Profile>(profile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  useEffect(() => setF(profile), [profile]);
  const set = (k: string, v: string) => setF(x => ({ ...x, [k]: v }));

  async function upload(field: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(field);
    const u = await uploadImage(file);
    if (u) set(field, u);
    setUploading(null); e.target.value = "";
  }

  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    const r = await api<any>("/api/agent-profile", { method: "POST", body: JSON.stringify(f) }, true);
    setSaving(false);
    if (r.success) { reload(); notify("Profile saved"); } else notify(r.message || "Failed", "error");
  }

  const text = (key: string, label: string) => (
    <Field label={label}><input className={inputCls} value={f[key] || ""} onChange={e => set(key, e.target.value)} /></Field>
  );

  return (
    <form onSubmit={save} className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-2 gap-4">
      <h2 className="col-span-2 font-display text-2xl font-bold">Agent & Agency Profile</h2>
      {text("agentName", "Agent Name")}{text("agentTitle", "Agent Title")}
      {text("rernaBRN", "RERA BRN")}{text("experience", "Years Experience")}
      <div className="col-span-2"><Field label="Bio"><textarea rows={3} className={inputCls} value={f.bio || ""} onChange={e => set("bio", e.target.value)} /></Field></div>
      {text("languages", "Languages")}{text("specialties", "Specialties")}
      <Field label="Agent Photo">
        <input type="file" accept="image/*" onChange={e => upload("photo", e)} className="text-sm" />
        {uploading === "photo" && <div className="text-xs">Uploading…</div>}
        {f.photo && <img src={f.photo} className="w-24 h-24 object-cover rounded mt-2" />}
      </Field>
      <Field label="Agency Logo">
        <input type="file" accept="image/*" onChange={e => upload("agencyLogo", e)} className="text-sm" />
        {uploading === "agencyLogo" && <div className="text-xs">Uploading…</div>}
        {f.agencyLogo && <img src={f.agencyLogo} className="w-24 h-24 object-cover rounded mt-2" />}
      </Field>
      {text("agencyName", "Agency Name")}{text("address", "Address")}
      {text("rernaNumber", "RERA Number")}{text("phone", "Phone")}
      {text("whatsapp", "WhatsApp")}{text("email", "Email")}
      <div className="col-span-2">{text("whatsappGreeting", "WhatsApp Greeting")}</div>
      {text("propertyFinderURL", "Property Finder URL")}{text("bayutURL", "Bayut URL")}
      {text("facebook", "Facebook")}{text("instagram", "Instagram")}
      {text("linkedin", "LinkedIn")}{text("youtube", "YouTube")}
      {text("siteName", "Site Name")}
      <div className="col-span-2">{text("siteDescription", "Site Description")}</div>
      <div className="col-span-2 flex justify-end">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save Profile"}</button>
      </div>
    </form>
  );
}

/* ---------------- Leads ---------------- */
function LeadsTab({ items }: { items: Lead[] }) {
  const [view, setView] = useState<Lead | null>(null);
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-4">Leads</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><Th>Date</Th><Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>Type</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No leads yet.</td></tr>}
            {items.map(l => (
              <tr key={`${l.type}-${l.id}`} className="border-t">
                <td className="p-3">{new Date(l.created_at || l.createdAt || Date.now()).toLocaleDateString()}</td>
                <td className="p-3 font-semibold">{l.name || "—"}</td>
                <td className="p-3">{l.phone || "—"}</td>
                <td className="p-3">{l.email || "—"}</td>
                <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{l.type}</span></td>
                <td className="p-3 flex gap-1">
                  <button onClick={() => setView(l)} className="px-3 py-1 bg-[#0A1628] text-white rounded text-xs">View</button>
                  {l.phone && <a href={`https://wa.me/${String(l.phone).replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded text-xs">WhatsApp</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view && (
        <Modal title="Lead Details" onClose={() => setView(null)}>
          <dl className="text-sm space-y-2">
            {Object.entries(view).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 border-b py-1">
                <dt className="font-semibold text-gray-600">{k}</dt>
                <dd className="col-span-2 break-all">{String(v ?? "")}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
    </div>
  );
}
