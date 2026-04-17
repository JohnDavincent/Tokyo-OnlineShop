"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const topNav = ["Categories", "Wholesale", "Deals", "Rewards"];

const aisles = [
  {
    title: "Organic Produce",
    image: "/images/fresh_veggies.png",
    tone: "from-[#20261e] via-[#263827] to-[#4f6b42]",
  },
  {
    title: "Premium Meats",
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%2314121c'/><stop offset='1' stop-color='%2336313b'/></linearGradient></defs><rect width='800' height='800' rx='42' fill='url(%23bg)'/><text x='400' y='120' fill='%23f4ca73' font-size='54' font-family='Arial' text-anchor='middle'>PREMIUM</text><text x='400' y='200' fill='%23f4ca73' font-size='54' font-family='Arial' text-anchor='middle'>MEATS</text><ellipse cx='420' cy='530' rx='210' ry='130' fill='%23c58a84'/><path d='M255 520c65-135 280-170 345-68 33 52 12 138-77 184-68 36-151 29-220-11-49-28-78-71-78-105z' fill='%23a44a4c'/><path d='M338 455c86-45 202-50 274 15' stroke='%23f3d1c2' stroke-width='18' fill='none' stroke-linecap='round'/></svg>",
    tone: "from-[#1a1724] via-[#282433] to-[#3a3140]",
  },
  {
    title: "Dairy & Eggs",
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23d7f1ef'/><stop offset='1' stop-color='%23698786'/></linearGradient></defs><rect width='800' height='800' rx='42' fill='url(%23bg)'/><text x='400' y='146' fill='%23f7fff4' font-size='72' font-family='Arial' text-anchor='middle'>Safe at work!</text><circle cx='195' cy='634' r='46' fill='%23a55b2e'/><circle cx='305' cy='622' r='42' fill='%23d4a778'/><circle cx='390' cy='654' r='41' fill='%23895b36'/><path d='M470 488h118v164H470z' rx='18' fill='%23fff7d4'/><path d='M605 440c0-56 35-98 70-98s70 42 70 98v212H605z' fill='%23edf7fb'/><rect x='585' y='470' width='58' height='182' rx='22' fill='%23f4fbff'/><path d='M470 488h118v22H470z' fill='%23d3b44d'/><path d='M394 444 472 504 448 626 362 578z' fill='%23f2dd7d'/></svg>",
    tone: "from-[#cfe8e3] via-[#90b7b2] to-[#577a76]",
  },
  {
    title: "Pantry Staples",
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23fbfbf9'/><stop offset='1' stop-color='%239b9a95'/></linearGradient></defs><rect width='800' height='800' rx='42' fill='url(%23bg)'/><rect x='254' y='132' width='292' height='520' rx='18' fill='%236da9b4'/><rect x='286' y='188' width='228' height='375' rx='10' fill='%23cbdae3'/><rect x='286' y='188' width='228' height='48' fill='%23496978'/><text x='400' y='223' fill='%2397b7c4' font-size='38' font-family='Arial' text-anchor='middle'>PANTRY STAPLES</text><rect x='315' y='262' width='71' height='130' rx='14' fill='%23f8f7ef'/><rect x='420' y='278' width='71' height='116' rx='14' fill='%23dad9cc'/><rect x='308' y='426' width='83' height='96' rx='14' fill='%23b39361'/><rect x='418' y='424' width='83' height='102' rx='14' fill='%23f2e4c8'/></svg>",
    tone: "from-[#fcfcf6] via-[#d6d2c8] to-[#aca79d]",
  },
];

type Product = {
  label: string;
  title: string;
  description: string;
  prices: [string, string, string]; // [pcs, pax, box]
  image: string;
  available: boolean;
};

