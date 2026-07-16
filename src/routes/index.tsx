import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bath, BedDouble, Building2, Calendar, Check, ChevronDown, ChevronRight,
  Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, Menu, Phone, Ruler,
  Search, Send, Star, TrendingUp, X, MessageCircle, ArrowUp, ArrowRight,
  Sparkles, ShieldCheck, Award, Clock, Home as HomeIcon, KeyRound, Wallet,
  Building, Calculator, Globe, Filter,
} from "lucide-react";
import heroDubai from "@/assets/hero-dubai.jpg";
import heroDubai2 from "@/assets/hero-dubai-2.jpg";
import heroDubai3 from "@/assets/hero-dubai-3.jpg";

export const Route = createFileRoute("/")({ component: App });

/* ==================== CONFIG & LOCAL DATA ==================== */

const DEFAULT_CFG = {
  agentName: "Ahmed Khan",
  agentTitle: "Luxury Real Estate Specialist",
  rernaBRN: "123456",
  experience: "12",
  bio: "With over 12 years in Dubai's luxury real estate market, I help clients find dream homes and make smart investments — specializing in off-plan projects and Golden Visa properties.",
  languages: "English, Arabic, Urdu, Hindi",
  photo: "",
  specialties: "Luxury Properties, Off-Plan Investments, Golden Visa, Property Valuation, Portfolio Management",
  agencyName: "AK Web Services",
  agencyLogo: "",
  address: "Dubai, UAE",
  rernaNumber: "123456",
  phone: "+971501234567",
  whatsapp: "+971501234567",
  email: "info@akwebservices.com",
  whatsappGreeting: "Hello! I'm interested in your real estate services.",
  propertyFinderURL: "#",
  bayutURL: "#",
  social: { facebook: "#", instagram: "#", linkedin: "#", youtube: "#" },
  stats: { yearsExperience: "12", propertiesSold: "850", happyClients: "1200" },
};

type Listing = {
  id: string | number; title: string; type: string; status: string;
  price: number; community: string; building?: string; bedrooms: number;
  bathrooms: number; sqft: number; floor?: string; view?: string;
  furnishing?: string; parking?: string; permit?: string; description?: string;
  features?: string[]; images?: string[]; whatsappText?: string; featured?: boolean;
};
type Offplan = {
  id: string | number; projectName: string; developer: string; community: string;
  types?: string[]; startingPrice: number; handoverDate: string;
  paymentPlan?: { downPayment?: string; duringConstruction?: string; onHandover?: string; display?: string };
  description?: string; highlights?: string[]; goldenVisaEligible?: boolean;
  image?: string; brochureWhatsApp?: string; featured?: boolean;
};
type Community = {
  id: string | number; name: string; slug?: string; description?: string;
  lifestyle?: string; avgApartmentPrice?: number; avgVillaPrice?: number;
  avgRentalYield?: string | number; avgRent1BR?: number; avgRent2BR?: number;
  highlights?: string[]; nearbyLandmarks?: string[]; metroStation?: string;
  communityType?: string; popular?: boolean;
};

const DEMO_LISTINGS: Listing[] = [
  {
    id: "DT-001",
    title: "Skyline Residence Downtown",
    type: "Apartment",
    status: "for-sale",
    price: 3250000,
    community: "Downtown Dubai",
    building: "Boulevard Heights",
    bedrooms: 2,
    bathrooms: 3,
    sqft: 1480,
    floor: "High Floor",
    view: "Burj Khalifa",
    furnishing: "Furnished",
    permit: "AK-1001",
    description: "A polished downtown residence with floor-to-ceiling views, refined finishes, and immediate access to Dubai's premium lifestyle destinations.",
    features: ["Balcony", "Pool", "Gym", "Concierge", "Covered Parking"],
    images: [heroDubai],
    featured: true,
  },
  {
    id: "MJ-002",
    title: "Waterfront Villa at Palm Jumeirah",
    type: "Villa",
    status: "for-sale",
    price: 12400000,
    community: "Palm Jumeirah",
    building: "Frond Villas",
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6100,
    floor: "Ground + 1",
    view: "Private Beach",
    furnishing: "Unfurnished",
    permit: "AK-1002",
    description: "A private beachfront address created for families who want space, security, and an unmistakable Dubai waterfront setting.",
    features: ["Private Beach", "Garden", "Maid Room", "Driver Room", "Private Pool"],
    images: [heroDubai2],
    featured: true,
  },
  {
    id: "DM-003",
    title: "Marina View Penthouse",
    type: "Penthouse",
    status: "for-rent",
    price: 420000,
    community: "Dubai Marina",
    building: "Marina Promenade",
    bedrooms: 4,
    bathrooms: 5,
    sqft: 3920,
    floor: "Penthouse",
    view: "Marina Skyline",
    furnishing: "Fully Furnished",
    permit: "AK-1003",
    description: "An elevated marina home with generous entertaining space, panoramic water views, and easy access to the promenade.",
    features: ["Terrace", "Sea View", "Smart Home", "Gym", "Pool"],
    images: [heroDubai3],
    featured: true,
  },
];

const DEMO_OFFPLAN: Offplan[] = [
  {
    id: "OP-001",
    projectName: "Azure Bay Residences",
    developer: "Emaar",
    community: "Dubai Creek Harbour",
    types: ["1 Bedroom", "2 Bedroom", "3 Bedroom"],
    startingPrice: 1850000,
    handoverDate: "Q4 2028",
    paymentPlan: { display: "20% Down | 60% Construction | 20% Handover" },
    description: "Waterfront apartments with strong rental fundamentals and long-term capital growth potential.",
    highlights: ["Waterfront", "Flexible Payment Plan", "Creek Views"],
    goldenVisaEligible: true,
    image: heroDubai2,
    featured: true,
  },
  {
    id: "OP-002",
    projectName: "The Orchard Villas",
    developer: "Nakheel",
    community: "Meydan",
    types: ["4 Bedroom", "5 Bedroom"],
    startingPrice: 5800000,
    handoverDate: "Q2 2027",
    paymentPlan: { display: "10% Down | 70% Construction | 20% Handover" },
    description: "Contemporary family villas in a low-density community with parks, schools, and quick city access.",
    highlights: ["Family Community", "Parks", "Premium Villas"],
    goldenVisaEligible: true,
    image: heroDubai3,
    featured: true,
  },
  {
    id: "OP-003",
    projectName: "Luxe Tower Business Bay",
    developer: "Sobha",
    community: "Business Bay",
    types: ["Studio", "1 Bedroom", "2 Bedroom"],
    startingPrice: 1200000,
    handoverDate: "Q1 2029",
    paymentPlan: { display: "15% Down | 55% Construction | 30% Handover" },
    description: "High-rise city apartments designed for investors seeking central location and strong rental demand.",
    highlights: ["Canal Views", "Central Location", "High ROI"],
    goldenVisaEligible: false,
    image: heroDubai,
    featured: true,
  },
];

const DEMO_COMMUNITIES: Community[] = [
  { id: "C-001", name: "Downtown Dubai", communityType: "Luxury City Living", avgApartmentPrice: 2500000, avgRentalYield: "6.2", popular: true },
  { id: "C-002", name: "Palm Jumeirah", communityType: "Waterfront Villas", avgApartmentPrice: 4300000, avgRentalYield: "5.8", popular: true },
  { id: "C-003", name: "Dubai Marina", communityType: "Marina Lifestyle", avgApartmentPrice: 2100000, avgRentalYield: "7.1", popular: true },
  { id: "C-004", name: "Dubai Hills", communityType: "Family Community", avgApartmentPrice: 1800000, avgRentalYield: "6.5", popular: false },
];

