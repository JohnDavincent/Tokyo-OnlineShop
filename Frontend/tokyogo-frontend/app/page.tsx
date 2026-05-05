"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const topNav = ["Categories", "Wholesale", "Deals", "Rewards"];

const tones = [
  "from-[#20261e] via-[#263827] to-[#4f6b42]",
  "from-[#1a1724] via-[#282433] to-[#3a3140]",
  "from-[#cfe8e3] via-[#90b7b2] to-[#577a76]",
  "from-[#fcfcf6] via-[#d6d2c8] to-[#aca79d]",
];

// --- ⚙️ CATEGORY HOVER EFFECT SETTINGS ⚙️ ---
// You can easily adjust these values to change how the hover effect looks!
// Tailwind CSS classes are used here (e.g., opacity-85, grayscale-[30%])
const HOVER_CONFIG = {
  // 1. Settings for the OTHER images when you hover over one:
  dimOpacity: "group-hover/slider:opacity-70",      // Less dim (was 40, now 85)
  dimGrayscale: "group-hover/slider:grayscale-[20%]", // Less gray (was 80%, now 30%)
  dimScale: "group-hover/slider:scale-[0.98]",      // Shrinks slightly by 2%

  // 2. Settings for the SPECIFIC image you are hovering over:
  hoverOpacity: "hover:!opacity-100",   // Stays fully bright
  hoverGrayscale: "hover:!grayscale-0", // Keeps true colors
  hoverScale: "hover:!scale-100",       // Stays normal size

  // 3. Settings for all images when you are NOT hovering anything:
  baseTintOpacity: "opacity-40", // How strong the color tint is normally
  baseImageOpacity: "opacity-70" // How bright the actual image is normally
};

import { ApiProduct, ApiCategory, UnitList } from "../types/api";
import { normalizeUnit } from "../services/config";
import { getProducts, getArrivalProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

function resolveProductImage(url?: string) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }

  if (url.startsWith("data:")) {
    return url;
  }

  // The local image files are sitting directly in the generic public/ folder,
  // so we isolate just the image filename and request it from root.
  const filename = url.split("/").pop();
  return `/${filename}`;
}

function resolveCategoryImage(url?: string | null) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) {
    return url;
  }
  const filename = url.split("/").pop();
  return `/image/category/${filename}`;
}

function getCardsPerView(width: number) {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 520) return 2;
  return 1;
}

/* ─── Icons ─────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 5h2.5l1.8 8.2a1.5 1.5 0 0 0 1.46 1.18h7.98a1.5 1.5 0 0 0 1.45-1.11L20 8H7.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Price Badge ─────────────────────────────────────────── */
const unitMeta: Record<string, { bg: string; dot: string; label: string }> = {
  Pcs: { bg: "bg-[#f0fdf4]", dot: "bg-emerald-500", label: "Per Piece" },
  Pack: { bg: "bg-[#eff6ff]", dot: "bg-blue-500", label: "Per Pack" },
  Box: { bg: "bg-[#fdf4ff]", dot: "bg-purple-500", label: "Per Box" },
};

