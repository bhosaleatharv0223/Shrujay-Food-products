import { useState, useEffect, useRef } from "react";
import {
  Phone, MapPin, Instagram, Leaf, CheckCircle,
  Truck, Star, Shield, Heart, Package, Clock,
  ThumbsUp, Menu, X, ArrowRight, ChevronRight, ChevronLeft,
  Award, Users, ShoppingBag, Wheat, Send,
  ShoppingCart, Plus, Minus, Trash2,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/1000322130.jpg";
import { OrderModal } from '@/components/order/OrderModal';
import type { OrderItem } from '@/types/order';
import {
  calculateLineTotal,
  formatCurrency,
  MIN_QUANTITY_KG,
  normalizeQuantity,
  QUANTITY_STEP_KG,
} from '@/utils/pricing';

type Page = "home" | "products" | "product-detail" | "about" | "contact";
type Product = {
  id: number;
  name: string;
  marathi: string;
  desc: string;
  price: string;
  priceValue: number;
  category: string;
  img: string;
};
type CartItem = { product: Product; quantity: number };

const PHONE = "8080394411";
const PHONE_DISPLAY = "+91 8080394411";
const INSTAGRAM_HANDLE = "@shrujay_food_products";
const BUSINESS_MAP_URL = "https://www.google.com/maps?q=18.4956,73.9668";
const HERO_IMAGES = ["/1000322244.jpg", "/hero-bg-1.png", "/hero-bg-2.png", "/hero-bg-3.png"];

// ─── Logo image ────────────────────────────────────────────────────────────
function Logo({ size = 64 }: { size?: number }) {
  return (
    <ImageWithFallback
      src={logoImg}
      alt="Shrujay Food Products"
      style={{ width: size, height: size }}
      className="object-contain drop-shadow-sm"
    />
  );
}

// ─── Leaf Divider ──────────────────────────────────────────────────────────
function LeafDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(46,125,50,0.2))" }} />
      <svg width="30" height="18" viewBox="0 0 30 18" fill="none">
        <ellipse cx="15" cy="9" rx="14" ry="8" fill="#DB9C23" opacity="0.1" />
        <ellipse cx="15" cy="9" rx="9" ry="5" fill="#DB9C23" opacity="0.18" />
        <line x1="15" y1="1" x2="15" y2="17" stroke="#DB9C23" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
        <line x1="9" y1="7" x2="15" y2="9" stroke="#DB9C23" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
        <line x1="9" y1="11" x2="15" y2="9" stroke="#DB9C23" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
        <line x1="21" y1="7" x2="15" y2="9" stroke="#DB9C23" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
        <line x1="21" y1="11" x2="15" y2="9" stroke="#DB9C23" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
      </svg>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(46,125,50,0.2))" }} />
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────
function Nav({ page, setPage, cartCount, openCart }: { page: Page; setPage: (p: Page) => void; cartCount: number; openCart: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (p: Page) => { setPage(p); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const links: { label: string; p: Page }[] = [
    { label: "Home", p: "home" },
    { label: "Products", p: "products" },
    { label: "About Us", p: "about" },
    { label: "Contact Us", p: "contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg" : "bg-white/97 backdrop-blur-sm border-b border-[#DB9C23]/10"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Desktop: 3-column grid with logo centred ── */}
        <div className="hidden lg:flex items-center h-[80px]">

          {/* Left — nav links */}
          <button onClick={() => go("home")} className="group mr-8 flex-shrink-0" aria-label="Go to home page">
            <Logo size={76} />
          </button>

          <div className="flex items-center gap-6">
            {links.map(l => (
              <button
                key={l.p}
                onClick={() => go(l.p)}
                className={`text-[13.5px] font-bold tracking-wide transition-colors relative pb-0.5 ${page === l.p ? "text-[#DB9C23]" : "text-[#4a4a4a] hover:text-[#DB9C23]"}`}
              >
                {l.label}
                {page === l.p && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-[#DB9C23]" />
                )}
              </button>
            ))}
          </div>

          {/* Right — location + CTA */}
          <div className="ml-auto flex items-center justify-end gap-4">
            <a
              href={BUSINESS_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-[#6D4C41] font-semibold hover:text-[#DB9C23] transition-colors"
              aria-label="Open Shrujay Food Products location in Google Maps"
            >
              <MapPin size={13} className="text-[#DB9C23]" />
              Our Location
            </a>
            <button
              onClick={() => go("products")}
              className="px-5 py-2.5 bg-[#DB9C23] text-white text-[13px] font-bold rounded-full hover:bg-[#D4A017] transition-all duration-200 shadow-sm"
            >
              Order Now
            </button>
            <button
              onClick={openCart}
              className="relative w-10 h-10 rounded-full border border-[#DB9C23]/25 text-[#DB9C23] flex items-center justify-center hover:bg-[#DB9C23] hover:text-white transition-colors"
              aria-label={`Open cart with ${cartCount} items`}
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#174C2C] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile header ── */}
        <div className="lg:hidden flex items-center justify-between h-[64px]">
          <button onClick={() => go("home")} className="flex items-center gap-2">
            <Logo size={52} />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={openCart} className="relative p-2 text-[#DB9C23]" aria-label={`Open cart with ${cartCount} items`}>
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-[#174C2C] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setOpen(!open)} className="p-2 text-[#DB9C23]">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden max-h-[calc(100vh-64px)] overflow-y-auto bg-white border-t border-[#DB9C23]/10 py-4">
            {links.map(l => (
              <button
                key={l.p}
                onClick={() => go(l.p)}
                className={`block w-full text-left px-5 py-3 text-[14px] font-semibold rounded-xl transition-colors ${page === l.p ? "bg-[#DB9C23]/10 text-[#DB9C23]" : "text-[#6D4C41] hover:text-[#DB9C23]"}`}
              >
                {l.label}
              </button>
            ))}
            <div className="px-5 pt-3 flex items-center gap-4 flex-wrap border-t border-[#DB9C23]/10 mt-2">
              <a
                href={BUSINESS_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-[#6D4C41]"
                aria-label="Open Shrujay Food Products location in Google Maps"
              >
                <MapPin size={13} className="text-[#DB9C23]" /> Our Location
              </a>
              <button onClick={() => go("products")} className="px-5 py-2 bg-[#DB9C23] text-white text-[13px] font-bold rounded-full">
                Order Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  const go = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const navLinks: { label: string; p: Page }[] = [
    { label: "Home", p: "home" },
    { label: "Products", p: "products" },
    { label: "About Us", p: "about" },
    { label: "Contact Us", p: "contact" },
  ];
  return (
    <footer className="bg-[#174C2C] text-white border-t-4 border-[#DB9C23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white rounded-xl p-1 shadow-md">
                <Logo size={64} />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-white tracking-[0.08em] text-[17px]">SHRUJAY</div>
                <div className="text-[#F6C453] text-[11px] tracking-[0.14em] font-bold mt-0.5">FOOD PRODUCTS</div>
              </div>
            </div>
            <p className="text-white/75 text-[13px] leading-relaxed mb-5">
              Home-based manufacturer of pure, natural, traditional Indian food products in Pune, Maharashtra.
            </p>
            <a href={`https://instagram.com/${INSTAGRAM_HANDLE.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#F6C453] text-[13px] font-semibold hover:text-white transition-colors">
              <Instagram size={14} /> {INSTAGRAM_HANDLE}
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-[#F6C453] text-[11px] tracking-[0.18em] uppercase mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {navLinks.map(l => (
                <li key={l.p}>
                  <button onClick={() => go(l.p)} className="text-white/80 text-[13px] hover:text-[#F6C453] transition-colors flex items-center gap-1.5">
                    <ChevronRight size={12} /> {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h4 className="font-bold text-[#F6C453] text-[11px] tracking-[0.18em] uppercase">All {ALL_PRODUCTS.length} Products</h4>
              <span className="text-[10px] font-bold text-white/55 border border-white/15 rounded-full px-2.5 py-1">Complete Range</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {ALL_PRODUCTS.map(product => (
                <li key={product.id}>
                  <button onClick={() => go("products")} className="text-white/80 text-[13px] hover:text-[#F6C453] transition-colors flex items-start text-left gap-1.5">
                    <ChevronRight size={12} /> {product.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#F6C453] text-[11px] tracking-[0.18em] uppercase mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-[#F6C453] mt-0.5 flex-shrink-0" />
                <div>
                  <a href={`tel:${PHONE}`} className="text-white font-bold text-[13px] hover:underline">{PHONE_DISPLAY}</a>
                  <div className="text-white/55 text-[11px]">Call / WhatsApp</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#F6C453] mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-[13px]">Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck size={14} className="text-[#F6C453] mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-[13px]">Fastest home delivery available<br />Min. order 0.5 kg</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/55 text-[11px]">© 2026 Shrujay Food Products · Pune, Maharashtra, India · All rights reserved.</p>
          <p className="text-[#F6C453] text-[11px] font-semibold italic">Pure · Natural · Healthy</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Products data ─────────────────────────────────────────────────────────
const ALL_PRODUCTS: Product[] = [
  { id: 1,  name: "Toor Dal", marathi: "तूर डाळ", desc: "Premium unpolished toor dal, naturally sourced. Rich in protein and ideal for everyday cooking.", price: "₹170/kg", priceValue: 170, category: "Dal & Pulses", img: "https://images.unsplash.com/photo-1701166175567-2f55dd40e662?w=480&h=360&fit=crop&auto=format" },
  { id: 2,  name: "Gavaran Moong Dal", marathi: "गावरान मूग डाळ", desc: "घरगुती पद्धतीने भरडलेली मूग डाळ — gharaguti padhatine bharadleli moong dal.", price: "₹160/kg", priceValue: 160, category: "Dal & Pulses", img: "/1000322276.jpg" },
  { id: 3,  name: "Gavaran Chana Dal", marathi: "गावरान चणा डाळ", desc: "घरगुती पद्धतीने भरडलेली चणा डाळ — gharaguti padhatine bharadleli chana dal.", price: "₹120/kg", priceValue: 120, category: "Dal & Pulses", img: "/1000322275.jpg" },
  { id: 4,  name: "Urad Dal", marathi: "उडीद डाळ", desc: "Whole and split black gram — essential for idli, dosa batter and traditional dal recipes.", price: "₹160/kg", priceValue: 160, category: "Dal & Pulses", img: "/1000322277.jpg" },
  { id: 5,  name: "Gavaran Matki", marathi: "गावरान मटकी", desc: "Authentic moth beans from local farms — high in protein and perfect for sprouted usal.", price: "₹180/kg", priceValue: 180, category: "Pulses", img: "/1000322280.jpg" },
  { id: 6,  name: "Gawaran Moog", marathi: "गावरान मूग", desc: "Naturally grown whole moong — sproutable, nutritious and ideal for salads, misal and usal.", price: "₹150/kg", priceValue: 150, category: "Pulses", img: "/1000322283.jpg" },
  { id: 7,  name: "Gawaran Hulga", marathi: "गावरान हुळगा", desc: "Traditional horse gram from local farms — packed with iron, fibre and earthy flavour.", price: "₹150/kg", priceValue: 150, category: "Pulses", img: "/1000322282.jpg" },
  { id: 8,  name: "Gavaran Chavali", marathi: "गावरान चवळी", desc: "Local black-eyed peas — naturally grown, nutritious and widely used in Maharashtrian cuisine.", price: "₹150/kg", priceValue: 150, category: "Pulses", img: "/1000322281.jpg" },
  { id: 9, name: "Jaggery Coconut Ladoo", marathi: "खोबऱ्याचे लाडू", desc: "Homemade ladoos with jaggery and fresh coconut — traditional Maharashtrian recipe.", price: "₹1000/kg", priceValue: 1000, category: "Festive Foods", img: "/1000322271.jpg" },
  { id: 10, name: "Groundnut Ladoos", marathi: "शेंगदाण्याचे लाडू", desc: "Sweet and crunchy peanut ladoos made the traditional Maharashtrian way.", price: "₹450/kg", priceValue: 450, category: "Festive Foods", img: "/1000322269.jpg" },
  { id: 11, name: "Whole Wheat Flour (Gahu)", marathi: "गव्हाचे पीठ", desc: "Stone-ground whole wheat chakki atta with full bran and germ for wholesome daily rotis.", price: "₹60/kg", priceValue: 60, category: "Flours", img: "/whole-wheat-flour-gahu.jpeg" },
  { id: 12, name: "Jowar Flour", marathi: "ज्वारीचे पीठ", desc: "Premium stone-ground jowar flour — gluten-free, healthy and freshly milled.", price: "₹80/kg", priceValue: 80, category: "Flours", img: "/1000322267.jpg" },
  { id: 13, name: "Bajari Flour", marathi: "बाजरीचे पीठ", desc: "Traditional stone-ground bajari flour, rich in iron and fibre and milled fresh.", price: "₹80/kg", priceValue: 80, category: "Flours", img: "/1000322268.jpg" },
  { id: 14, name: "Masvadi", marathi: "मासवडी", desc: "उकडलेली वडी — रस्सा सोबत मिळणार नाही; फक्त उकडलेली मासवडी आहे.", price: "₹600/kg", priceValue: 600, category: "Festive Foods", img: "/1000322274.jpg" },
  { id: 15, name: "Coconut Ladoo with Sugar", marathi: "साखरेचे खोबऱ्याचे लाडू", desc: "Homemade coconut ladoos prepared with sugar and fresh coconut.", price: "₹1000/kg", priceValue: 1000, category: "Festive Foods", img: "/1000322270.jpg" },
  { id: 16, name: "Khobryachi Barfi", marathi: "खोबऱ्याची बर्फी", desc: "Traditional homemade coconut barfi with a rich, fresh coconut flavour.", price: "₹600/kg", priceValue: 600, category: "Festive Foods", img: "/1000322395.jpg" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Dal & Pulses": "bg-amber-50 text-amber-800",
  "Pulses":       "bg-[#FFF8EC] text-[#DB9C23]700",
  "Grains":       "bg-orange-50 text-orange-700",
  "Festive Foods":"bg-yellow-50 text-yellow-800",
  "Flours":       "bg-stone-50 text-stone-700",
};

// ─── Product Card ──────────────────────────────────────────────────────────
function ProductCard({ product, setPage, addToCart }: { product: Product; setPage: (p: Page) => void; addToCart: (product: Product) => void }) {
  const go = () => { setPage("product-detail"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div className="bg-white rounded-[14px] overflow-hidden border border-[#DB9C23]/10 shadow-sm hover:shadow-[0_8px_32px_rgba(46,125,50,0.14)] transition-all duration-300 group flex flex-col">
      <div className="relative overflow-hidden bg-[#F5EDD8] h-44 sm:h-48">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3">
          <span className="bg-[#DB9C23] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">{product.price}</span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${CATEGORY_COLORS[product.category] ?? "bg-white/80 text-gray-700"}`}>
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[#DB9C23] text-[15px] leading-snug">{product.name}</h3>
        <p className="text-[#D4A017] text-[12px] font-semibold mb-1">{product.marathi}</p>
        <p className="text-[#6D4C41] text-[13px] leading-relaxed flex-1 line-clamp-2">{product.desc}</p>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 mt-3">
          <button onClick={go} className="py-2 border-2 border-[#DB9C23] text-[#DB9C23] text-[12px] font-bold rounded-xl hover:bg-[#FFF8EC] transition-all duration-200">
            View Details
          </button>
          <button onClick={() => addToCart(product)} className="py-2 bg-[#DB9C23] text-white text-[12px] font-bold rounded-xl hover:bg-[#174C2C] transition-all duration-200 flex items-center justify-center gap-1.5">
            <ShoppingCart size={13} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section label pill ────────────────────────────────────────────────────
function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-[#DB9C23]/10 text-[#DB9C23] text-[11px] font-bold px-4 py-1.5 rounded-full border border-[#DB9C23]/20 tracking-widest uppercase mb-4">
      <Leaf size={11} /> {children}
    </div>
  );
}

// ─── Floating cycling product card ────────────────────────────────────────
function FloatingProductCard({ position, offset }: { position: "left" | "right"; offset: number }) {
  const [idx, setIdx] = useState(offset % ALL_PRODUCTS.length);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(prev => (prev + 1) % ALL_PRODUCTS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const p = ALL_PRODUCTS[idx];

  const posClass = position === "left"
    ? "absolute left-4 bottom-16 z-20"
    : "absolute right-2 top-14 z-20";

  return (
    <div
      className={`${posClass} bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-[#DB9C23]/10`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.96)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        minWidth: 150,
      }}
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5EDD8] flex-shrink-0">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
      </div>
      <div>
        <div className="font-bold text-[#DB9C23] text-[12px] leading-snug">{p.name}</div>
        <div className="text-[#6D4C41] text-[10px]">{p.marathi}</div>
        <div className="text-[#D4A017] text-[11px] font-bold mt-0.5">{p.price}</div>
      </div>
    </div>
  );
}


// ─── QUICK SHOP SECTION ──────────────────────────────────────────────────
function QuickShop({ setPage, addToCart, isInsideHero = false }: { setPage: (p: Page) => void; addToCart: (product: Product) => void; isInsideHero?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress(scrollLeft / maxScroll);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      }
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    const scrollAmount = direction === "left" ? -clientWidth * 0.7 : clientWidth * 0.7;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const totalDots = 5;
  const activeDotIndex = Math.min(
    Math.round(scrollProgress * (totalDots - 1)),
    totalDots - 1
  );

  const handleDotClick = (index: number) => {
    if (!containerRef.current) return;
    const { scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const targetScroll = (index / (totalDots - 1)) * maxScroll;
    containerRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isInsideHero) {
    return (
      <div className="relative w-full z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2
              className="text-2xl md:text-3xl font-black tracking-wider uppercase mb-1 text-white"
              style={{ textShadow: "0 1px 2px rgba(255,255,255,0.4)" }}
            >
              QUICK SHOP
            </h2>
            <p className="text-[#6D4C41] text-[12px] font-bold tracking-wide">
              आमची सर्व उत्पादने एका क्लिकवर
            </p>
          </div>

        {/* Carousel Wrapper */}
        <div className="relative px-1 md:px-6">
          {/* Scroll Container */}
          <div
            ref={containerRef}
            className="flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-2 px-0.5"
          >
            {ALL_PRODUCTS.map(product => (
              <div
                key={product.id}
                className="relative pt-1 pb-4 flex-shrink-0 snap-start select-none w-[100px] sm:w-[115px] md:w-[125px] group"
              >
                {/* Background Golden Shape */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-[#D4A017] rounded-b-[14px] rounded-t-[2px] opacity-90 shadow-sm -z-10 transition-all duration-300 group-hover:translate-y-1 group-hover:scale-95 pointer-events-none" />

                {/* Main Card */}
                <div
                  onClick={() => go("product-detail")}
                  className="bg-white/95 backdrop-blur-sm rounded-[12px] overflow-hidden border border-[#DB9C23]/30 shadow-md hover:shadow-[0_8px_24px_rgba(219,156,35,0.30)] hover:border-[#D4A017] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#FFF8EC]">
                    <img
                      src={product.img}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Price tag badge — amber to match hero */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className="bg-[#DB9C23] text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        {product.price}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-2 flex flex-col justify-between flex-grow text-center">
                    <div>
                      <h3 className="font-extrabold text-[#DB9C23] text-[10.5px] sm:text-[11.5px] leading-tight line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[#6D4C41] text-[9px] sm:text-[10px] font-semibold mt-0.5">
                        {product.marathi}
                      </p>
                    </div>
                    <button
                      onClick={(event) => { event.stopPropagation(); addToCart(product); }}
                      className="mt-1.5 py-1 rounded-lg bg-[#DB9C23] text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center gap-1 hover:bg-[#174C2C] transition-colors"
                    >
                      <Plus size={9} /> Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 md:-left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 bg-white/90 rounded-full border border-[#DB9C23] flex items-center justify-center text-[#DB9C23] hover:bg-[#DB9C23] hover:border-[#D4A017] hover:text-white shadow-md transition-all duration-200 focus:outline-none"
            aria-label="Previous Products"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 md:-right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 bg-white/90 rounded-full border border-[#DB9C23] flex items-center justify-center text-[#DB9C23] hover:bg-[#DB9C23] hover:border-[#D4A017] hover:text-white shadow-md transition-all duration-200 focus:outline-none"
            aria-label="Next Products"
          >
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Scroll Dot Indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: totalDots }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                index === activeDotIndex
                  ? "bg-white w-4"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide page ${index + 1}`}
            />
          ))}
        </div>{/* end dot indicators */}
        </div>{/* end max-w-7xl */}
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#FFF9F0] border-y border-[#DB9C23]/10 relative overflow-hidden">
      {/* Decorative leaf motifs */}
      <div className="absolute top-6 left-6 opacity-[0.04] text-[#2E7D32] pointer-events-none hidden md:block">
        <Leaf size={100} />
      </div>
      <div className="absolute bottom-6 right-6 opacity-[0.04] text-[#2E7D32] pointer-events-none hidden md:block transform rotate-180">
        <Leaf size={100} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#2E7D32]/10 text-[#2E7D32] text-[11px] font-bold px-4 py-1.5 rounded-full border border-[#2E7D32]/20 tracking-widest uppercase mb-3">
            <Leaf size={11} /> Quick Category Shop
          </div>
          <h2 className="text-3xl font-black text-[#2E7D32] tracking-wider uppercase mb-1">
            QUICK SHOP
          </h2>
          <p className="text-[#6D4C41] text-[14px] font-medium tracking-wide">
            आमची सर्व उत्पादने एका क्लिकवर
          </p>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative px-2 md:px-8">
          {/* Scroll Container */}
          <div 
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-4 px-1"
          >
            {ALL_PRODUCTS.map(product => (
              <div 
                key={product.id} 
                className="relative pt-2 pb-6 flex-shrink-0 snap-start select-none w-[calc((100%-16px)/2)] sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-72px)/6)] xl:w-[calc((100%-96px)/7)] group"
              >
                {/* Background Golden Highlight Category Shape */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-12 bg-[#D4A017] rounded-b-[20px] rounded-t-[4px] opacity-90 shadow-sm -z-10 transition-all duration-300 group-hover:translate-y-1.5 group-hover:scale-95 pointer-events-none" />

                {/* Main Card */}
                <div
                  onClick={() => go("product-detail")}
                  className="bg-white rounded-[16px] overflow-hidden border border-[#DB9C23]/12 shadow-sm hover:shadow-[0_12px_32px_rgba(46,125,50,0.16)] hover:border-[#D4A017] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#FFF8EC]">
                    <img
                      src={product.img}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Price tag badge */}
                    <div className="absolute top-2 right-2">
                      <span className="bg-[#2E7D32] text-white text-[10px] md:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        {product.price}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 flex flex-col justify-between flex-grow text-center">
                    <div>
                      <h3 className="font-extrabold text-[#2E7D32] text-[13px] md:text-[14px] leading-tight line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[#6D4C41] text-[11px] font-semibold mt-0.5">
                        {product.marathi}
                      </p>
                    </div>
                    <button
                      onClick={(event) => { event.stopPropagation(); addToCart(product); }}
                      className="mt-2 py-1.5 rounded-lg bg-[#2E7D32] text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-[#DB9C23] transition-colors"
                    >
                      <Plus size={11} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button 
            onClick={() => scroll("left")}
            className="absolute -left-1 md:left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-white rounded-full border-2 border-[#2E7D32] flex items-center justify-center text-[#2E7D32] hover:bg-[#D4A017] hover:border-[#D4A017] hover:text-white shadow-lg transition-all duration-200 focus:outline-none"
            aria-label="Previous Products"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scroll("right")}
            className="absolute -right-1 md:right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-white rounded-full border-2 border-[#2E7D32] flex items-center justify-center text-[#2E7D32] hover:bg-[#D4A017] hover:border-[#D4A017] hover:text-white shadow-lg transition-all duration-200 focus:outline-none"
            aria-label="Next Products"
          >
            <ChevronRight size={20} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Scroll Dot Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalDots }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${index === activeDotIndex ? "bg-[#2E7D32] w-6" : "bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Go to slide page ${index + 1}`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button 
            onClick={() => go("products")}
            className="px-10 py-3.5 bg-[#2E7D32] text-white font-bold rounded-full hover:bg-[#D4A017] transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-green-950/20 text-[14.5px] tracking-wide"
          >
            View All Products <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── HOME PAGE ─────────────────────────────────────────────────────────────
function HomePage({ setPage, addToCart }: { setPage: (p: Page) => void; addToCart: (product: Product) => void }) {
  const go = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const activeHeroImage = HERO_IMAGES[heroImageIndex];

  const mission = [
    { icon: <Leaf size={20} />,         title: "100% Natural",       desc: "No artificial additives or preservatives — pure, as nature intended." },
    { icon: <Shield size={20} />,        title: "Strict Hygiene",     desc: "Processed in a clean, hygienic home kitchen with utmost care." },
    { icon: <Heart size={20} />,         title: "Affordable Pricing", desc: "Fair prices without compromising quality — value for every rupee." },
    { icon: <Star size={20} />,          title: "Customer Trust",     desc: "Built on word-of-mouth and repeat customers across Pune." },
    { icon: <CheckCircle size={20} />,   title: "Healthy Living",     desc: "Unpolished dals & grains that preserve natural nutrients fully." },
  ];

  const why = [
    { icon: <CheckCircle size={18} />, label: "Quality Checked" },
    { icon: <Leaf size={18} />,        label: "100% Fresh" },
    { icon: <Package size={18} />,     label: "Hygienically Packed" },
    { icon: <Award size={18} />,       label: "Premium Quality" },
    { icon: <Heart size={18} />,       label: "Affordable" },
    { icon: <Users size={18} />,       label: "Trusted Supplier" },
    { icon: <ShoppingBag size={18} />, label: "Bulk Orders" },
    { icon: <Truck size={18} />,       label: "Fastest Delivery" },
    { icon: <ThumbsUp size={18} />,    label: "100% Satisfaction" },
  ];

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-cinematic {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          will-change: transform;
        }
        .hero-cinematic::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(18,14,10,0.74) 0%, rgba(18,14,10,0.44) 42%, rgba(18,14,10,0.72) 100%),
            linear-gradient(180deg, rgba(255,214,135,0.18) 0%, rgba(255,214,135,0.04) 30%, rgba(18,14,10,0.12) 100%),
            radial-gradient(circle at 70% 20%, rgba(219,156,35,0.16) 0%, transparent 26%);
          opacity: 0.96;
          z-index: 0;
          pointer-events: none;
        }
        .hero-cinematic::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.18) 56%, rgba(0,0,0,0.46) 100%);
          z-index: 0;
          pointer-events: none;
        }
        .hero-content {
          animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-subtitle {
          animation: fadeUp 1.05s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-cta {
          animation: fadeUp 1.2s cubic-bezier(.22,1,.36,1) both;
        }
        @media (max-width: 768px) {
          .hero-cinematic { background-position: center 20%; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="hero-cinematic relative flex min-h-[100svh] flex-col overflow-hidden bg-[#140f0b] pt-[64px] lg:pt-[80px]" style={{ backgroundImage: `url('${activeHeroImage}')` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 35%, rgba(255,234,186,0.16) 0%, transparent 60%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 py-8 sm:py-10 md:py-14">
          <div className="flex flex-col items-start pb-2">
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#F8E7B6] text-[11px] font-bold px-4 py-1.5 rounded-full border border-white/20 tracking-widest uppercase mb-5 self-start backdrop-blur-sm shadow-[0_3px_15px_rgba(0,0,0,0.25)]">
              <Leaf size={10} /> Shrujay Food Products
            </div>

            <h1 className="text-[2.15rem] sm:text-4xl md:text-5xl lg:text-[58px] font-extrabold leading-[1.08] mb-3 max-w-4xl" style={{ color: "#FFFFFF", textShadow: "0 3px 15px rgba(0,0,0,.45)" }}>
              Pure. Natural. Traditional. Premium.
            </h1>
            <p className="text-sm md:text-base lg:text-[17px] font-semibold text-white/90 max-w-2xl mb-7" style={{ textShadow: "0 3px 15px rgba(0,0,0,.35)" }}>
              Buy Pure, Natural &amp; Chemical-Free Food Products Online
            </p>
            <p className="text-sm md:text-[15px] lg:text-[16px] font-medium text-[#F8E7B6] max-w-2xl mb-7" style={{ textShadow: "0 3px 15px rgba(0,0,0,.35)" }}>
              Premium home-made dals, pulses, flours and traditional Indian foods from Pune, made with love, hygiene and generations of trusted family recipes.
            </p>

            <div className="hero-cta grid w-full grid-cols-1 gap-3 mb-8 min-[420px]:flex min-[420px]:w-auto min-[420px]:flex-wrap">
              <button onClick={() => go("products")}
                className="px-7 py-3 bg-[#DB9C23] text-white font-bold rounded-full hover:bg-[#C17F1A] transition-all duration-200 shadow-[0_10px_28px_rgba(0,0,0,0.22)] flex items-center justify-center gap-2 text-[14px]">
                View Products <ArrowRight size={14} />
              </button>
              <button onClick={() => go("contact")}
                className="px-7 py-3 bg-white/12 border border-white/35 text-white font-bold rounded-full hover:bg-white hover:text-[#DB9C23] transition-all duration-200 text-[14px] backdrop-blur-sm shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                Contact Us
              </button>
            </div>

            {/* Stat badges row */}
            <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:w-auto">
              <div className="inline-flex items-center gap-2.5 bg-white/92 rounded-xl px-4 py-2.5 shadow-sm border border-[#DB9C23]/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#DB9C23]/10 flex items-center justify-center">
                  <Wheat size={16} className="text-[#DB9C23]" />
                </div>
                <div>
                  <div className="font-extrabold text-[#DB9C23] text-[18px] leading-none">8+</div>
                  <div className="text-[#6D4C41] text-[10px] font-semibold mt-0.5">Pure Varieties</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2.5 bg-white/92 rounded-xl px-4 py-2.5 shadow-sm border border-[#D4A017]/20 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#D4A017]/10 flex items-center justify-center">
                  <Star size={16} className="text-[#D4A017] fill-[#D4A017]" />
                </div>
                <div>
                  <div className="font-extrabold text-[#DB9C23] text-[18px] leading-none">100%</div>
                  <div className="text-[#6D4C41] text-[10px] font-semibold mt-0.5">Natural &amp; Pure</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2.5 bg-white/92 rounded-xl px-4 py-2.5 shadow-sm border border-[#DB9C23]/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#DB9C23]/10 flex items-center justify-center">
                  <Truck size={16} className="text-[#DB9C23]" />
                </div>
                <div>
                  <div className="font-extrabold text-[#DB9C23] text-[15px] leading-none">Fastest</div>
                  <div className="text-[#6D4C41] text-[10px] font-semibold mt-0.5">Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>{/* end max-w-7xl */}

        {/* ── Quick Shop row — full-width, same hero background ── */}
        <div className="relative w-full border-t border-white/20 pt-1 pb-6 px-0 z-10">
          <QuickShop setPage={setPage} addToCart={addToCart} isInsideHero={true} />
        </div>

        {/* bottom white wave */}
        <div className="w-full overflow-hidden leading-none relative z-10">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0,16 Q360,0 720,16 Q1080,32 1440,16 L1440,32 L0,32 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>


      {/* ── Mission ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <LeafDivider className="mb-6 max-w-xs mx-auto" />
            <SectionPill>Our Mission</SectionPill>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#DB9C23] mb-3">What We Stand For</h2>
            <p className="text-[#6D4C41] max-w-lg mx-auto text-[15px] leading-relaxed">
              Every family deserves food that is as pure as nature made it — from farm to your kitchen table.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {mission.map((m, i) => (
              <div key={i} className="text-center p-6 bg-[#FFF8EC] rounded-[14px] border border-[#DB9C23]/10 hover:border-[#D4A017]/40 hover:shadow-[0_4px_24px_rgba(46,125,50,0.1)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-[#DB9C23]/10 flex items-center justify-center mx-auto mb-4 text-[#DB9C23] group-hover:bg-[#DB9C23] group-hover:text-white transition-all duration-200">
                  {m.icon}
                </div>
                <h3 className="font-bold text-[#DB9C23] text-[13px] mb-2 leading-snug">{m.title}</h3>
                <p className="text-[#6D4C41] text-[12px] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-14 bg-[#DB9C23] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 border border-[#D4A017]/40 text-[#D4A017] text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-4">
              <Leaf size={11} /> Why Shrujay?
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Why Choose Us</h2>
            <p className="text-white/70 max-w-md mx-auto text-[15px]">
              Everything we do is for one reason — to earn your trust, one meal at a time.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {why.map((f, i) => (
              <div key={i} className="bg-white/[0.10] border border-white/15 rounded-[14px] py-7 px-6 flex flex-col items-center text-center hover:bg-white/[0.18] hover:border-white/30 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 text-white group-hover:bg-white group-hover:text-[#DB9C23] transition-all duration-200">
                  {f.icon}
                </div>
                <span className="text-white font-bold text-[17px] leading-snug">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-14 sm:py-20 bg-[#FFF8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <LeafDivider className="mb-6 max-w-xs mx-auto" />
            <SectionPill>Featured Products</SectionPill>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#DB9C23] mb-3">Our Best Sellers</h2>
            <p className="text-[#6D4C41] max-w-lg mx-auto text-[15px] leading-relaxed">
              Unpolished, naturally sourced dals and pulses — packed fresh and delivered to your home.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_PRODUCTS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} />)}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => go("products")}
              className="px-10 py-3.5 bg-[#DB9C23] text-white font-bold rounded-full hover:bg-[#D4A017] transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-green-900/15">
              View All Products <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <LeafDivider className="mb-6 max-w-xs mx-auto" />
            <SectionPill>Find Us</SectionPill>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#DB9C23] mb-3">Serving Pune &amp; Beyond</h2>
            <p className="text-[#6D4C41] text-[15px]">Fresh home-made products, delivered right to your doorstep.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-3 rounded-[14px] overflow-hidden shadow-md" style={{ minHeight: 320 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.0!2d73.9641990!3d18.4956049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eac93e1f9d47%3A0x0!2zMTjCsDI5JzQ0LjIiTiA3M8KwNTgnMDAuNCJF!5e0!3m2!1sen!2sin!4v1700000000001!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0, display: "block", minHeight: 320 }}
                allowFullScreen loading="lazy" title="Shrujay Food Products Location, Pune"
              />
            </div>
            <div className="lg:col-span-2 bg-[#FFF8EC] rounded-[14px] p-5 sm:p-8 border border-[#DB9C23]/10 flex flex-col justify-center gap-5">
              <div>
                <h3 className="font-extrabold text-[#DB9C23] text-xl mb-1">Shrujay Food Products</h3>
                <p className="text-[#6D4C41] text-[13px]">Pune, Maharashtra, India</p>
              </div>
              {[
                { icon: <Phone size={16} />, label: "Phone / WhatsApp", value: <a href={`tel:${PHONE}`} className="text-[#DB9C23] font-bold text-[14px] hover:underline">{PHONE_DISPLAY}</a> },
                { icon: <Truck size={16} />, label: "Delivery", value: <span className="text-[#6D4C41] text-[13px]">Fastest home delivery · Min. 0.5 kg · Porter/Courier ₹30/kg</span> },
                { icon: <Clock size={16} />, label: "Order By", value: <span className="text-[#6D4C41] text-[13px]">Place order anytime via WhatsApp or call</span> },
                { icon: <Instagram size={16} />, label: "Instagram", value: <span className="text-[#6D4C41] text-[13px]">{INSTAGRAM_HANDLE}</span> },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#DB9C23]/10 flex items-center justify-center text-[#DB9C23] flex-shrink-0">{r.icon}</div>
                  <div>
                    <div className="font-semibold text-[#DB9C23] text-[12px] mb-0.5">{r.label}</div>
                    {r.value}
                  </div>
                </div>
              ))}
              <button onClick={() => go("contact")} className="mt-2 px-6 py-3 bg-[#DB9C23] text-white font-bold rounded-full hover:bg-[#D4A017] transition-all duration-200 self-start text-[14px]">
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── PRODUCTS PAGE ─────────────────────────────────────────────────────────
function ProductsPage({ setPage, addToCart }: { setPage: (p: Page) => void; addToCart: (product: Product) => void }) {
  const categories = ["All", "Dal & Pulses", "Pulses", "Grains", "Festive Foods", "Flours"];
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category === active);

  return (
    <div className="pt-[64px] lg:pt-[80px] min-h-screen bg-[#FFF8EC]">
      {/* Header */}
      <div className="bg-[#DB9C23] py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-7xl mx-auto text-center relative">
          <SectionPill>Our Products</SectionPill>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Pure &amp; Natural Products</h1>
          <p className="text-[#DB9C23]200 max-w-xl mx-auto text-[15px] leading-relaxed">
            Homemade, unpolished dals, traditional pulses, aromatic rice, festive foods and natural jaggery — all from Pune.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-[#DB9C23]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-200 ${active === c ? "bg-[#DB9C23] text-white" : "bg-[#FFF8EC] text-[#6D4C41] border border-[#DB9C23]/20 hover:border-[#DB9C23]/50"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <p className="text-[#6D4C41] text-[13px] mb-6 font-medium">{filtered.length} product{filtered.length !== 1 ? "s" : ""} shown</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} />)}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#FFF3E0] border-t border-[#D4A017]/20 py-10 px-4 text-center">
        <h3 className="font-extrabold text-[#DB9C23] text-2xl mb-2">Need a Bulk Order?</h3>
        <p className="text-[#6D4C41] text-[15px] mb-5">We supply in bulk for families, restaurants and retailers. Contact us for custom pricing.</p>
        <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#DB9C23] text-white font-bold rounded-full hover:bg-[#D4A017] transition-all duration-200">
          <Phone size={15} /> Call {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL PAGE ───────────────────────────────────────────────────
function ProductDetailPage({ setPage, addToCart }: { setPage: (p: Page) => void; addToCart: (product: Product) => void }) {
  return (
    <div className="pt-[64px] lg:pt-[80px] min-h-screen bg-[#FFF8EC]">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-[#DB9C23]">
        <img
          src="https://images.unsplash.com/photo-1705475388190-775066fd69a5?w=1200&h=600&fit=crop&auto=format"
          alt="Fresh Indian dals and pulses collection"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <SectionPill>Dal &amp; Pulses</SectionPill>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">Homemade Dals &amp; Pulses</h1>
          <p className="text-[#DB9C23]100 max-w-2xl text-[15px] leading-relaxed">
            Unpolished, naturally sourced dals — no chemicals, no polishing, no third-party sourcing. Straight from local farms to your kitchen.
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
        <LeafDivider className="mb-8 max-w-xs mx-auto" />
        <p className="text-[#6D4C41] text-[16px] leading-relaxed">
          At Shrujay Food Products, we believe the best dals come from the best farms. All our dals are <strong className="text-[#DB9C23]">unpolished</strong>, retaining their natural fibre, protein and minerals. We source directly from Pune-region farmers — no middle men, no compromise.
        </p>
        <div className="mt-8 grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4">
          {[["Unpolished", "Full nutrition retained"], ["Farm-Direct", "No middlemen"], ["Home-Packed", "Hygienic & fresh"]].map(([h, s]) => (
            <div key={h} className="bg-white rounded-[14px] p-4 border border-[#DB9C23]/10 shadow-sm">
              <div className="font-bold text-[#DB9C23] text-[14px]">{h}</div>
              <div className="text-[#6D4C41] text-[12px] mt-0.5">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing table */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white rounded-[14px] border border-[#DB9C23]/12 shadow-md overflow-hidden">
          <div className="bg-[#DB9C23] px-6 py-5 flex items-center gap-3">
            <Wheat className="text-[#D4A017]" size={22} />
            <div>
              <h2 className="text-white font-extrabold text-xl">Current Pricing</h2>
              <p className="text-[#DB9C23]200 text-[12px]">All prices are per kilogram · Minimum order 0.5 kg</p>
            </div>
          </div>
          <div className="divide-y divide-[#DB9C23]/8">
            {ALL_PRODUCTS.map((item, i) => (
              <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-[#FFF8EC] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#FFF8EC]/60"}`}>
                <div>
                  <span className="font-bold text-[#DB9C23] text-[15px]">{item.name}</span>
                  <span className="block sm:ml-3 sm:inline text-[#D4A017] text-[12px] font-semibold">{item.marathi}</span>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-extrabold text-[#DB9C23] text-lg">{item.price}</span>
                  <button onClick={() => addToCart(item)} className="px-3 py-1.5 bg-[#DB9C23] text-white text-[11px] font-bold rounded-lg hover:bg-[#174C2C] transition-colors flex items-center gap-1">
                    <Plus size={11} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#FFF3E0] border-t border-[#D4A017]/25 px-6 py-4">
            <p className="text-[#6D4C41] text-[13px]">
              <strong className="text-[#DB9C23]">Delivery Note:</strong> Fastest home delivery available. Delivery charges applicable via Porter/Courier at <strong>₹30/kg</strong>. Minimum order: <strong>0.5 kg</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#DB9C23] py-14 px-6 text-center">
        <h3 className="text-white font-extrabold text-2xl mb-2">Ready to Order?</h3>
        <p className="text-[#DB9C23]200 text-[15px] mb-6">Call or WhatsApp us directly — we respond quickly!</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D4A017] text-white font-bold rounded-full hover:bg-white hover:text-[#DB9C23] transition-all duration-200">
            <Phone size={15} /> {PHONE_DISPLAY}
          </a>
          <a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-200">
            WhatsApp Us
          </a>
        </div>
        <button onClick={() => { setPage("products"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="mt-5 text-[#DB9C23]300 text-[13px] underline underline-offset-2 hover:text-white transition-colors">
          ← Back to All Products
        </button>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ────────────────────────────────────────────────────────────
function AboutPage() {
  const timeline = [
    { year: "The Idea", title: "Born from a Kitchen", desc: "Shrujay Food Products started with a simple belief: families deserve pure, unprocessed food — exactly as it comes from nature." },
    { year: "Our Way", title: "No Third-Party Sourcing", desc: "Every product is sourced directly from local Pune-region farms and processed in our home kitchen under strict hygiene standards." },
    { year: "Our Promise", title: "Zero Compromise", desc: "We never compromise on purity. No polishing, no chemicals, no artificial additives — just the real thing, every time." },
  ];

  return (
    <div className="pt-[64px] lg:pt-[80px] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFF8EC] py-14 sm:py-20 px-4 sm:px-6 border-b border-[#D4A017]/20">
        <div className="max-w-7xl mx-auto text-center">
          <SectionPill>Our Story</SectionPill>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#DB9C23] mb-5">About Srujay Food Products</h1>
          <p className="text-[#6D4C41] max-w-2xl mx-auto text-[16px] leading-relaxed">
            A home-based food brand rooted in the belief that what you eat should be pure, natural and made with love — just like your grandmother used to make it.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="bg-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <LeafDivider className="mb-6 max-w-[200px]" />
              <h2 className="text-3xl font-extrabold text-[#DB9C23] mb-5">Why Shrujay Was Started</h2>
              <div className="space-y-4 text-[#6D4C41] text-[15px] leading-relaxed">
                <p>
                  We noticed that most commercially available dals and pulses are heavily polished, treated with chemicals and stored in warehouses for months. The result? Less nutrition, less flavour, and less trust.
                </p>
                <p>
                  Shrujay Food Products was born to change that. We work directly with farmers in and around Pune to source the freshest, most natural grains — and process them in our own kitchen, the same way Indian families have done for generations.
                </p>
                <p>
                  Our philosophy is simple: <strong className="text-[#DB9C23]">if we won't eat it ourselves, we won't sell it to you.</strong> Every dal, every ladoo, every grain that leaves our kitchen is tested, tasted and packed with care.
                </p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-[#F5EDD8]">
              <img
                src="https://images.unsplash.com/photo-1509359149003-657ef23eaf04?w=700&h=530&fit=crop&auto=format"
                alt="Traditional Indian spices and food ingredients"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Story timeline */}
      <div className="bg-[#FFF8E1] py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionPill>Our Philosophy</SectionPill>
            <h2 className="text-3xl font-extrabold text-[#DB9C23]">How We Work</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timeline.map((t, i) => (
              <div key={i} className="bg-white rounded-[14px] p-6 border border-[#D4A017]/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[#D4A017] font-extrabold text-[11px] tracking-[0.18em] uppercase mb-3">{t.year}</div>
                <h3 className="font-bold text-[#DB9C23] text-[16px] mb-2">{t.title}</h3>
                <p className="text-[#6D4C41] text-[14px] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio showcase */}
      <div className="bg-[#FFF9F0] py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <SectionPill>Portfolio</SectionPill>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2E7D32]">SHRUJAY FOOD PRODUCTS</h2>
          </div>
          <div className="bg-white rounded-[16px] border border-[#D4A017]/15 shadow-[0_18px_50px_rgba(46,125,50,0.08)] overflow-hidden">
            <div className="relative overflow-hidden bg-[#FFF9F0]">
              <img
                src="/assets/1000322279.jpg"
                alt="SHRUJAY FOOD PRODUCTS project showcase"
                className="w-full max-w-[900px] mx-auto rounded-[16px] shadow-[0_18px_60px_rgba(46,125,50,0.12)] object-cover"
                style={{ display: 'block' }}
              />
            </div>
            <div className="p-5 sm:p-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#2E7D32] mb-4">Srujay Food Products</h3>
              <p className="text-[#6D4C41] text-[15px] leading-[1.7] max-w-3xl mb-6">
                Some brands are built in factories. Shrujay was built in a home kitchen — one dal, one batch, one family recipe at a time. We built them a website that carries the same warmth: bilingual, honest, and unmistakably theirs.
              </p>
              <p className="text-[#6D4C41] text-[13px]">A heartfelt digital home for a small family business, designed to feel warm, familiar and easy for every customer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision callout */}
      <div className="bg-[#D4A017] py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#DB9C23 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }} />
        <div className="max-w-2xl mx-auto relative">
          <LeafDivider className="mb-6 max-w-xs mx-auto [&_div]:bg-gradient-to-r [&_div]:from-transparent [&_div]:to-white/30" />
          <div className="text-white/70 font-bold text-[11px] tracking-[0.2em] uppercase mb-4">Our Vision · आमची दृष्टी</div>
          <blockquote className="text-white font-bold text-xl md:text-2xl leading-relaxed mb-5 italic">
            "गुणवत्ता, शुद्धता आणि विश्वास — हेच आमचे ध्येय."
          </blockquote>
          <p className="text-white/80 text-[15px] font-medium mb-2">
            "Quality, purity and trust — that is our purpose."
          </p>
          <p className="text-white/65 text-[13px]">
            We envision a Pune where every home has access to food that is as natural, nutritious and trustworthy as home-grown produce.
          </p>
        </div>
      </div>

      {/* Values grid */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <SectionPill>Our Values</SectionPill>
            <h2 className="text-3xl font-extrabold text-[#DB9C23]">What We Believe In</h2>
          </div>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {[
              { icon: <Leaf size={22}/>,        val: "Purity",     desc: "No chemicals, no additives" },
              { icon: <Shield size={22}/>,       val: "Hygiene",    desc: "Clean, careful handling" },
              { icon: <Heart size={22}/>,        val: "Care",       desc: "Made with love, always" },
              { icon: <CheckCircle size={22}/>,  val: "Honesty",    desc: "Fair pricing, no hidden costs" },
            ].map((v, i) => (
              <div key={i} className="text-center p-5 bg-[#FFF8EC] rounded-[14px] border border-[#DB9C23]/10">
                <div className="w-12 h-12 rounded-full bg-[#DB9C23]/10 flex items-center justify-center mx-auto mb-3 text-[#DB9C23]">{v.icon}</div>
                <div className="font-bold text-[#DB9C23] text-[15px] mb-1">{v.val}</div>
                <div className="text-[#6D4C41] text-[12px]">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ──────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const cards = [
    {
      icon: <Phone size={22} />,
      label: "Call / WhatsApp",
      content: (
        <div className="space-y-1">
          <a href={`tel:${PHONE}`} className="block text-[#DB9C23] font-bold text-[15px] hover:underline">{PHONE_DISPLAY}</a>
          <a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noopener noreferrer" className="text-[#6D4C41] text-[13px] hover:text-[#DB9C23]">Open WhatsApp →</a>
        </div>
      ),
    },
    {
      icon: <Instagram size={22} />,
      label: "Instagram",
      content: <p className="text-[#6D4C41] text-[14px]">{INSTAGRAM_HANDLE}</p>,
    },
    {
      icon: <MapPin size={22} />,
      label: "Location",
      content: <p className="text-[#6D4C41] text-[14px] leading-relaxed">Pune, Maharashtra<br />India — 411 000</p>,
    },
    {
      icon: <Truck size={22} />,
      label: "Delivery Info",
      content: (
        <div className="text-[#6D4C41] text-[13px] space-y-0.5">
          <p>Fastest home delivery available</p>
          <p>Courier charges: ₹30/kg (Porter)</p>
          <p>Minimum order: 0.5 kg</p>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-[64px] lg:pt-[80px] min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#DB9C23] py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-7xl mx-auto text-center relative">
          <SectionPill>Get in Touch</SectionPill>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Contact Us</h1>
          <p className="text-[#DB9C23]200 max-w-lg mx-auto text-[15px] leading-relaxed">
            Have a question or ready to order? We&apos;re just a call or message away.
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {cards.map((c, i) => (
            <div key={i} className="bg-[#FFF8EC] rounded-[14px] p-5 border border-[#DB9C23]/10 hover:shadow-[0_4px_20px_rgba(46,125,50,0.10)] transition-all duration-200 hover:border-[#D4A017]/35">
              <div className="w-11 h-11 rounded-xl bg-[#DB9C23]/10 flex items-center justify-center text-[#DB9C23] mb-4">{c.icon}</div>
              <div className="font-bold text-[#DB9C23] text-[13px] mb-2 tracking-wide uppercase">{c.label}</div>
              {c.content}
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#DB9C23] mb-6">Send an Enquiry</h2>
            {sent ? (
              <div className="bg-[#E8F5E9] border border-[#DB9C23]/25 rounded-[14px] p-8 text-center">
                <CheckCircle size={40} className="text-[#DB9C23] mx-auto mb-3" />
                <h3 className="font-bold text-[#DB9C23] text-xl mb-2">Message Received!</h3>
                <p className="text-[#6D4C41] text-[14px]">Thank you for reaching out. We&apos;ll get back to you on <strong>{PHONE_DISPLAY}</strong> shortly.</p>
                <button onClick={() => setSent(false)} className="mt-5 text-[#DB9C23] text-[13px] underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { name: "name" as const,    label: "Your Name",    type: "text",  placeholder: "e.g. Ravi Sharma" },
                  { name: "phone" as const,   label: "Phone Number", type: "tel",   placeholder: "e.g. 9876543210" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-[#DB9C23] font-semibold text-[13px] mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      required
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[#DB9C23]/20 bg-[#FFF8EC] text-[#2C1810] text-[14px] focus:outline-none focus:border-[#DB9C23] focus:ring-2 focus:ring-[#DB9C23]/15 transition-all placeholder:text-[#6D4C41]/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[#DB9C23] font-semibold text-[13px] mb-1.5">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="What products are you interested in? Any special requirements?"
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#DB9C23]/20 bg-[#FFF8EC] text-[#2C1810] text-[14px] focus:outline-none focus:border-[#DB9C23] focus:ring-2 focus:ring-[#DB9C23]/15 transition-all resize-none placeholder:text-[#6D4C41]/50"
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-[#DB9C23] text-white font-bold rounded-full hover:bg-[#D4A017] transition-all duration-200 flex items-center justify-center gap-2">
                  <Send size={15} /> Send Enquiry
                </button>
              </form>
            )}
          </div>

          {/* Map */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#DB9C23] mb-6">Our Location</h2>
            <div className="h-[280px] sm:h-[380px] rounded-[14px] overflow-hidden shadow-md border border-[#DB9C23]/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.0!2d73.9641990!3d18.4956049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eac93e1f9d47%3A0x0!2zMTjCsDI5JzQ0LjIiTiA3M8KwNTgnMDAuNCJF!5e0!3m2!1sen!2sin!4v1700000000002!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0, display: "block" }}
                allowFullScreen loading="lazy" title="Shrujay Food Products Location, Pune"
              />
            </div>
            <div className="mt-4 bg-[#FFF8EC] rounded-xl p-4 border border-[#DB9C23]/10 flex items-start gap-3">
              <MapPin size={16} className="text-[#DB9C23] mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-[#DB9C23] text-[13px]">Shrujay Food Products</div>
                <div className="text-[#6D4C41] text-[12px]">Pune, Maharashtra, India · Coordinates: 18.4956° N, 73.9668° E</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ───────────────────────────────────────────────────────────
function CartDrawer({
  open,
  items,
  close,
  changeQuantity,
  removeItem,
  onCheckout,
}: {
  open: boolean;
  items: CartItem[];
  close: () => void;
  changeQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce(
    (sum, item) => sum + calculateLineTotal(item.product.priceValue, item.quantity),
    0,
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={close} aria-label="Close cart" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#FFF8EC] shadow-2xl flex flex-col">
        <div className="px-5 py-4 bg-[#174C2C] text-white flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-xl flex items-center gap-2"><ShoppingCart size={20} /> Your Cart</h2>
            <p className="text-white/65 text-[12px]">{items.length} product{items.length === 1 ? "" : "s"} selected</p>
          </div>
          <button onClick={close} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Close cart">
            <X size={19} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[#DB9C23]/10 text-[#DB9C23] flex items-center justify-center mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-bold text-[#174C2C] text-lg">Your cart is empty</h3>
            <p className="text-[#6D4C41] text-[13px] mt-1">Add your favourite Shrujay products to begin an order.</p>
            <button onClick={close} className="mt-5 px-6 py-2.5 bg-[#DB9C23] text-white text-[13px] font-bold rounded-full">Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="bg-white rounded-2xl border border-[#DB9C23]/15 p-3 flex gap-3 shadow-sm">
                  <img src={product.img} alt={product.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-[#F5EDD8] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#174C2C] text-[13px] leading-tight">{product.name}</h3>
                        <p className="text-[#DB9C23] text-[11px]">{product.marathi}</p>
                      </div>
                      <button onClick={() => removeItem(product.id)} className="text-red-500/70 hover:text-red-600 p-1" aria-label={`Remove ${product.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center border border-[#DB9C23]/20 rounded-lg overflow-hidden">
                        <button
                          onClick={() => changeQuantity(product.id, quantity - QUANTITY_STEP_KG)}
                          disabled={quantity <= MIN_QUANTITY_KG}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#FFF3E0] disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`Decrease ${product.name} by 0.1 kilogram`}
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min={MIN_QUANTITY_KG}
                          step={QUANTITY_STEP_KG}
                          value={quantity}
                          onChange={(event) => {
                            const nextQuantity = Number(event.target.value);
                            if (Number.isFinite(nextQuantity)) changeQuantity(product.id, nextQuantity);
                          }}
                          aria-label={`${product.name} quantity in kilograms`}
                          className="w-14 h-8 border-x border-[#DB9C23]/20 bg-transparent text-center text-[12px] font-bold outline-none"
                        />
                        <span className="pr-2 text-[10px] font-semibold text-[#6D4C41]">kg</span>
                        <button
                          onClick={() => changeQuantity(product.id, quantity + QUANTITY_STEP_KG)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#FFF3E0]"
                          aria-label={`Increase ${product.name} by 0.1 kilogram`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-extrabold text-[#DB9C23] text-[14px]">
                        {formatCurrency(calculateLineTotal(product.priceValue, quantity))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#DB9C23]/15 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-[#6D4C41]">Estimated total</span>
                <span className="font-extrabold text-[#174C2C] text-2xl">{formatCurrency(total)}</span>
              </div>
              <p className="text-[10px] text-[#6D4C41]/70 mb-3">Quantity is calculated in kilograms. Delivery charges may apply.</p>
              <button
                onClick={onCheckout}
                className="w-full py-3 bg-[#6B4226] text-white font-bold rounded-2xl hover:bg-[#8B5E3C] transition-all duration-200 shadow-[0_10px_24px_rgba(107,66,38,0.18)] flex items-center justify-center gap-2"
              >
                Order Now <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item => item.product.id === product.id
          ? { ...item, quantity: normalizeQuantity(item.quantity + MIN_QUANTITY_KG) }
          : item);
      }
      return [...current, { product, quantity: MIN_QUANTITY_KG }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (productId: number, quantity: number) => {
    setCartItems(current => current.map(item => item.product.id === productId
      ? { ...item, quantity: normalizeQuantity(quantity) }
      : item));
  };

  const removeItem = (productId: number) => {
    setCartItems(current => current.filter(item => item.product.id !== productId));
  };

  const cartCount = cartItems.length;

  const checkoutItems: OrderItem[] = cartItems.map(item => ({
    id: item.product.id,
    name: item.product.name,
    marathi: item.product.marathi,
    price: item.product.priceValue,
    quantity: item.quantity,
    image: item.product.img,
  }));

  return (
    <div className="min-h-screen bg-[#FFF8EC] font-[Mukta,sans-serif]">
      <Nav page={page} setPage={setPage} cartCount={cartCount} openCart={() => setCartOpen(true)} />
      <main>
        {page === "home"           && <HomePage setPage={setPage} addToCart={addToCart} />}
        {page === "products"       && <ProductsPage setPage={setPage} addToCart={addToCart} />}
        {page === "product-detail" && <ProductDetailPage setPage={setPage} addToCart={addToCart} />}
        {page === "about"          && <AboutPage />}
        {page === "contact"        && <ContactPage />}
      </main>
      <Footer setPage={setPage} />
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        close={() => setCartOpen(false)}
        changeQuantity={changeQuantity}
        removeItem={removeItem}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <OrderModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} items={checkoutItems} />
    </div>
  );
}