/* ==================== UTIL ==================== */
const aed = (n?: number) => n ? `AED ${Number(n).toLocaleString("en-US")}` : "AED —";
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

function useCountUp(target: number, duration = 1600, start: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return v;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

/* ==================== TOAST ==================== */
type Toast = { id: number; msg: string; type: "success" | "error" };
let toastId = 0;
const toastListeners = new Set<(t: Toast) => void>();
const toast = (msg: string, type: Toast["type"] = "success") =>
  toastListeners.forEach(l => l({ id: ++toastId, msg, type }));

function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const l = (t: Toast) => {
      setItems(x => [...x, t]);
      setTimeout(() => setItems(x => x.filter(i => i.id !== t.id)), 3800);
    };
    toastListeners.add(l);
    return () => { toastListeners.delete(l); };
  }, []);
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2">
      {items.map(t => (
        <div key={t.id} className={cx(
          "px-5 py-3 rounded-lg shadow-2xl text-sm font-medium backdrop-blur-md border",
          t.type === "success" ? "bg-[#0A1628]/95 text-[#E8D5A3] border-[#C9A84C]/40" : "bg-red-600 text-white border-red-800"
        )}>{t.msg}</div>
      ))}
    </div>
  );
}

/* ==================== SHARED UI ==================== */
function GoldDivider() {
  return <div className="w-16 h-[2px] bg-[#C9A84C] mb-6" />;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[#C9A84C] uppercase tracking-[0.3em] text-xs font-semibold mb-4">{children}</div>;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("shimmer rounded-xl", className)} />;
}

function ImagePlaceholder({ text, variant = "navy" }: { text?: string; variant?: "navy" | "gold" | "mix" }) {
  const bg = variant === "gold"
    ? "linear-gradient(135deg,#C9A84C 0%,#0A1628 100%)"
    : variant === "mix"
    ? "linear-gradient(135deg,#0F2040 0%,#C9A84C 100%)"
    : "linear-gradient(135deg,#0A1628 0%,#142850 60%,#C9A84C 140%)";
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
      <Building2 className="w-16 h-16 text-white/25" strokeWidth={1} />
      {text && <div className="absolute bottom-3 left-4 text-white/70 text-xs uppercase tracking-widest">{text}</div>}
    </div>
  );
}

/* ==================== NAVBAR ==================== */
function Navbar({ section, setSection, cfg }: { section: string; setSection: (s: string) => void; cfg: typeof DEFAULT_CFG }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on(); window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const go = (s: string) => { setSection(s); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const leftNav = [
    ["listings", "Properties"], ["offplan", "Off-Plan"], ["valuation", "Valuation"],
  ] as const;
  const rightNav = [
    ["communities", "Communities"], ["about", "About"], ["contact", "Contact"], ["golden", "Golden Visa"],
  ] as const;

  const NavItem = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => go(id)} className="relative py-2 text-sm font-medium transition-colors hover:text-[#C9A84C] uppercase tracking-widest">
      {label}
      <span className={cx(
        "absolute -bottom-0.5 left-0 h-[2px] bg-[#C9A84C] transition-all duration-300",
        section === id ? "w-full" : "w-0"
      )} />
    </button>
  );

  return (
    <>
      <header className={cx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled || section !== "home"
          ? "bg-[#0A1628]/95 backdrop-blur-lg text-white border-b border-[#C9A84C]/20 py-3"
          : "bg-transparent text-white py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          <nav className="hidden lg:flex items-center gap-8 flex-1">
            {leftNav.map(([id, l]) => <NavItem key={id} id={id} label={l} />)}
          </nav>

          <button onClick={() => go("home")} className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-[#C9A84C] flex items-center justify-center font-display font-bold text-[#C9A84C]">AK</div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-base leading-none">{cfg.agencyName}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]/80 mt-1">Luxury Dubai</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
            {rightNav.map(([id, l]) => <NavItem key={id} id={id} label={l} />)}
          </nav>

          <button className="lg:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden bg-[#0A1628] border-t border-[#C9A84C]/20 px-6 py-6 flex flex-col gap-4">
            {[...leftNav, ...rightNav].map(([id, l]) => (
              <button key={id} onClick={() => go(id)} className={cx(
                "text-left py-2 uppercase tracking-widest text-sm",
                section === id ? "text-[#C9A84C]" : "text-white"
              )}>{l}</button>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

/* ==================== HERO ==================== */
function Particles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const dots = useMemo(() => Array.from({ length: 22 }, () => ({
    left: Math.random() * 100, top: Math.random() * 100,
    delay: Math.random() * 6, size: 2 + Math.random() * 3,
  })), []);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <span key={i} className="absolute rounded-full bg-[#C9A84C] particle"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, opacity: 0.5 }}
        />
      ))}
    </div>
  );
}


function HeroSlideshow({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Dubai skyline"
          width={1920}
          height={1280}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover scale-110 animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </div>
  );
}