function PriceBadge({ unit, price }: { unit: string; price: number | string }) {
  const normUnit = normalizeUnit(unit);
  const meta = unitMeta[normUnit] || { bg: "bg-[#f3f4f6]", dot: "bg-gray-500", label: "Per Unit" };
  const unavailable = price === 0 || price === "-";
  const displayPrice = typeof price === "number" ? `Rp ${price.toLocaleString("id-ID")}` : price;

  return (
    <div className={`flex flex-col items-start gap-1 rounded-xl px-3 py-2.5 ${unavailable ? "bg-black/[0.03]" : meta.bg}`}>
      <div className="flex items-center gap-1.5">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${unavailable ? "bg-black/20" : meta.dot}`} />
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-black/40">
          {normUnit}
        </span>
      </div>
      <span
        className={`text-[1.1rem] font-extrabold leading-none tracking-tight ${unavailable ? "text-black/22 line-through" : "text-[#101210]"
          }`}
      >
        {unavailable ? "N/A" : displayPrice}
      </span>
      <span className="text-[0.58rem] text-black/30">{unavailable ? "Not sold" : meta.label}</span>
    </div>
  );
}

/* ─── Add-to-Cart Modal ───────────────────────────────────── */
type ModalProps = {
  product: ApiProduct;
  onClose: () => void;
};

function AddToCartModal({ product, onClose }: ModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number | string>>({});

  function change(unit: string, delta: number) {
    setQuantities((prev) => {
      const q = typeof prev[unit] === 'number' ? prev[unit] : (parseInt(prev[unit] as string || "0", 10) || 0);
      return {
        ...prev,
        [unit]: Math.max(0, q + delta),
      };
    });
  }

  function handleInput(unit: string, raw: string) {
    if (raw === "") {
      setQuantities((prev) => ({ ...prev, [unit]: "" }));
      return;
    }
    const val = parseInt(raw, 10);
    setQuantities((prev) => ({ ...prev, [unit]: isNaN(val) || val < 0 ? 0 : val }));
  }

  const total = product.unitList?.reduce((acc, unitItem) => {
    const normUnit = normalizeUnit(unitItem.unit);
    const qRaw = quantities[normUnit] ?? 0;
    const q = typeof qRaw === 'number' ? qRaw : (parseInt(qRaw as string || "0", 10) || 0);
    return acc + (unitItem.sellPrice * q);
  }, 0) || 0;

  const hasItems = Object.values(quantities).some((qRaw) => {
    const q = typeof qRaw === 'number' ? qRaw : (parseInt(qRaw as string || "0", 10) || 0);
    return q > 0;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-t-[32px] bg-white px-6 pb-8 pt-6 shadow-[0_-24px_80px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:pb-8"
        style={{ animation: "slideUp 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-black/12 sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
              {product.category}
            </p>
            <h3 className="mt-1 font-headline text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] text-[#101210]">
              {product.productName}
            </h3>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/6 text-black/50 transition hover:bg-black/10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="my-5 h-px bg-black/6" />

        <div className="flex flex-col gap-3">
          {product.unitList?.map((unitItem) => {
            const normUnit = normalizeUnit(unitItem.unit);
            const meta = unitMeta[normUnit] || { bg: "", dot: "bg-gray-500", label: "Per Unit" };
            const unavailable = unitItem.status !== "AVAILABLE";

            return (
              <div
                key={unitItem.unit}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 ${unavailable
                  ? "border-black/5 bg-black/[0.02] opacity-50"
                  : "border-black/7 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${unavailable ? "bg-black/20" : meta.dot}`} />
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-black/45">
                      {normUnit} — {meta.label}
                    </span>
                  </div>
                  <p className={`mt-1 text-[1.3rem] font-extrabold tracking-tight ${unavailable ? "text-black/25" : "text-[#101210]"}`}>
                    {unavailable ? "Not available" : `Rp ${unitItem.sellPrice.toLocaleString("id-ID")}`}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1 rounded-xl border ${unavailable ? "pointer-events-none border-black/5 bg-black/5" : "border-black/10 bg-[#f6f8f5]"
                    }`}
                >
                  <button
                    aria-label={`Decrease ${normUnit}`}
                    disabled={unavailable || (quantities[normUnit] ?? 0) === 0}
                    onClick={() => change(normUnit, -1)}
                    className="flex h-9 w-9 items-center justify-center rounded-l-xl text-lg font-bold text-black/50 transition hover:bg-black/8 disabled:opacity-30"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    disabled={unavailable}
                    value={quantities[normUnit] ?? 0}
                    onChange={(e) => handleInput(normUnit, e.target.value)}
                    className="w-12 bg-transparent text-center text-[1rem] font-bold text-[#101210] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    aria-label={`Increase ${normUnit}`}
                    disabled={unavailable}
                    onClick={() => change(normUnit, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-r-xl text-lg font-bold text-black/50 transition hover:bg-black/8 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {hasItems && (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f0fdf4] px-5 py-3.5">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary/60">
                Estimated Total
              </p>
              <p className="mt-0.5 text-[1.5rem] font-extrabold tracking-tight text-primary">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>
            <button className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(0,105,65,0.28)] transition hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0">
              tambahkan ke keranjang
            </button>
          </div>
        )}

        {!hasItems && (
          <p className="mt-5 text-center text-sm text-black/35">
            Set a quantity above to add to your cart.
          </p>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function HomePage() {
  const [activeProduct, setActiveProduct] = useState<ApiProduct | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [arrivals, setArrivals] = useState<ApiProduct[]>([]);
  const [arrivalIndex, setArrivalIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [isArrivalLoading, setIsArrivalLoading] = useState(true);
  const [arrivalError, setArrivalError] = useState("");

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(e => console.error("Could not fetch products:", e));
  }, []);

  useEffect(() => {
    getArrivalProducts()
      .then((data) => {
        setArrivals(data);
        setArrivalError("");
      })
      .catch((e) => {
        console.error("Could not fetch new arrivals:", e);
        setArrivalError("New arrival products are not available right now.");
      })
      .finally(() => setIsArrivalLoading(false));
  }, []);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        setCategoryError("");
      })
      .catch((e) => {
        console.error("Could not fetch categories:", e);
        setCategoryError("Categories are not available right now.");
      })
      .finally(() => setIsCategoryLoading(false));
  }, []);

  useEffect(() => {
    const updateCardsPerView = () => setCardsPerView(getCardsPerView(window.innerWidth));

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const cappedArrivals = arrivals.slice(0, 8);
  const slideData = arrivals.length > 0 ? [...cappedArrivals, { isSeeMore: true, productName: "See More Products" } as any] : [];
  const maxArrivalIndex = Math.max(0, slideData.length - cardsPerView);
  const safeArrivalIndex = Math.min(arrivalIndex, maxArrivalIndex);
  const canGoPrev = safeArrivalIndex > 0;
  const canGoNext = safeArrivalIndex < maxArrivalIndex;

  const maxCategoryIndex = Math.max(0, categories.length - cardsPerView);
  const safeCategoryIndex = Math.min(categoryIndex, maxCategoryIndex);
  const canGoPrevCategory = safeCategoryIndex > 0;
  const canGoNextCategory = safeCategoryIndex < maxCategoryIndex;

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-on-surface">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">
            Tokyo GO
          </Link>

          <nav className="hidden items-center gap-10 text-[0.98rem] text-on-surface/80 md:flex">
            {topNav.map((item) => (
              <Link key={item} href="/" className="transition-colors duration-200 hover:text-primary">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-primary">
            <button aria-label="Search" className="transition-transform duration-200 hover:scale-110"><SearchIcon /></button>
            <Link href="/register" aria-label="Account" className="transition-transform duration-200 hover:scale-110"><UserIcon /></Link>
            <button aria-label="Cart" className="transition-transform duration-200 hover:scale-110"><CartIcon /></button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="mx-auto grid max-w-[1180px] gap-5 px-6 pb-14 pt-8 lg:grid-cols-[1.9fr_0.9fr] lg:px-8">
        <article className="group relative min-h-[430px] overflow-hidden rounded-[32px] bg-[#d8d3c9] text-white shadow-[0_24px_60px_rgba(0,45,30,0.12)]">
          <Image src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23edebe0'/><stop offset='1' stop-color='%23d6d0c2'/></linearGradient></defs><rect width='1200' height='800' fill='url(%23bg)'/><text x='600' y='400' fill='%239e998a' font-size='72' font-family='Arial' font-weight='bold' text-anchor='middle'>FARM FRESH</text></svg>" alt="Fresh vegetables in a box" fill className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]" priority />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,28,20,0.62),rgba(14,28,20,0.2)_48%,rgba(14,28,20,0.02))]" />
          <div className="relative flex h-full max-w-[420px] flex-col justify-center gap-6 px-8 py-10 sm:px-10">
            <p className="animate-fade-up text-sm font-bold uppercase tracking-[0.16em] text-primary-fixed [animation-delay:120ms]">Precision Freshness</p>
            <h1 className="animate-fade-up font-headline text-[2.7rem] font-extrabold leading-[0.94] tracking-[-0.05em] [animation-delay:220ms] sm:text-[4.15rem]">
              Farm to Table,<br />Faster Than Ever.
            </h1>
            <div className="animate-fade-up [animation-delay:320ms]">
              <Link href="/" className="inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim">
                Shop Fresh Now <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </article>

        <div className="grid gap-5">
          <article className="group relative min-h-[204px] overflow-hidden rounded-[28px] bg-[#10281e] text-white shadow-[0_20px_45px_rgba(0,30,18,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_22%,rgba(149,181,95,0.75),transparent_20%),linear-gradient(120deg,rgba(0,0,0,0.2),rgba(0,0,0,0.72))]" />
            <div className="absolute right-0 top-0 h-full w-[58%] bg-[radial-gradient(circle_at_58%_40%,rgba(121,145,86,0.76),rgba(17,31,23,0.2)_32%,rgba(6,10,8,0.92)_70%)]" />
            <div className="absolute bottom-4 right-6 h-20 w-20 rounded-full border border-white/10 bg-[radial-gradient(circle_at_40%_38%,rgba(178,214,148,0.9),rgba(64,90,54,0.2)_28%,rgba(14,17,13,0.95)_62%)] shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
            <div className="absolute bottom-5 right-20 h-28 w-14 rounded-t-[999px] rounded-b-xl bg-[linear-gradient(180deg,#7ea45a,#415535)] shadow-[0_10px_30px_rgba(0,0,0,0.2)]" />
            <div className="absolute bottom-5 right-10 h-16 w-8 rounded-full bg-[#d6c192]" />
            <div className="relative flex h-full flex-col justify-end px-6 py-6">
              <h2 className="font-headline text-[2rem] font-bold leading-none tracking-[-0.04em]">Artisan Matcha</h2>
              <p className="mt-2 text-sm text-white/78">Direct from Uji, Kyoto.</p>
              <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-fixed">Explore <span aria-hidden>›</span></Link>
            </div>
          </article>

          <article className="group relative min-h-[144px] overflow-hidden rounded-[28px] bg-[#1d241d] shadow-[0_20px_45px_rgba(0,30,18,0.12)]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#16241a_10%,#101412_100%)]" />
            <div className="absolute inset-y-0 right-0 w-[62%] bg-[linear-gradient(135deg,rgba(242,183,188,0.1),rgba(247,187,191,0.9))]" />
            <div className="absolute bottom-0 right-0 h-full w-[62%] bg-[radial-gradient(circle_at_28%_42%,rgba(251,242,231,0.26),transparent_18%),repeating-linear-gradient(155deg,#f8d0d2_0_14px,#e38b93_14px_28px,#f4b3ba_28px_42px)] opacity-90" />
            <div className="absolute left-1/2 top-1/2 min-w-[154px] -translate-x-[44%] -translate-y-1/2 rounded-[22px] bg-[rgba(253,247,241,0.95)] px-6 py-5 text-center shadow-[0_16px_34px_rgba(42,20,17,0.12)]">
              <p className="text-sm font-medium text-primary">Weekly Special</p>
              <h3 className="mt-2 font-headline text-[1.9rem] font-bold tracking-[-0.04em] text-[#101210]">Premium Sashimi</h3>
              <div className="mt-3 flex items-end justify-center gap-3">
                <span className="text-sm text-black/35 line-through">Rp 350.000</span>
                <span className="text-[1.9rem] font-bold text-[#d03518]">Rp 280.000</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── Explore Categories ── */}
      <section className="mx-auto max-w-[1180px] px-6 pb-14 lg:px-8">
        <div className="overflow-hidden rounded-[34px] bg-[#eef1ee] px-6 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:px-8 lg:px-10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-headline text-[2.65rem] font-extrabold tracking-[-0.05em] text-primary">Explore Categories</h2>
              <p className="mt-2 max-w-md text-base text-on-surface/68">Curated essentials for your daily vitality.</p>
            </div>
            <Link href="/" className="hidden items-center gap-2 text-base font-semibold text-primary sm:inline-flex">View All <span aria-hidden>→</span></Link>
          </div>

          {isCategoryLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="min-h-[220px] animate-pulse rounded-[22px] bg-black/10" />
              ))}
            </div>
          ) : categoryError ? (
            <div className="rounded-[24px] border border-[#f3d6cf] bg-[#fff7f3] px-6 py-5 text-sm text-[#8b3f2f]">
              {categoryError}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-[24px] border border-black/5 bg-white px-6 py-5 text-sm text-on-surface/55">
              No categories found.
            </div>
          ) : (
            <>
              <div className="relative">
                {/* Left Slider Navigation */}
                <button
                  type="button"
                  aria-label="Previous categories"
                  disabled={!canGoPrevCategory}
                  onClick={() => setCategoryIndex((prev) => Math.max(0, prev - 1))}
                  className={`absolute -left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white text-on-surface shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 hover:text-primary md:flex ${!canGoPrevCategory ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                >
                  <ArrowLeftIcon />
                </button>

                <div className="overflow-hidden p-2 -m-2">
                  <div
                    className="flex gap-4 transition-transform duration-700 ease-out group/slider"
                    style={{
                      width: "100%",
                      transform: `translate3d(calc(-${safeCategoryIndex} * (100% / ${cardsPerView} + ${16 / cardsPerView}px)), 0, 0)`
                    }}
                  >
                    {categories.map((category, idx) => {
                      const cardStyle = { flex: `0 0 calc((100% - ${(cardsPerView - 1) * 16}px) / ${cardsPerView})` };
                      const tone = tones[idx % tones.length];

                      return (
                        <div key={category.id} style={cardStyle} className={`transition-all duration-500 ${HOVER_CONFIG.dimOpacity} ${HOVER_CONFIG.dimGrayscale} ${HOVER_CONFIG.dimScale} ${HOVER_CONFIG.hoverOpacity} ${HOVER_CONFIG.hoverGrayscale} ${HOVER_CONFIG.hoverScale}`}>
                          <Link href={`/product/category?categoryId=${category.id}`}>
                            <article className="group relative min-h-[220px] h-full overflow-hidden rounded-[22px] bg-slate-900 text-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1">
                              <div className={`absolute inset-0 bg-gradient-to-br ${tone} ${HOVER_CONFIG.baseTintOpacity} transition-opacity duration-500 group-hover:opacity-0 z-10`} />

                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={resolveCategoryImage(category.imageUrl)}
                                alt={category.altText || category.categoryName}
                                className={`absolute inset-0 h-full w-full object-cover ${HOVER_CONFIG.baseImageOpacity} transition-all duration-700 group-hover:scale-105 group-hover:opacity-100`}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = resolveCategoryImage();
                                }}
                              />
                              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.8))] z-10" />
                              <div className="absolute inset-x-0 bottom-0 p-5 z-20">
                                <h3 className="font-headline text-[1.85rem] font-bold tracking-[-0.04em] leading-tight drop-shadow-md">{category.categoryName}</h3>
                              </div>
                            </article>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Slider Navigation */}
                <button
                  type="button"
                  aria-label="Next categories"
                  disabled={!canGoNextCategory}
                  onClick={() => setCategoryIndex((prev) => Math.min(maxCategoryIndex, prev + 1))}
                  className={`absolute -right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white text-on-surface shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 hover:text-primary md:flex ${!canGoNextCategory ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                >
                  <ArrowRightIcon />
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="mt-5 flex items-center justify-between md:hidden">
                <button
                  type="button"
                  aria-label="Previous categories"
                  disabled={!canGoPrevCategory}
                  onClick={() => setCategoryIndex((prev) => Math.max(0, prev - 1))}
                  className="flex h-11 items-center gap-2 rounded-full border border-black/8 bg-white px-4 text-sm font-semibold text-on-surface transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeftIcon />
                  Prev
                </button>
                <button
                  type="button"
                  aria-label="Next categories"
                  disabled={!canGoNextCategory}
                  onClick={() => setCategoryIndex((prev) => Math.min(maxCategoryIndex, prev + 1))}
                  className="flex h-11 items-center gap-2 rounded-full border border-black/8 bg-white px-4 text-sm font-semibold text-on-surface transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next
                  <ArrowRightIcon />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Products ── */}
      <section className="mx-auto max-w-[1180px] px-6 pb-24 lg:px-8">
        <div className="mb-8">
          <h2 className="font-headline text-[2.35rem] font-extrabold tracking-[-0.05em] text-[#131713]">Paling laris nih guys</h2>
          <p className="mt-2 text-base text-on-surface/68">Current community favorites.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => (
            <article
              key={product.productName}
              className="group flex h-full flex-col rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_16px_40px_rgba(0,39,25,0.08)] transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-[14px]">
                <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#e74d23] px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                  <span className="text-[0.72rem]">◉</span> Hot
                </div>
                <div
                  className={`absolute right-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${product.status === "AVAILABLE"
                    ? "bg-emerald-500/90 text-white"
                    : "bg-black/60 text-white"
                    }`}
                >
                  {product.status === "AVAILABLE" ? "Available" : "Out of Stock"}
                </div>
                <div className="relative aspect-[1/0.98] bg-slate-100 overflow-hidden rounded-[11px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveProductImage(product.url)} alt={product.altText || product.productName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveProductImage(); }} />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                <p className="text-[0.73rem] font-bold uppercase tracking-[0.16em] text-primary truncate">{product.category}</p>
                <h3 className="mt-1.5 font-headline text-[1.35rem] font-bold leading-tight tracking-[-0.04em] text-[#131713] line-clamp-2 min-h-[3.2rem]">
                  {product.productName}
                </h3>

                {/* ── Price badges ── */}
                <div className="mt-4 flex flex-col gap-2">
                  {product.unitList?.map((unitItem) => (
                    <PriceBadge key={unitItem.unit} unit={unitItem.unit} price={unitItem.sellPrice} />
                  ))}
                </div>

                {/* ── Add button ── */}
                <Link
                  id={`add-${product.productName.replace(/\s+/g, "-").toLowerCase()}`}
                  href={`/product/${product.productId || product.id}`}
                  aria-label={`View ${product.productName} details`}
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(0,105,65,0.28)] active:translate-y-0"
                >
                  Lihat Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 pb-24 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <h2 className="font-headline text-[2.35rem] font-extrabold tracking-[-0.05em] text-[#131713]">
              New Arrival
            </h2>
            <p className="mt-2 max-w-xl text-base text-on-surface/68">
              Freshly added products from the latest arrival feed.
            </p>
          </div>

        </div>

        {isArrivalLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_16px_40px_rgba(0,39,25,0.05)]">
                <div className="aspect-[1/0.98] animate-pulse rounded-[14px] bg-black/6" />
                <div className="mt-4 h-3 w-24 animate-pulse rounded-full bg-black/6" />
                <div className="mt-3 h-8 w-3/4 animate-pulse rounded-full bg-black/6" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-black/6" />
                  <div className="h-16 animate-pulse rounded-2xl bg-black/6" />
                </div>
              </div>
            ))}
          </div>
        ) : arrivalError ? (
          <div className="rounded-[24px] border border-[#f3d6cf] bg-[#fff7f3] px-6 py-5 text-sm text-[#8b3f2f]">
            {arrivalError}
          </div>
        ) : arrivals.length === 0 ? (
          <div className="rounded-[24px] border border-black/5 bg-white px-6 py-5 text-sm text-on-surface/55">
            No new arrival products found.
          </div>
        ) : (
          <>
            <div className="relative">
              {/* Left Slider Navigation */}
              <button
                type="button"
                aria-label="Previous arrivals"
                disabled={!canGoPrev}
                onClick={() => setArrivalIndex((prev) => Math.max(0, prev - 1))}
                className={`absolute -left-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white text-on-surface shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 hover:text-primary md:flex ${!canGoPrev ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
              >
                <ArrowLeftIcon />
              </button>

              <div className="overflow-hidden p-2 -m-2">
                <div
                  className="flex gap-5 transition-transform duration-700 ease-out"
                  style={{
                    width: "100%",
                    transform: `translate3d(calc(-${safeArrivalIndex} * (100% / ${cardsPerView} + ${20 / cardsPerView}px)), 0, 0)`
                  }}
                >
                  {slideData.map((product, idx) => {
                    const cardStyle = { flex: `0 0 calc((100% - ${(cardsPerView - 1) * 20}px) / ${cardsPerView})` };

                    if (product.isSeeMore) {
                      return (
                        <div key="see-more-card" style={cardStyle}>
                          <article
                            className="group flex h-full flex-col items-center justify-center rounded-[20px] border border-black/5 bg-gradient-to-br from-[#f0fdf4] to-[#fcfcfc] p-6 text-center shadow-[0_16px_40px_rgba(0,39,25,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,39,25,0.12)] cursor-pointer"
                            onClick={() => window.location.href = '/'}
                          >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-dim">
                              <ArrowRightIcon />
                            </div>
                            <h3 className="mt-5 font-headline text-[1.45rem] font-bold tracking-tight text-[#131713]">See More<br />Products</h3>
                            <p className="mt-2 text-sm text-on-surface/60">View our complete<br />new arrival catalog.</p>
                          </article>
                        </div>
                      );
                    }

                    return (
                      <div key={`arrival-${product.productName}`} style={cardStyle}>
                        <article className="group flex h-full flex-col rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_16px_40px_rgba(0,39,25,0.08)] transition-transform duration-300 hover:-translate-y-1">
                          <div className="relative overflow-hidden rounded-[14px]">
                            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                              <span className="text-[0.72rem]">✦</span>
                              New
                            </div>
                            <div
                              className={`absolute right-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${product.status === "AVAILABLE"
                                ? "bg-emerald-500/90 text-white"
                                : "bg-black/60 text-white"
                                }`}
                            >
                              {product.status === "AVAILABLE" ? "Available" : "Out of Stock"}
                            </div>
                            <div className="relative aspect-[1/0.98] overflow-hidden rounded-[11px] bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={resolveProductImage(product.url)}
                                alt={product.altText || product.productName}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = resolveProductImage();
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                            <p className="text-[0.73rem] font-bold uppercase tracking-[0.16em] text-primary truncate">
                              {product.category}
                            </p>
                            <h3 className="mt-1.5 font-headline text-[1.35rem] font-bold leading-tight tracking-[-0.04em] text-[#131713] line-clamp-2 min-h-[3.2rem]">
                              {product.productName}
                            </h3>

                            <div className="mt-4 flex flex-col gap-2">
                              {product.unitList?.map((unitItem: UnitList) => (
                                <PriceBadge key={`${product.productName}-${unitItem.unit}`} unit={unitItem.unit} price={unitItem.sellPrice} />
                              ))}
                            </div>

                            <Link
                              href={`/product/${product.productId || product.id}`}
                              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                            >
                              View Details
                            </Link>
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Slider Navigation */}
              <button
                type="button"
                aria-label="Next arrivals"
                disabled={!canGoNext}
                onClick={() => setArrivalIndex((prev) => Math.min(maxArrivalIndex, prev + 1))}
                className={`absolute -right-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white text-on-surface shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 hover:text-primary md:flex ${!canGoNext ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
              >
                <ArrowRightIcon />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between md:hidden">
              <button
                type="button"
                aria-label="Previous arrivals"
                disabled={!canGoPrev}
                onClick={() => setArrivalIndex((prev) => Math.max(0, prev - 1))}
                className="flex h-11 items-center gap-2 rounded-full border border-black/8 bg-white px-4 text-sm font-semibold text-on-surface transition disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeftIcon />
                Prev
              </button>
              <button
                type="button"
                aria-label="Next arrivals"
                disabled={!canGoNext}
                onClick={() => setArrivalIndex((prev) => Math.min(maxArrivalIndex, prev + 1))}
                className="flex h-11 items-center gap-2 rounded-full border border-black/8 bg-white px-4 text-sm font-semibold text-on-surface transition disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ArrowRightIcon />
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 bg-white/65">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">Tokyo GO</p>
            <p className="mt-3 text-sm text-on-surface/55">© 2024 Tokyo GO. Precision Freshness.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-on-surface/58">
            <Link href="/">About Us</Link>
            <Link href="/">Sustainability</Link>
            <Link href="/">Shipping Policy</Link>
            <Link href="/">Contact Support</Link>
            <Link href="/">Privacy</Link>
          </div>
        </div>
      </footer>

      {/* ── Modal ── */}
      {activeProduct && (
        <AddToCartModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      )}
    </main>
  );
}