const products: Product[] = [
  {
    label: "Fresh Fruit",
    title: "Premium Aomori Fuji Apples",
    description: "Crisp, sweet, and perfectly round. Direct from Aomori orchards.",
    prices: ["Rp 15.000", "Rp 85.000", "Rp 320.000"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 720'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%230e4f53'/><stop offset='1' stop-color='%23061b20'/></linearGradient><radialGradient id='apple' cx='45%' cy='35%' r='65%'><stop stop-color='%23ffb553'/><stop offset='0.55' stop-color='%23db5227'/><stop offset='1' stop-color='%238d150e'/></radialGradient></defs><rect width='720' height='720' rx='36' fill='url(%23bg)'/><circle cx='210' cy='470' r='140' fill='url(%23apple)'/><circle cx='505' cy='468' r='140' fill='url(%23apple)'/><circle cx='362' cy='255' r='140' fill='url(%23apple)'/><path d='M210 316c25-46 62-58 78-58' stroke='%23514d25' stroke-width='18' fill='none' stroke-linecap='round'/><path d='M362 100c19-44 56-60 76-60' stroke='%23514d25' stroke-width='18' fill='none' stroke-linecap='round'/><path d='M505 330c19-42 53-58 72-58' stroke='%23514d25' stroke-width='18' fill='none' stroke-linecap='round'/></svg>",
    available: true,
  },
  {
    label: "Fresh Fruit",
    title: "Yamanashi Shine Muscat",
    description: "Seedless, edible skin, and an incredibly sweet, floral flavor profile.",
    prices: ["-", "Rp 240.000", "Rp 680.000"],
    image: "/images/green_grapes.png",
    available: false,
  },
  {
    label: "Dairy",
    title: "Hokkaido Premium Milk",
    description: "Rich, creamy, whole milk sourced from free-roaming Hokkaido cows.",
    prices: ["Rp 35.000", "Rp 190.000", "Rp 380.000"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 720'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23fafafa'/><stop offset='1' stop-color='%23e3f0f4'/></linearGradient></defs><rect width='720' height='720' rx='36' fill='url(%23bg)'/><path d='M240 160h210l70 95v300c0 35-28 63-63 63H303c-35 0-63-28-63-63V235z' fill='%23fdfefe' stroke='%235d95b1' stroke-width='14'/><path d='M240 160h210l70 95H310z' fill='%231087c7'/><text x='386' y='208' fill='%23ffffff' font-size='42' font-family='Arial' text-anchor='middle'>HOKKAIDO</text><text x='384' y='262' fill='%235d95b1' font-size='44' font-family='Arial' text-anchor='middle'>MILK</text><text x='384' y='350' fill='%2378aac1' font-size='34' font-family='Arial' text-anchor='middle'>Premium</text><text x='384' y='395' fill='%2378aac1' font-size='34' font-family='Arial' text-anchor='middle'>Whole Milk</text></svg>",
    available: true,
  },
  {
    label: "Pantry Staples",
    title: "Niigata Koshihikari Rice",
    description: "The gold standard of Japanese rice. Sticky, sweet, and aromatic.",
    prices: ["-", "Rp 320.000", "Rp 1.800.000"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 720'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23407821'/><stop offset='0.5' stop-color='%2396b342'/><stop offset='1' stop-color='%23132d0e'/></linearGradient></defs><rect width='720' height='720' rx='36' fill='url(%23bg)'/><ellipse cx='380' cy='510' rx='220' ry='115' fill='%23804921'/><ellipse cx='380' cy='470' rx='220' ry='90' fill='%23b57b35'/><path d='M210 455c40-72 312-80 344 0' fill='%23cfad64'/><g stroke='%23f9e8a8' stroke-width='8' stroke-linecap='round'><path d='M250 420c0 78 0 95 0 140'/><path d='M282 410c0 78 0 95 0 140'/><path d='M316 405c0 78 0 95 0 140'/><path d='M350 398c0 78 0 95 0 140'/><path d='M384 396c0 78 0 95 0 140'/><path d='M418 398c0 78 0 95 0 140'/><path d='M452 405c0 78 0 95 0 140'/><path d='M486 410c0 78 0 95 0 140'/></g></svg>",
    available: true,
  },
];

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

/* ─── Price Badge ─────────────────────────────────────────── */
const unitMeta: Record<string, { bg: string; dot: string; label: string }> = {
  Pcs: { bg: "bg-[#f0fdf4]", dot: "bg-emerald-500", label: "Per Piece" },
  Pax: { bg: "bg-[#eff6ff]", dot: "bg-blue-500", label: "Per Pack" },
  Box: { bg: "bg-[#fdf4ff]", dot: "bg-purple-500", label: "Per Box" },
};

function PriceBadge({ unit, price }: { unit: string; price: string }) {
  const meta = unitMeta[unit];
  const unavailable = price === "-";
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 ${unavailable ? "bg-black/[0.03]" : meta.bg}`}>
      <div className="flex items-center gap-2.5">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${unavailable ? "bg-black/20" : meta.dot}`} />
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[0.64rem] font-bold uppercase tracking-[0.14em] leading-none text-black/50">
            {unit}
          </span>
          <span className="text-[0.55rem] text-black/35 leading-none">{unavailable ? "Not sold" : meta.label}</span>
        </div>
      </div>
      <span
        className={`text-[1.05rem] font-extrabold tracking-tight ${unavailable ? "text-black/22 line-through" : "text-[#101210]"
          }`}
      >
        {unavailable ? "N/A" : price}
      </span>
    </div>
  );
}

/* ─── Add-to-Cart Modal ───────────────────────────────────── */
type ModalProps = {
  product: Product;
  onClose: () => void;
};

const unitOrder: Array<"Pcs" | "Pax" | "Box"> = ["Pcs", "Pax", "Box"];

function AddToCartModal({ product, onClose }: ModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({ Pcs: 0, Pax: 0, Box: 0 });

  function change(unit: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [unit]: Math.max(0, (prev[unit] ?? 0) + delta),
    }));
  }

  function handleInput(unit: string, raw: string) {
    const val = parseInt(raw, 10);
    setQuantities((prev) => ({ ...prev, [unit]: isNaN(val) || val < 0 ? 0 : val }));
  }

  const total = unitOrder.reduce((acc, unit, i) => {
    const price = product.prices[i];
    if (price === "-") return acc;
    // Replace all non-digits to support "Rp 15.000"
    const num = parseFloat(price.replace(/[^0-9]/g, ""));
    return acc + num * (quantities[unit] ?? 0);
  }, 0);

  const hasItems = Object.values(quantities).some((q) => q > 0);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet */}
      <div
        className="relative w-full max-w-md rounded-t-[32px] bg-white px-6 pb-8 pt-6 shadow-[0_-24px_80px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:pb-8"
        style={{ animation: "slideUp 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-black/12 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
              {product.label}
            </p>
            <h3 className="mt-1 font-headline text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] text-[#101210]">
              {product.title}
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

        {/* Divider */}
        <div className="my-5 h-px bg-black/6" />

        {/* Unit rows */}
        <div className="flex flex-col gap-3">
          {unitOrder.map((unit, i) => {
            const price = product.prices[i];
            const meta = unitMeta[unit];
            const unavailable = price === "-";
            return (
              <div
                key={unit}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 ${unavailable
                    ? "border-black/5 bg-black/[0.02] opacity-50"
                    : "border-black/7 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  }`}
              >
                {/* Label + price */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${unavailable ? "bg-black/20" : meta.dot}`} />
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-black/45">
                      {unit} — {meta.label}
                    </span>
                  </div>
                  <p className={`mt-1 text-[1.3rem] font-extrabold tracking-tight ${unavailable ? "text-black/25" : "text-[#101210]"}`}>
                    {unavailable ? "Not available" : price}
                  </p>
                </div>

                {/* Quantity spinner */}
                <div
                  className={`flex items-center gap-1 rounded-xl border ${unavailable ? "pointer-events-none border-black/5 bg-black/5" : "border-black/10 bg-[#f6f8f5]"
                    }`}
                >
                  <button
                    aria-label={`Decrease ${unit}`}
                    disabled={unavailable || (quantities[unit] ?? 0) === 0}
                    onClick={() => change(unit, -1)}
                    className="flex h-9 w-9 items-center justify-center rounded-l-xl text-lg font-bold text-black/50 transition hover:bg-black/8 disabled:opacity-30"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    disabled={unavailable}
                    value={quantities[unit] ?? 0}
                    onChange={(e) => handleInput(unit, e.target.value)}
                    className="w-12 bg-transparent text-center text-[1rem] font-bold text-[#101210] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    aria-label={`Increase ${unit}`}
                    disabled={unavailable}
                    onClick={() => change(unit, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-r-xl text-lg font-bold text-black/50 transition hover:bg-black/8 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total + CTA */}
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
            <button
              className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(0,105,65,0.28)] transition hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
            >
              Add to Cart
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
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

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
            <button aria-label="Account" className="transition-transform duration-200 hover:scale-110"><UserIcon /></button>
            <button aria-label="Cart" className="transition-transform duration-200 hover:scale-110"><CartIcon /></button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="mx-auto grid max-w-[1180px] gap-5 px-6 pb-14 pt-8 lg:grid-cols-[1.9fr_0.9fr] lg:px-8">
        <article className="group relative min-h-[430px] overflow-hidden rounded-[32px] bg-[#d8d3c9] text-white shadow-[0_24px_60px_rgba(0,45,30,0.12)]">
          <Image src="/images/fresh_veggies.png" alt="Fresh vegetables in a box" fill className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]" priority />
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
                <span className="text-sm text-black/35 line-through">¥3,500</span>
                <span className="text-[1.9rem] font-bold text-[#d03518]">¥2,800</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── Explore Aisles ── */}
      <section className="mx-auto max-w-[1180px] px-6 pb-14 lg:px-8">
        <div className="overflow-hidden rounded-[34px] bg-[#eef1ee] px-6 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:px-8 lg:px-10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-headline text-[2.65rem] font-extrabold tracking-[-0.05em] text-primary">Explore Aisles</h2>
              <p className="mt-2 max-w-md text-base text-on-surface/68">Curated essentials for your daily vitality.</p>
            </div>
            <Link href="/" className="hidden items-center gap-2 text-base font-semibold text-primary sm:inline-flex">View All <span aria-hidden>→</span></Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {aisles.map((aisle, index) => (
              <article
                key={aisle.title}
                className="group relative min-h-[220px] overflow-hidden rounded-[22px] bg-slate-900 text-white"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${aisle.tone}`} />
                <Image src={aisle.image} alt={aisle.title} fill className="object-cover opacity-88 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.5))]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-headline text-[1.85rem] font-bold tracking-[-0.04em]">{aisle.title}</h3>
                </div>
              </article>
            ))}
          </div>
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
              key={product.title}
              className="group flex h-full flex-col rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_16px_40px_rgba(0,39,25,0.08)] transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-[14px]">
                <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#e74d23] px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                  <span className="text-[0.72rem]">◉</span> Hot
                </div>
                {/* Status at top right */}
                <div
                  className={`absolute right-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${product.available
                      ? "bg-emerald-500/90 text-white"
                      : "bg-black/60 text-white"
                    }`}
                >
                  {product.available ? "Available" : "Out of Stock"}
                </div>
                <div className="relative aspect-[1/0.98] bg-slate-100">
                  <Image src={product.image} alt={product.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                <p className="text-[0.73rem] font-bold uppercase tracking-[0.16em] text-primary">{product.label}</p>
                <h3 className="mt-1.5 font-headline text-[1.35rem] font-bold leading-tight tracking-[-0.04em] text-[#131713]">
                  {product.title}
                </h3>

                {/* ── Price badges ── */}
                <div className="mt-4 flex flex-col gap-2">
                  {unitOrder.map((unit, i) => (
                    <PriceBadge key={unit} unit={unit} price={product.prices[i]} />
                  ))}
                </div>

                {/* ── Add button ── */}
                <button
                  id={`add-${product.title.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setActiveProduct(product)}
                  aria-label={`Add ${product.title} to cart`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(0,105,65,0.28)] active:translate-y-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
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