function Hero({ cfg, setSection }: { cfg: typeof DEFAULT_CFG; setSection: (s: string) => void }) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const years = useCountUp(Number(cfg.stats.yearsExperience) || 12, 1400, seen);
  const props = useCountUp(Number(cfg.stats.propertiesSold) || 850, 1600, seen);
  const clients = useCountUp(Number(cfg.stats.happyClients) || 1200, 1800, seen);
  const value = useCountUp(500, 2000, seen);
  const wa = cfg.whatsapp.replace(/\D/g, "");

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-[#050D1A]">
      {/* Rotating background slideshow (static images, ~3s each) */}
      <HeroSlideshow images={[heroDubai, heroDubai2, heroDubai3]} />

      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/70 via-[#0A1628]/60 to-[#050D1A]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050D1A_85%)]" />
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%,#C9A84C 0%,transparent 40%),radial-gradient(circle at 80% 70%,#0F2040 0%,transparent 50%)" }} />
      <Particles />

      <div className="relative max-w-5xl mx-auto px-6 text-center py-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 mb-8 text-xs uppercase tracking-[0.3em] text-[#E8D5A3]">
          <ShieldCheck className="w-3.5 h-3.5" /> RERA Licensed · Dubai's #1 Choice
        </div>
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6">
          Find Your Perfect <span className="text-[#C9A84C] italic">Dubai</span> Property
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 font-light">
          {cfg.agentTitle} — curating the city's most exceptional homes and investments.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button onClick={() => setSection("listings")}
            className="group inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B96A] text-[#0A1628] font-semibold px-8 py-4 rounded-full transition-all shadow-[0_10px_30px_-10px_rgba(201,168,76,0.6)] hover:shadow-[0_16px_40px_-10px_rgba(201,168,76,0.7)] hover:-translate-y-0.5">
            Browse Properties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent(cfg.whatsappGreeting)}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold px-8 py-4 rounded-full transition-all">
            <MessageCircle className="w-4 h-4" /> WhatsApp Now
          </a>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded border border-[#C9A84C]/40 text-[#C9A84C] text-xs tracking-widest uppercase">
          <Award className="w-3.5 h-3.5" /> RERA BRN · {cfg.rernaBRN}
        </div>

        <div ref={ref} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#C9A84C]/20 rounded-2xl overflow-hidden border border-[#C9A84C]/20 backdrop-blur-md">
          {[
            [`${years}+`, "Years Experience"],
            [`${props.toLocaleString()}+`, "Properties Sold"],
            [`${clients.toLocaleString()}+`, "Happy Clients"],
            [`AED ${value}M+`, "Value Transacted"],
          ].map(([n, l]) => (
            <div key={l} className="bg-[#0A1628]/80 p-6 md:p-8">
              <div className="font-display font-bold text-2xl md:text-4xl text-[#C9A84C]">{n}</div>
              <div className="text-xs uppercase tracking-widest text-white/60 mt-2">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 hover:text-[#C9A84C] transition animate-bounce">
        <ChevronDown className="w-6 h-6" />
      </button>
    </section>
  );
}

/* ==================== PROPERTY CARD ==================== */
function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const map: Record<string, string> = {
    "for-sale": "bg-[#C9A84C] text-[#0A1628]",
    "for-rent": "bg-[#0A1628] text-white",
    "sold": "bg-gray-400 text-white",
  };
  const label = s.replace("-", " ").toUpperCase() || "AVAILABLE";
  return <span className={cx("px-3 py-1 rounded-full text-[10px] font-bold tracking-widest", map[s] || "bg-[#0A1628] text-white")}>{label}</span>;
}

function PropertyCard({ l, cfg, onOpen }: { l: Listing; cfg: typeof DEFAULT_CFG; onOpen: (l: Listing) => void }) {
  const wa = cfg.whatsapp.replace(/\D/g, "");
  const waText = encodeURIComponent(l.whatsappText || `Hi, I'm interested in "${l.title}" (${aed(l.price)}). Please share more info.`);
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-[0_10px_40px_-20px_rgba(10,22,40,0.15)] hover:shadow-[0_20px_60px_-20px_rgba(10,22,40,0.25)] hover:-translate-y-1 transition-all duration-500">
      <div className="relative aspect-[16/10] overflow-hidden">
        {l.images && l.images[0] ? (
          <img src={l.images[0]} alt={l.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : <ImagePlaceholder />}
        <div className="absolute top-4 left-4"><StatusBadge status={l.status} /></div>
        {l.featured && <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-[#C9A84C]"><Star className="w-3 h-3 fill-[#C9A84C]" /> Featured</div>}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0A1628]/95 via-[#0A1628]/60 to-transparent">
          <div className="font-display text-2xl font-bold text-[#C9A84C]">{aed(l.price)}</div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-[#0A1628] line-clamp-1">{l.title}</h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {[l.community, l.building].filter(Boolean).join(" · ")}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#C9A84C]" /> {l.bedrooms || 0} Beds</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#C9A84C]" /> {l.bathrooms || 0} Baths</span>
          <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-[#C9A84C]" /> {(l.sqft || 0).toLocaleString()} sqft</span>
        </div>
        <div className="h-px bg-gray-100 my-4" />
        <div className="flex gap-2">
          <button onClick={() => onOpen(l)} className="flex-1 bg-[#0A1628] hover:bg-[#142850] text-white text-sm font-semibold py-2.5 rounded-lg transition">View Details</button>
          <a href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"
            className="bg-[#C9A84C] hover:bg-[#D4B96A] text-[#0A1628] p-2.5 rounded-lg transition"><MessageCircle className="w-4 h-4" /></a>
        </div>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-black/5">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/* ==================== FEATURED LISTINGS ==================== */
function FeaturedListings({ listings, loading, cfg, onOpen, setSection }: {
  listings: Listing[]; loading: boolean; cfg: typeof DEFAULT_CFG; onOpen: (l: Listing) => void; setSection: (s: string) => void;
}) {
  const featured = (listings.filter(l => l.featured).length ? listings.filter(l => l.featured) : listings).slice(0, 6);
  return (
    <section className="bg-[#F8F6F0] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between items-end mb-12 gap-4">
          <div>
            <SectionLabel>Handpicked</SectionLabel>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628]">Featured Properties</h2>
          </div>
          <button onClick={() => setSection("listings")} className="text-[#C9A84C] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : featured.length ? featured.map(l => <PropertyCard key={l.id} l={l} cfg={cfg} onOpen={onOpen} />)
            : <div className="col-span-full text-center text-gray-500 py-12">Properties coming soon.</div>}
        </div>
      </div>
    </section>
  );
}

/* ==================== OFFPLAN ==================== */
function OffplanCard({ p, cfg }: { p: Offplan; cfg: typeof DEFAULT_CFG }) {
  const wa = cfg.whatsapp.replace(/\D/g, "");
  const text = encodeURIComponent(p.brochureWhatsApp || `Hi, please send me the brochure for ${p.projectName} by ${p.developer}.`);
  return (
    <article className="group bg-[#0F2040] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/40 transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        {p.image ? <img src={p.image} alt={p.projectName} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          : <ImagePlaceholder variant="mix" />}
        {p.goldenVisaEligible && (
          <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] text-[#0A1628] text-[10px] uppercase tracking-[0.25em] font-bold py-1.5 text-center">
            ✦ Golden Visa Eligible ✦
          </div>
        )}
        {p.featured && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-[#C9A84C] px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#C9A84C]" /> Featured
          </div>
        )}
      </div>
      <div className="p-6 text-white">
        <div className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">{p.developer}</div>
        <h3 className="font-display text-2xl font-bold">{p.projectName}</h3>
        <p className="text-white/60 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.community}</p>
        <div className="mt-4 text-[#C9A84C] font-display text-xl">From {aed(p.startingPrice)}</div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {p.paymentPlan?.display && (
            <span className="px-2.5 py-1 border border-[#C9A84C]/50 text-[#C9A84C] rounded-full font-semibold">{p.paymentPlan.display}</span>
          )}
          <span className="text-white/60 flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.handoverDate}</span>
        </div>
        {p.types && p.types.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.types.slice(0, 5).map(t => <span key={t} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/70">{t}</span>)}
          </div>
        )}
        <a href={`https://wa.me/${wa}?text=${text}`} target="_blank" rel="noreferrer"
          className="mt-5 block text-center bg-[#C9A84C] hover:bg-[#D4B96A] text-[#0A1628] font-semibold py-3 rounded-lg transition">
          Register Interest
        </a>
      </div>
    </article>
  );
}

function FeaturedOffplan({ offplan, loading, cfg }: { offplan: Offplan[]; loading: boolean; cfg: typeof DEFAULT_CFG }) {
  const items = (offplan.filter(o => o.featured).length ? offplan.filter(o => o.featured) : offplan).slice(0, 6);
  return (
    <section className="bg-gradient-to-b from-[#0A1628] to-[#050D1A] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Off-Plan</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Premium Off-Plan Investments</h2>
          <p className="text-white/60 mt-4">Flexible payment plans. High ROI. Capital appreciation from Dubai's most trusted developers.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#0F2040] rounded-2xl overflow-hidden">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="p-6 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full" /></div>
            </div>
          )) : items.length ? items.map(p => <OffplanCard key={p.id} p={p} cfg={cfg} />)
            : <div className="col-span-full text-center text-white/50 py-12">Off-plan projects launching soon.</div>}
        </div>
      </div>
    </section>
  );
}

/* ==================== COMMUNITIES ==================== */
function CommunityCard({ c, i }: { c: Community; i: number }) {
  const variant = (["navy", "gold", "mix"] as const)[i % 3];
  return (
    <article className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer">
      <ImagePlaceholder variant={variant} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/30 to-transparent" />
      {c.popular && <div className="absolute top-4 right-4 bg-[#C9A84C] text-[#0A1628] px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest">POPULAR</div>}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <h3 className="font-display text-2xl md:text-3xl font-bold">{c.name}</h3>
        <div className="text-xs text-white/70 uppercase tracking-widest mt-1">{c.communityType || "Community"}</div>
        <div className="mt-4 overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 opacity-0 group-hover:opacity-100">
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {c.avgApartmentPrice && <div><div className="text-white/50">Avg Apt</div><div className="text-[#C9A84C] font-semibold">{aed(c.avgApartmentPrice)}</div></div>}
            {c.avgRentalYield && <div><div className="text-white/50">Rental Yield</div><div className="text-[#C9A84C] font-semibold">{c.avgRentalYield}%</div></div>}
          </div>
          <button className="text-[#C9A84C] text-sm font-semibold flex items-center gap-1">Explore <ArrowRight className="w-3 h-3" /></button>
        </div>
      </div>
    </article>
  );
}

function CommunitiesGrid({ communities, loading, full = false }: { communities: Community[]; loading: boolean; full?: boolean }) {
  const items = full ? communities : communities.slice(0, 4);
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Neighborhoods</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628]">Explore Dubai Communities</h2>
          <p className="text-gray-500 mt-4">From waterfront villas to skyline apartments — find where you belong.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
            : items.length ? items.map((c, i) => <CommunityCard key={c.id} c={c} i={i} />)
            : <div className="col-span-full text-center text-gray-400 py-12">Community guides coming soon.</div>}
        </div>
      </div>
    </section>
  );
}

/* ==================== ABOUT AGENT ==================== */
const TESTIMONIALS = [
  { name: "Sarah Johnson", detail: "Property Investor, UK", quote: "Ahmed helped me find the perfect investment property in Dubai. His knowledge of off-plan projects and market trends is exceptional." },
  { name: "Michael Chen", detail: "Business Owner, Singapore", quote: "Professional, responsive, and truly understands luxury real estate. Made our purchase seamless." },
  { name: "Priya Sharma", detail: "Golden Visa Investor, India", quote: "From property selection to Golden Visa — every step was handled with care and expertise." },
];

function AboutAgent({ cfg }: { cfg: typeof DEFAULT_CFG }) {
  const [ti, setTi] = useState(0);
  useEffect(() => { const t = setInterval(() => setTi(i => (i + 1) % TESTIMONIALS.length), 5000); return () => clearInterval(t); }, []);
  const specs = (cfg.specialties || "").split(",").map(s => s.trim()).filter(Boolean);
  const langs = (cfg.languages || "").split(",").map(s => s.trim()).filter(Boolean);
  return (
    <section className="bg-[#F8F6F0] py-24">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-14 items-center">
        <div className="lg:col-span-2 relative">
          <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-[#C9A84C] rounded-full opacity-40" />
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#C9A84C]/10 rounded-full" />
          <div className="relative aspect-square rounded-full overflow-hidden ring-8 ring-[#C9A84C]/30 shadow-2xl max-w-md mx-auto">
            {cfg.photo ? <img src={cfg.photo} alt={cfg.agentName} className="w-full h-full object-cover" />
              : <ImagePlaceholder variant="navy" text={cfg.agentName} />}
          </div>
        </div>
        <div className="lg:col-span-3">
          <SectionLabel>Your Trusted Advisor</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628]">{cfg.agentName}</h2>
          <p className="text-[#C9A84C] font-medium mt-2">{cfg.agentTitle}</p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded border border-[#C9A84C]/40 text-[#C9A84C] text-xs tracking-widest uppercase">
            <Award className="w-3 h-3" /> BRN {cfg.rernaBRN}
          </div>
          <p className="text-gray-600 mt-6 leading-relaxed">{cfg.bio}</p>
          <div className="grid grid-cols-3 gap-4 mt-6 py-6 border-y border-black/10">
            {[[cfg.stats.yearsExperience + "+", "Years"], [cfg.stats.propertiesSold + "+", "Properties"], [cfg.stats.happyClients + "+", "Clients"]].map(([n, l]) => (
              <div key={l}><div className="font-display text-2xl font-bold text-[#0A1628]">{n}</div><div className="text-xs text-gray-500 uppercase tracking-widest">{l}</div></div>
            ))}
          </div>
          {specs.length > 0 && (
            <div className="mt-6"><div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Specialties</div>
              <div className="flex flex-wrap gap-2">{specs.map(s => <span key={s} className="px-3 py-1 bg-[#C9A84C]/10 text-[#0A1628] border border-[#C9A84C]/30 rounded-full text-xs font-medium">{s}</span>)}</div>
            </div>
          )}
          {langs.length > 0 && (
            <div className="mt-4"><div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Languages</div>
              <div className="flex flex-wrap gap-2">{langs.map(s => <span key={s} className="px-3 py-1 bg-white border border-black/10 rounded-full text-xs"><Globe className="inline w-3 h-3 mr-1 text-[#C9A84C]" />{s}</span>)}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <a href={cfg.propertyFinderURL} target="_blank" rel="noreferrer" className="px-5 py-3 border border-black/10 rounded-lg text-sm font-semibold hover:border-[#C9A84C] transition">View on Property Finder</a>
            <a href={cfg.bayutURL} target="_blank" rel="noreferrer" className="px-5 py-3 border border-black/10 rounded-lg text-sm font-semibold hover:border-[#C9A84C] transition">View on Bayut</a>
          </div>

          <div className="mt-10 bg-white rounded-2xl p-8 border border-black/5 shadow-sm">
            <div className="flex gap-0.5 mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />)}</div>
            <p className="font-display italic text-lg text-[#0A1628] leading-relaxed">"{TESTIMONIALS[ti].quote}"</p>
            <div className="mt-4 flex items-center justify-between">
              <div><div className="font-semibold text-[#0A1628]">{TESTIMONIALS[ti].name}</div><div className="text-xs text-gray-500">{TESTIMONIALS[ti].detail}</div></div>
              <div className="flex gap-1">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setTi(i)} className={cx("w-2 h-2 rounded-full transition", i === ti ? "bg-[#C9A84C] w-6" : "bg-black/20")} />)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== LISTINGS PAGE ==================== */
function ListingsPage({ listings, loading, cfg, onOpen }: { listings: Listing[]; loading: boolean; cfg: typeof DEFAULT_CFG; onOpen: (l: Listing) => void }) {
  const [q, setQ] = useState(""); const [type, setType] = useState(""); const [comm, setComm] = useState("");
  const [status, setStatus] = useState(""); const [beds, setBeds] = useState(""); const [minP, setMinP] = useState(""); const [maxP, setMaxP] = useState("");
  const types = useMemo(() => Array.from(new Set(listings.map(l => l.type).filter(Boolean))), [listings]);
  const communities = useMemo(() => Array.from(new Set(listings.map(l => l.community).filter(Boolean))), [listings]);

  const filtered = listings.filter(l => {
    if (q && !(`${l.title} ${l.community} ${l.building}`).toLowerCase().includes(q.toLowerCase())) return false;
    if (type && l.type !== type) return false;
    if (comm && l.community !== comm) return false;
    if (status && l.status !== status) return false;
    if (beds) { const b = Number(beds); if (b === 5 ? l.bedrooms < 5 : l.bedrooms !== b) return false; }
    if (minP && l.price < Number(minP)) return false;
    if (maxP && l.price > Number(maxP)) return false;
    return true;
  });
  const clear = () => { setQ(""); setType(""); setComm(""); setStatus(""); setBeds(""); setMinP(""); setMaxP(""); };

  const inp = "px-4 py-3 rounded-lg border border-black/10 bg-white text-sm w-full focus:border-[#C9A84C] focus:outline-none transition";

  return (
    <section className="pt-32 pb-24 bg-[#F8F6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <SectionLabel>Browse</SectionLabel>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628]">All Properties</h1>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-5 mb-8 shadow-sm">
          <div className="grid md:grid-cols-4 gap-3 mb-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input placeholder="Search properties…" value={q} onChange={e => setQ(e.target.value)} className={inp + " pl-10"} />
            </div>
            <select value={type} onChange={e => setType(e.target.value)} className={inp}><option value="">All Types</option>{types.map(t => <option key={t}>{t}</option>)}</select>
            <select value={comm} onChange={e => setComm(e.target.value)} className={inp}><option value="">All Communities</option>{communities.map(c => <option key={c}>{c}</option>)}</select>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inp}><option value="">Any Status</option><option value="for-sale">For Sale</option><option value="for-rent">For Rent</option><option value="sold">Sold</option></select>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <input inputMode="numeric" placeholder="Min Price (AED)" value={minP} onChange={e => setMinP(e.target.value.replace(/\D/g, ""))} className={inp} />
            <input inputMode="numeric" placeholder="Max Price (AED)" value={maxP} onChange={e => setMaxP(e.target.value.replace(/\D/g, ""))} className={inp} />
            <select value={beds} onChange={e => setBeds(e.target.value)} className={inp}><option value="">Any Bedrooms</option><option value="0">Studio</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5+</option></select>
            <button onClick={clear} className="px-4 py-3 rounded-lg border border-black/10 text-sm font-semibold hover:bg-black/5 flex items-center justify-center gap-2"><Filter className="w-4 h-4" /> Clear Filters</button>
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-6">Showing <b className="text-[#0A1628]">{filtered.length}</b> of {listings.length} properties</div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : filtered.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(l => <PropertyCard key={l.id} l={l} cfg={cfg} onOpen={onOpen} />)}</div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
            <div className="font-display text-2xl text-[#0A1628] mb-2">No properties match your filters</div>
            <button onClick={clear} className="mt-4 px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-semibold rounded-full">Clear Filters</button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ==================== OFFPLAN PAGE ==================== */
function OffplanPage({ offplan, loading, cfg }: { offplan: Offplan[]; loading: boolean; cfg: typeof DEFAULT_CFG }) {
  return (
    <div className="pt-24">
      <FeaturedOffplan offplan={offplan} loading={loading} cfg={cfg} />
    </div>
  );
}

/* ==================== PROPERTY MODAL ==================== */
function PropertyModal({ l, cfg, onClose }: { l: Listing | null; cfg: typeof DEFAULT_CFG; onClose: () => void }) {
  const [img, setImg] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  useEffect(() => {
    if (!l) return;
    setImg(0);
    setForm(f => ({ ...f, message: `I'm interested in "${l.title}" (Ref: ${l.id}). Please share more info.` }));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [l]);
  if (!l) return null;
  const wa = cfg.whatsapp.replace(/\D/g, "");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast("Message saved locally — use WhatsApp for direct sending.");
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen py-10 px-4 flex items-start justify-center">
        <div className="bg-white rounded-2xl max-w-6xl w-full overflow-hidden relative" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/95 rounded-full p-2 shadow hover:bg-white"><X className="w-5 h-5" /></button>
          <div className="bg-[#0A1628]">
            <div className="aspect-video">
              {l.images && l.images[img] ? <img src={l.images[img]} alt={l.title} className="w-full h-full object-cover" /> : <ImagePlaceholder />}
            </div>
            {l.images && l.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {l.images.map((src, i) => (
                  <button key={i} onClick={() => setImg(i)} className={cx("shrink-0 w-24 h-16 rounded overflow-hidden border-2", i === img ? "border-[#C9A84C]" : "border-transparent opacity-60")}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-8 p-8">
            <div>
              <StatusBadge status={l.status} />
              <h1 className="font-display text-3xl md:text-5xl font-bold text-[#0A1628] mt-3">{l.title}</h1>
              <div className="font-display text-3xl text-[#C9A84C] mt-2">{aed(l.price)}</div>
              <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.community}</span>
                {l.building && <span>· {l.building}</span>}
                {l.permit && <span>· Permit {l.permit}</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 text-sm">
                {[["Bedrooms", l.bedrooms], ["Bathrooms", l.bathrooms], ["Size", `${(l.sqft || 0).toLocaleString()} sqft`],
                  ["Floor", l.floor], ["View", l.view], ["Furnishing", l.furnishing]].filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
                  <div key={String(k)} className="p-3 bg-[#F8F6F0] rounded-lg"><div className="text-[10px] uppercase tracking-widest text-gray-500">{k}</div><div className="font-semibold text-[#0A1628]">{String(v)}</div></div>
                ))}
              </div>
              {l.description && <div className="mt-8"><h3 className="font-display text-xl font-bold mb-2 text-[#0A1628]">About This Property</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line">{l.description}</p></div>}
              {l.features && l.features.length > 0 && (
                <div className="mt-8"><h3 className="font-display text-xl font-bold mb-3 text-[#0A1628]">Features</h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    {l.features.map(f => <div key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C9A84C]" /> {f}</div>)}
                  </div>
                </div>
              )}
            </div>
            <aside className="lg:sticky lg:top-4 self-start">
              <div className="bg-[#F8F6F0] rounded-2xl p-6 border border-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#0A1628] text-[#C9A84C] font-display font-bold flex items-center justify-center">AK</div>
                  <div><div className="font-semibold text-[#0A1628]">{cfg.agentName}</div><div className="text-xs text-gray-500">{cfg.agentTitle}</div></div>
                </div>
                <form onSubmit={submit} className="space-y-3">
                  <input required placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white focus:border-[#C9A84C] outline-none" />
                  <input required placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white focus:border-[#C9A84C] outline-none" />
                  <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white focus:border-[#C9A84C] outline-none" />
                  <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white focus:border-[#C9A84C] outline-none" />
                  <button type="submit" className="w-full bg-[#0A1628] hover:bg-[#142850] text-white font-semibold py-3 rounded-lg transition">Request Information</button>
                </form>
                <a href={`https://wa.me/${wa}?text=${encodeURIComponent(l.whatsappText || `Hi, I'm interested in ${l.title} (${aed(l.price)}).`)}`} target="_blank" rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold py-3 rounded-lg transition">
                  <MessageCircle className="w-4 h-4" /> WhatsApp This Property
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== VALUATION ==================== */
function ValuationPage({ cfg }: { cfg: typeof DEFAULT_CFG }) {
  const [f, setF] = useState({ propertyType: "", community: "", building: "", floor: "", bedrooms: "", bathrooms: "", size: "", condition: "", furnishing: "", purpose: "", name: "", phone: "", whatsapp: "", email: "" });
  const [done, setDone] = useState(false);
  const inp = "w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-sm focus:border-[#C9A84C] outline-none";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    toast("Valuation request saved locally.");
  };
  const wa = cfg.whatsapp.replace(/\D/g, "");
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-b from-[#0A1628] to-[#050D1A] text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionLabel>Free Valuation</SectionLabel>
          <h1 className="font-display text-4xl md:text-6xl font-bold">What Is Your Property Worth?</h1>
          <p className="text-white/70 mt-4 max-w-2xl mx-auto">Free expert valuation from a RERA-certified specialist — based on real DLD data.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
            {[["RERA Certified", ShieldCheck], ["Free Valuation", Award], ["24hr Response", Clock], ["DLD Data Based", Building]].map(([l, I]: any) => (
              <div key={l} className="px-4 py-2 rounded-full border border-[#C9A84C]/40 text-[#E8D5A3] flex items-center gap-2"><I className="w-3.5 h-3.5" /> {l}</div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#F8F6F0] py-20">
        <div className="max-w-4xl mx-auto px-6">
          {done ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-black/5 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#C9A84C]/20 flex items-center justify-center mb-4"><Check className="w-8 h-8 text-[#C9A84C]" /></div>
              <h2 className="font-display text-3xl font-bold text-[#0A1628]">Thank you!</h2>
              <p className="text-gray-600 mt-3">Your valuation is being prepared. Expect a call within <b>24 hours</b>.</p>
              <a href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi, I just submitted a valuation request.")}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full">
                <MessageCircle className="w-4 h-4" /> WhatsApp for faster response
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-2xl p-8 border border-black/5 shadow-sm grid md:grid-cols-2 gap-4">
              <select required value={f.propertyType} onChange={e => setF({ ...f, propertyType: e.target.value })} className={inp}><option value="">Property Type</option><option>Apartment</option><option>Villa</option><option>Townhouse</option><option>Penthouse</option><option>Studio</option></select>
              <input required placeholder="Community" value={f.community} onChange={e => setF({ ...f, community: e.target.value })} className={inp} />
              <input placeholder="Building Name" value={f.building} onChange={e => setF({ ...f, building: e.target.value })} className={inp} />
              <input placeholder="Floor" value={f.floor} onChange={e => setF({ ...f, floor: e.target.value })} className={inp} />
              <input required placeholder="Bedrooms" value={f.bedrooms} onChange={e => setF({ ...f, bedrooms: e.target.value })} className={inp} />
              <input required placeholder="Bathrooms" value={f.bathrooms} onChange={e => setF({ ...f, bathrooms: e.target.value })} className={inp} />
              <input required placeholder="Size (sqft)" value={f.size} onChange={e => setF({ ...f, size: e.target.value })} className={inp} />
              <select value={f.condition} onChange={e => setF({ ...f, condition: e.target.value })} className={inp}><option value="">Condition</option><option>Brand New</option><option>Excellent</option><option>Good</option><option>Needs Refurbishment</option></select>
              <select value={f.furnishing} onChange={e => setF({ ...f, furnishing: e.target.value })} className={inp}><option value="">Furnishing</option><option>Furnished</option><option>Semi-Furnished</option><option>Unfurnished</option></select>
              <select required value={f.purpose} onChange={e => setF({ ...f, purpose: e.target.value })} className={inp}><option value="">Purpose</option><option value="sell">Sell</option><option value="rent">Rent</option><option value="curious">Curious</option></select>
              <input required placeholder="Full Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp} />
              <input required placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inp} />
              <input placeholder="WhatsApp" value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} className={inp} />
              <input type="email" required placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inp} />
              <button className="md:col-span-2 bg-[#C9A84C] hover:bg-[#D4B96A] text-[#0A1628] font-bold py-4 rounded-lg transition mt-2">Get My Free Valuation</button>
            </form>
          )}

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {[["01", "Submit", "Share your property details in under 2 minutes."],
              ["02", "We Analyze", "Our RERA experts cross-reference DLD & market data."],
              ["03", "You Receive", "A detailed valuation report within 24 hours."]].map(([n, t, d]) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-black/5">
                <div className="text-[#C9A84C] font-display text-4xl font-bold">{n}</div>
                <div className="font-display font-bold text-[#0A1628] mt-2 text-lg">{t}</div>
                <div className="text-sm text-gray-500 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ==================== CONTACT ==================== */
function ContactPage({ cfg }: { cfg: typeof DEFAULT_CFG }) {
  const [tab, setTab] = useState<"message" | "viewing" | "whatsapp">("message");
  const wa = cfg.whatsapp.replace(/\D/g, "");
  const inp = "w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-sm focus:border-[#C9A84C] outline-none";

  return (
    <div className="pt-32 pb-20 bg-[#F8F6F0] min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <SectionLabel>Get In Touch</SectionLabel>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628]">Let's Talk Property</h1>
        </div>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {(["message", "viewing", "whatsapp"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cx("px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-widest transition",
                tab === t ? "bg-[#C9A84C] text-[#0A1628]" : "bg-white text-[#0A1628] border border-black/10 hover:border-[#C9A84C]")}>
              {t === "message" ? "Send Message" : t === "viewing" ? "Schedule Viewing" : "WhatsApp"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-sm">
          {tab === "message" && <MessageForm inp={inp} />}
          {tab === "viewing" && <ViewingForm inp={inp} />}
          {tab === "whatsapp" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[["🏠", "I want to BUY", "Hi, I'm looking to buy a property in Dubai."],
                ["🔑", "I want to RENT", "Hi, I'm looking to rent a property in Dubai."],
                ["💰", "I want to SELL", "Hi, I want to sell my property in Dubai."],
                ["🏗️", "Off-Plan Enquiry", "Hi, tell me about your off-plan projects."]].map(([e, l, m]) => (
                <a key={l} href={`https://wa.me/${wa}?text=${encodeURIComponent(m)}`} target="_blank" rel="noreferrer"
                  className="p-6 rounded-2xl border border-black/10 hover:border-[#25D366] hover:bg-[#25D366]/5 transition group">
                  <div className="text-3xl mb-2">{e}</div>
                  <div className="font-display font-bold text-lg text-[#0A1628]">{l}</div>
                  <div className="text-xs text-[#25D366] mt-1 font-semibold uppercase tracking-widest">Open WhatsApp →</div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[[Phone, "Phone", cfg.phone, `tel:${cfg.phone}`],
            [Mail, "Email", cfg.email, `mailto:${cfg.email}`],
            [MessageCircle, "WhatsApp", cfg.whatsapp, `https://wa.me/${wa}`],
            [MapPin, "Office", cfg.address, "#"]].map(([I, l, v, h]: any) => (
            <a key={l} href={h} className="bg-white rounded-2xl p-5 border border-black/5 hover:border-[#C9A84C] transition">
              <I className="w-5 h-5 text-[#C9A84C]" />
              <div className="text-xs uppercase tracking-widest text-gray-500 mt-2">{l}</div>
              <div className="font-semibold text-[#0A1628] mt-1 text-sm">{v}</div>
            </a>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-8">
          {[[Facebook, cfg.social.facebook], [Instagram, cfg.social.instagram], [Linkedin, cfg.social.linkedin], [Youtube, cfg.social.youtube]].map(([I, h]: any, i) => (
            <a key={i} href={h} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0A1628] text-white flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#0A1628] transition"><I className="w-4 h-4" /></a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageForm({ inp }: { inp: string }) {
  const [f, setF] = useState({ name: "", phone: "", whatsapp: "", email: "", inquiryType: "", budget: "", message: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast("Message saved locally — use WhatsApp for direct sending.");
    setF({ name: "", phone: "", whatsapp: "", email: "", inquiryType: "", budget: "", message: "" });
  };
  return (
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      <input required placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp} />
      <input required placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inp} />
      <input placeholder="WhatsApp" value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} className={inp} />
      <input type="email" required placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inp} />
      <select value={f.inquiryType} onChange={e => setF({ ...f, inquiryType: e.target.value })} className={inp}><option value="">Inquiry Type</option><option>Buy</option><option>Rent</option><option>Sell</option><option>Off-Plan</option><option>Golden Visa</option></select>
      <select value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })} className={inp}><option value="">Budget Range</option><option>Under 1M</option><option>1M – 3M</option><option>3M – 10M</option><option>10M+</option></select>
      <textarea required rows={4} placeholder="Message" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} className={inp + " md:col-span-2"} />
      <button className="md:col-span-2 bg-[#0A1628] hover:bg-[#142850] text-white font-semibold py-3.5 rounded-lg inline-flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send Message</button>
    </form>
  );
}

function ViewingForm({ inp }: { inp: string }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", property: "", date: "", time: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast("Viewing request saved locally — use WhatsApp for direct sending.");
    setF({ name: "", phone: "", email: "", property: "", date: "", time: "" });
  };
  return (
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      <input required placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp} />
      <input required placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inp} />
      <input type="email" required placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inp} />
      <input required placeholder="Property of Interest" value={f.property} onChange={e => setF({ ...f, property: e.target.value })} className={inp} />
      <input type="date" required value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className={inp} />
      <input type="time" required value={f.time} onChange={e => setF({ ...f, time: e.target.value })} className={inp} />
      <button className="md:col-span-2 bg-[#0A1628] hover:bg-[#142850] text-white font-semibold py-3.5 rounded-lg">Schedule Viewing</button>
    </form>
  );
}

/* ==================== GOLDEN VISA ==================== */
const GV_FAQ = [
  ["What is the minimum property value?", "AED 2,000,000 in ready or off-plan property (with 50% paid)."],
  ["Is the Golden Visa renewable?", "Yes — 10-year residency, renewable as long as ownership continues."],
  ["Can I sponsor my family?", "Yes — spouse, children, and parents can be sponsored under your visa."],
  ["Do I need a UAE sponsor?", "No — the Golden Visa does not require a local sponsor."],
  ["How long does the process take?", "Typically 2–4 weeks after title deed and application submission."],
];

function GoldenVisaPage({ listings, cfg, onOpen }: { listings: Listing[]; cfg: typeof DEFAULT_CFG; onOpen: (l: Listing) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const [f, setF] = useState({ name: "", phone: "", whatsapp: "", email: "", budget: "", status: "" });
  const eligible = listings.filter(l => (l.price || 0) >= 2000000).slice(0, 6);
  const inp = "w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-sm focus:border-[#C9A84C] outline-none";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast("Enquiry saved locally — use WhatsApp for direct sending.");
    setF({ name: "", phone: "", whatsapp: "", email: "", budget: "", status: "" });
  };
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-b from-[#0A1628] to-[#050D1A] text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionLabel>UAE Golden Visa</SectionLabel>
          <h1 className="font-display text-4xl md:text-6xl font-bold">UAE Golden Visa Through Property</h1>
          <p className="text-white/70 mt-4">10-Year Renewable Residency for AED 2M+ Investors</p>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {[[Award, "10-Year Residency", "Long-term stability for you and your family."],
              [Sparkles, "Sponsor Family", "Bring spouse, children, and parents."],
              [ShieldCheck, "No Sponsor Required", "Complete independence in the UAE."],
              [TrendingUp, "Tax-Free Living", "Zero personal income tax."]].map(([I, t, d]: any) => (
              <div key={t} className="p-6 rounded-2xl border border-black/5 bg-[#F8F6F0] hover:border-[#C9A84C] transition">
                <I className="w-8 h-8 text-[#C9A84C]" />
                <div className="font-display font-bold text-[#0A1628] mt-3 text-lg">{t}</div>
                <div className="text-sm text-gray-600 mt-1">{d}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0A1628] text-white rounded-2xl p-10 mb-16">
            <SectionLabel>Eligibility</SectionLabel>
            <div className="font-display text-3xl font-bold mb-6">Minimum <span className="text-[#C9A84C]">AED 2,000,000</span> Property Investment</div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
              {["Ready or off-plan (50%+ paid)", "Single or multiple properties", "Freehold zones only", "Valid Emirates ID required", "Clean criminal record", "Medical fitness certificate"].map(x => (
                <div key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C9A84C]" /> {x}</div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-8"><h2 className="font-display text-3xl font-bold text-[#0A1628]">The Process</h2></div>
            <div className="grid md:grid-cols-4 gap-4">
              {["Purchase", "Title Deed", "Apply ICP", "Golden Visa"].map((t, i) => (
                <div key={t} className="relative bg-[#F8F6F0] rounded-2xl p-6 border border-black/5">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-[#0A1628] font-bold flex items-center justify-center">{i + 1}</div>
                  <div className="font-display font-bold text-[#0A1628] mt-3">{t}</div>
                </div>
              ))}
            </div>
          </div>

          {eligible.length > 0 && (
            <div className="mb-16">
              <h2 className="font-display text-3xl font-bold text-[#0A1628] mb-6">Golden Visa Eligible Properties</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eligible.map(l => <PropertyCard key={l.id} l={l} cfg={cfg} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          <div className="mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-[#0A1628] mb-6 text-center">Frequently Asked</h2>
            <div className="space-y-3">
              {GV_FAQ.map(([q, a], i) => (
                <div key={q} className="bg-white border border-black/10 rounded-xl">
                  <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left font-semibold text-[#0A1628]">
                    <span>{q}</span>
                    <span className="text-[#C9A84C] text-xl">{open === i ? "−" : "+"}</span>
                  </button>
                  {open === i && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{a}</div>}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="bg-[#F8F6F0] rounded-2xl p-8 grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <h3 className="md:col-span-2 font-display text-2xl font-bold text-[#0A1628]">Get Golden Visa Guidance</h3>
            <input required placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp} />
            <input required placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inp} />
            <input placeholder="WhatsApp" value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} className={inp} />
            <input type="email" required placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inp} />
            <select required value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })} className={inp}><option value="">Investment Budget</option><option>2M – 3M</option><option>3M – 5M</option><option>5M – 10M</option><option>10M+</option></select>
            <select required value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className={inp}><option value="">Current Status</option><option>Researching</option><option>Ready to invest</option><option>Already own property</option></select>
            <button className="md:col-span-2 bg-[#C9A84C] hover:bg-[#D4B96A] text-[#0A1628] font-bold py-3.5 rounded-lg">Request Golden Visa Guidance</button>
          </form>
        </div>
      </section>
    </div>
  );
}

/* ==================== ROI CALCULATOR ==================== */
function ROICalculator() {
  const [price, setPrice] = useState(2000000);
  const [yieldPct, setYieldPct] = useState(7);
  const [years, setYears] = useState(5);
  const annual = price * (yieldPct / 100);
  const net = yieldPct;
  const total = annual * years;
  const exit = price * Math.pow(1.05, years);
  const profit = total + (exit - price);
  const Card = ({ l, v }: { l: string; v: string }) => (
    <div className="bg-[#0F2040] rounded-xl p-5 border border-[#C9A84C]/20">
      <div className="text-xs uppercase tracking-widest text-white/50">{l}</div>
      <div className="font-display text-2xl font-bold text-[#C9A84C] mt-1">{v}</div>
    </div>
  );
  const inp = "w-full px-4 py-3 rounded-lg bg-[#0F2040] border border-white/10 text-white focus:border-[#C9A84C] outline-none";
  return (
    <section className="bg-[#050D1A] text-white py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <SectionLabel>ROI</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Calculate Your Investment Returns</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 bg-[#0A1628] rounded-2xl p-8 border border-white/10">
          <div className="space-y-4">
            <div><label className="text-xs uppercase tracking-widest text-white/60">Property Price (AED)</label>
              <input inputMode="numeric" value={price} onChange={e => setPrice(Number(e.target.value.replace(/\D/g, "")) || 0)} className={inp + " mt-1"} /></div>
            <div><label className="text-xs uppercase tracking-widest text-white/60">Expected Rental Yield ({yieldPct}%)</label>
              <input type="range" min={3} max={12} step={0.5} value={yieldPct} onChange={e => setYieldPct(Number(e.target.value))} className="w-full mt-2 accent-[#C9A84C]" /></div>
            <div><label className="text-xs uppercase tracking-widest text-white/60">Holding Period ({years} years)</label>
              <input type="range" min={1} max={15} value={years} onChange={e => setYears(Number(e.target.value))} className="w-full mt-2 accent-[#C9A84C]" /></div>
            <div className="pt-2 flex items-center gap-2 text-[#C9A84C] text-sm"><Calculator className="w-4 h-4" /> Live estimate — indicative only.</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card l="Annual Rental" v={aed(Math.round(annual))} />
            <Card l="Net Yield" v={`${net}%`} />
            <Card l={`${years}-Year Total`} v={aed(Math.round(total))} />
            <Card l="Est. Exit Value" v={aed(Math.round(exit))} />
            <div className="col-span-2 bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] rounded-xl p-5 text-[#0A1628]">
              <div className="text-xs uppercase tracking-widest opacity-80">Total Profit</div>
              <div className="font-display text-3xl font-bold mt-1">{aed(Math.round(profit))}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== FOOTER ==================== */
function Footer({ cfg, setSection }: { cfg: typeof DEFAULT_CFG; setSection: (s: string) => void }) {
  const wa = cfg.whatsapp.replace(/\D/g, "");
  const Btn = ({ id, l }: { id: string; l: string }) => (
    <button onClick={() => { setSection(id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="block text-white/60 hover:text-[#C9A84C] transition text-sm py-1">{l}</button>
  );
  return (
    <footer className="bg-[#050D1A] text-white border-t-2 border-[#C9A84C]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#C9A84C] flex items-center justify-center font-display font-bold text-[#C9A84C]">AK</div>
            <div className="font-display font-bold text-lg">{cfg.agencyName}</div>
          </div>
          <p className="text-white/60 text-sm">Curating Dubai's finest properties for discerning clients worldwide.</p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded border border-[#C9A84C]/40 text-[#C9A84C] text-xs tracking-widest uppercase">
            <Award className="w-3 h-3" /> BRN {cfg.rernaBRN}
          </div>
          <div className="flex gap-2 mt-5">
            {[[Facebook, cfg.social.facebook], [Instagram, cfg.social.instagram], [Linkedin, cfg.social.linkedin], [Youtube, cfg.social.youtube]].map(([I, h]: any, i) => (
              <a key={i} href={h} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#0A1628] transition"><I className="w-4 h-4" /></a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-[#C9A84C] mb-4">Properties</div>
          <Btn id="listings" l="All Listings" /><Btn id="offplan" l="Off-Plan" /><Btn id="communities" l="Communities" /><Btn id="golden" l="Golden Visa" />
        </div>
        <div>
          <div className="font-display font-bold text-[#C9A84C] mb-4">Services</div>
          <Btn id="valuation" l="Free Valuation" /><Btn id="golden" l="Golden Visa" /><Btn id="offplan" l="Off-Plan Investment" /><Btn id="about" l="About Agent" />
        </div>
        <div>
          <div className="font-display font-bold text-[#C9A84C] mb-4">Contact</div>
          <div className="text-sm text-white/60 space-y-2">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#C9A84C]" /> {cfg.address}</div>
            <a href={`tel:${cfg.phone}`} className="flex items-center gap-2 hover:text-white"><Phone className="w-4 h-4 text-[#C9A84C]" /> {cfg.phone}</a>
            <a href={`mailto:${cfg.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="w-4 h-4 text-[#C9A84C]" /> {cfg.email}</a>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircle className="w-4 h-4 text-[#C9A84C]" /> WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center text-xs text-white/50">
          <div>© {new Date().getFullYear()} {cfg.agencyName}. All rights reserved.</div>
          <div>Powered by AK Web Services</div>
        </div>
      </div>
    </footer>
  );
}

/* ==================== FLOATING ELEMENTS ==================== */
function FloatingActions({ cfg }: { cfg: typeof DEFAULT_CFG }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const on = () => setShow(window.scrollY > 500); on(); window.addEventListener("scroll", on); return () => window.removeEventListener("scroll", on); }, []);
  const wa = cfg.whatsapp.replace(/\D/g, "");
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
      {show && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-11 h-11 rounded-full bg-[#C9A84C] text-[#0A1628] shadow-lg hover:bg-[#D4B96A] flex items-center justify-center transition"><ArrowUp className="w-4 h-4" /></button>
      )}
      <a href={`https://wa.me/${wa}?text=${encodeURIComponent(cfg.whatsappGreeting)}`} target="_blank" rel="noreferrer"
        className="wa-pulse group relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white flex items-center justify-center shadow-2xl transition">
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-16 bg-[#0A1628] text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">Chat with us</span>
      </a>
    </div>
  );
}

/* ==================== APP ==================== */
function App() {
  const [cfg] = useState(DEFAULT_CFG);
  const [listings] = useState<Listing[]>(DEMO_LISTINGS);
  const [offplan] = useState<Offplan[]>(DEMO_OFFPLAN);
  const [communities] = useState<Community[]>(DEMO_COMMUNITIES);
  const [loading] = useState(false);
  const [section, setSection] = useState("home");
  const [modalListing, setModalListing] = useState<Listing | null>(null);

  const openModal = (l: Listing) => setModalListing(l);

  return (
    <div className="font-sans antialiased">
      <Navbar section={section} setSection={setSection} cfg={cfg} />
      {section === "home" && (
        <>
          <Hero cfg={cfg} setSection={setSection} />
          <FeaturedListings listings={listings} loading={loading} cfg={cfg} onOpen={openModal} setSection={setSection} />
          <FeaturedOffplan offplan={offplan} loading={loading} cfg={cfg} />
          <CommunitiesGrid communities={communities} loading={loading} />
          <AboutAgent cfg={cfg} />
          <ROICalculator />
        </>
      )}
      {section === "listings" && <ListingsPage listings={listings} loading={loading} cfg={cfg} onOpen={openModal} />}
      {section === "offplan" && <OffplanPage offplan={offplan} loading={loading} cfg={cfg} />}
      {section === "communities" && <div className="pt-24"><CommunitiesGrid communities={communities} loading={loading} full /></div>}
      {section === "about" && <div className="pt-24"><AboutAgent cfg={cfg} /></div>}
      {section === "contact" && <ContactPage cfg={cfg} />}
      {section === "valuation" && <ValuationPage cfg={cfg} />}
      {section === "golden" && <GoldenVisaPage listings={listings} cfg={cfg} onOpen={openModal} />}
      <Footer cfg={cfg} setSection={setSection} />
      <FloatingActions cfg={cfg} />
      <PropertyModal l={modalListing} cfg={cfg} onClose={() => setModalListing(null)} />
      <Toaster />
    </div>
  );
}
