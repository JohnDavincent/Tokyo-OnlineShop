"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { ApiProductDetail, ApiUnit, ApiProduct } from "../../../types/api";
import { normalizeUnit } from "../../../services/config";
import { getProductDetail } from "../../../services/productService";
import { getProducts } from "../../../services/productService";
import { addToCart, AuthRequiredError } from "../../../services/cartservice";
import LoginPromptModal from "../../components/LoginPromptModal";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";

const UNIT_OPTIONS = [
  { norm: "Pcs", label: "Piece", matches: ["pcs", "piece"] },
  { norm: "Pack", label: "Pack", matches: ["pack", "pax"] },
  { norm: "Box", label: "Box", matches: ["box", "boxs", "boxes"] },
];

function resolveImageUrl(url?: string | null) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

function findUnitForOption(product: ApiProductDetail, optionNorm: string): ApiUnit | undefined {
  return product.unitList?.find((u) => normalizeUnit(u.unit) === optionNorm);
}

function isUnitAvailable(unit?: ApiUnit): boolean {
  if (!unit) return false;
  if (unit.status) return unit.status === "AVAILABLE";
  return unit.sellPrice != null && unit.sellPrice > 0;
}

/* ─── Icons ─────────────────────────────────────────────── */
function ArrowLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 5h2.5l1.8 8.2a1.5 1.5 0 0 0 1.46 1.18h7.98a1.5 1.5 0 0 0 1.45-1.11L20 8H7.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v11c0 .6-.4 1-1 1h-2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="18" r="2" />
      <path d="M15 9h4.5a2 2 0 0 1 1.6.8L23 13v4c0 .6-.4 1-1 1h-1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="18" r="2" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeafIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScaleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon({ className = "h-5 w-5", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

/* ─── UserMenu ──────────────────────────────────────────── */
function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/login" aria-label="Account" className="text-black/50 hover:text-primary transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
        </svg>
      </Link>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm transition hover:bg-primary-dim"
        aria-label="Account menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-black/5 bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)] z-50">
          <div className="px-3 py-2.5">
            <p className="text-sm font-bold text-[#101210]">{user.name}</p>
            <p className="text-xs text-black/40">{user.phoneNumber}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
              {user.membership}
            </span>
          </div>
          <div className="my-1 h-px bg-black/[0.06]" />
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#101210] transition hover:bg-black/[0.04]"
          >
            My Profile
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Unit Card Savings Badge ───────────────────────────── */
function getSavingsBadge(normUnit: string): string | null {
  if (normUnit === "Pack") return "SAVE 5%";
  if (normUnit === "Box") return "SAVE 15%";
  return null;
}

/* ─── Page ──────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = (params?.id as string) || "";

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [unitQuantities, setUnitQuantities] = useState<Record<string, number>>({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "shipping">("description");

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError("Product ID is missing");
      return;
    }

    async function loadProduct() {
      try {
        const finalProduct = await getProductDetail(productId);
        if (!finalProduct) {
          setError("Product not found");
          return;
        }
        setProductData(finalProduct);
      } catch (e) {
        console.error("Could not load product:", e);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    function setProductData(data: ApiProductDetail) {
      setProduct(data);
    }

    loadProduct();

    // Load related products
    getProducts()
      .then((all) => {
        const others = all.filter((p) => p.productId !== productId && p.id !== productId).slice(0, 4);
        setRelated(others);
      })
      .catch(() => setRelated([]));
  }, [productId]);

  function toggleUnit(unitKey: string) {
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitKey)) {
        next.delete(unitKey);
      } else {
        next.add(unitKey);
        setUnitQuantities((qPrev) => ({ ...qPrev, [unitKey]: qPrev[unitKey] || 1 }));
      }
      return next;
    });
  }

  function changeUnitQuantity(unitKey: string, delta: number) {
    setUnitQuantities((prev) => ({
      ...prev,
      [unitKey]: Math.max(1, (prev[unitKey] || 1) + delta),
    }));
  }

  function handleUnitInput(unitKey: string, raw: string) {
    const val = parseInt(raw, 10);
    setUnitQuantities((prev) => ({
      ...prev,
      [unitKey]: isNaN(val) || val < 1 ? 1 : val,
    }));
  }

  async function handleAddToCart() {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!product || selectedUnits.size === 0) return;
    setAddingToCart(true);
    setCartSuccess("");
    try {
      const selected = Array.from(selectedUnits);
      for (const unitKey of selected) {
        const matchedUnit = product.unitList?.find((u) => u.unit === unitKey);
        if (matchedUnit && isUnitAvailable(matchedUnit)) {
          const qty = unitQuantities[unitKey] || 1;
          await addToCart({
            productId: productId,
            quantity: qty,
            unit: [matchedUnit.id || matchedUnit.unit],
          });
        }
      }
      setCartSuccess("Added to cart successfully!");
      setTimeout(() => setCartSuccess(""), 3000);
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        setShowLoginPrompt(true);
        return;
      }
      console.error("Failed to add to cart:", e);
      setCartSuccess("Failed to add to cart.");
      setTimeout(() => setCartSuccess(""), 3000);
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-sm font-medium text-black/50">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#101210] mb-2">{error || "Product Not Found"}</h1>
          <p className="text-black/50 mb-8">The product you are looking for does not exist or might have been removed.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_8px_24px_rgba(0,105,65,0.25)] hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }



  const images = product.imageList?.length > 0 ? product.imageList : [{ url: null, altText: product.name, isPrimary: true }];
  const activeImageUrl = resolveImageUrl(images[0]?.url);

  const tabs = [
    { key: "description" as const, label: "Description" },
    { key: "ingredients" as const, label: "Ingredients" },
    { key: "shipping" as const, label: "Shipping & Returns" },
  ];

  return (
    <main className="min-h-screen bg-white text-[#0f2118]">
      {/* ── Top Nav ── */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="font-headline text-[1.4rem] font-extrabold tracking-[-0.03em] text-primary">
            Tokyo GO
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-black/60 md:flex">
            <Link href="/" className="hover:text-primary transition-colors">Shop</Link>
            <Link href="/product/category" className="hover:text-primary transition-colors">Categories</Link>
            <Link href="/" className="hover:text-primary transition-colors">About</Link>
            <Link href="/" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-5 text-black/50">
            <button aria-label="Search" className="hover:text-primary transition-colors"><SearchIcon /></button>
            <UserMenu />
            <Link href="/cart" aria-label="Cart" className="hover:text-primary transition-colors relative">
              <CartIcon />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb Bar ── */}
      <div className="border-b border-black/[0.04]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Shop
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-black/40 sm:flex">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-black/20">/</span>
            <span className="text-black/60">{product.category}</span>
            <span className="text-black/20">/</span>
            <span className="text-black/80 font-medium">{product.name}</span>
          </nav>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isLiked ? "bg-red-50 text-red-500" : "bg-black/5 text-black/30 hover:bg-black/10"}`}
            aria-label="Like product"
          >
            <HeartIcon className="h-4 w-4" filled={isLiked} />
          </button>
        </div>
      </div>

      {/* ── Product Hero ── */}
      <section className="mx-auto max-w-[1180px] px-6 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">

          {/* Left: Image */}
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-full max-w-[480px] aspect-square rounded-[28px] border border-black/[0.05] bg-[#f9faf8] overflow-hidden">
              <div className="absolute left-4 top-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  In Stock
                </span>
              </div>
              <img
                src={activeImageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-8"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveImageUrl(); }}
              />
            </div>

            <span className="text-xs font-medium text-black/35">Click to expand</span>

            {/* Single thumbnail */}
            <div className="flex justify-center">
              <button className="relative aspect-square w-16 overflow-hidden rounded-xl border-2 border-primary shadow-[0_4px_16px_rgba(0,105,65,0.18)]">
                <img
                  src={activeImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveImageUrl(); }}
                />
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-black/40">
              {product.category}
            </span>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Brand & SKU */}
            <div className="flex items-center gap-3 text-[0.75rem] font-bold">
              <span className="inline-flex items-center gap-1.5 text-primary uppercase tracking-wider">
                <CheckIcon className="h-3.5 w-3.5" />
                {product.brand}
              </span>
              <span className="text-black/20">|</span>
              <span className="text-black/40 uppercase tracking-wider font-mono text-[0.7rem]">{product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="mt-3 font-headline text-[2.2rem] sm:text-[2.6rem] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#101210]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4">
              <span className="text-[1.8rem] font-extrabold tracking-tight text-primary leading-none">
                From Rp {Math.min(...(product.unitList?.filter(isUnitAvailable).map((u) => u.sellPrice || Infinity) || [0])).toLocaleString("id-ID")}
              </span>
            </div>

            {/* Description */}
            <p className="mt-4 text-[0.95rem] text-black/50 leading-[1.7]">
              {product.description}
            </p>

            {/* Weight badge */}
            <div className="mt-5 inline-flex items-center gap-2 self-start rounded-xl bg-[#f6f8f5] px-4 py-2.5 border border-black/[0.04]">
              <ScaleIcon className="h-4 w-4 text-black/40" />
              <span className="text-sm font-bold text-[#101210]">{product.baseWeight}g</span>
              <span className="text-sm text-black/30">/ pcs</span>
            </div>

            {/* Select Packaging */}
            <div className="mt-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/35 mb-3">
                Select Packaging
              </p>
              <div className="grid grid-cols-3 gap-3">
                {UNIT_OPTIONS.map((option) => {
                  const matchedUnit = findUnitForOption(product, option.norm);
                  const avail = isUnitAvailable(matchedUnit);
                  const unitKey = matchedUnit?.unit || option.norm;
                  const isSelected = matchedUnit ? selectedUnits.has(unitKey) : false;

                  return (
                    <button
                      key={option.norm}
                      disabled={!avail}
                      onClick={() => {
                        if (matchedUnit) toggleUnit(unitKey);
                      }}
                      className={`relative flex flex-col items-center rounded-2xl border-2 px-3 py-4 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/[0.04] shadow-[0_4px_16px_rgba(0,105,65,0.12)]"
                          : avail
                            ? "border-black/[0.06] bg-[#f9faf8] hover:border-primary/30 hover:bg-white hover:shadow-sm"
                            : "border-black/[0.04] bg-black/[0.02] cursor-not-allowed opacity-50"
                      }`}
                    >
                      <span className={`text-sm font-bold ${avail ? "text-[#101210]" : "text-black/30"}`}>
                        {option.label}
                      </span>
                      {avail && matchedUnit ? (
                        <>
                          <span className="mt-1 text-[0.95rem] font-extrabold text-primary">
                            Rp {(matchedUnit.sellPrice || 0).toLocaleString("id-ID")}
                          </span>
                          {matchedUnit.convertQuantity ? (
                            <span className="mt-0.5 text-[0.65rem] font-semibold text-black/40">
                              {matchedUnit.convertQuantity} pcs / {option.label.toLowerCase()}
                            </span>
                          ) : (
                            <span className="mt-0.5 text-[0.65rem] font-semibold text-black/40">per unit</span>
                          )}
                        </>
                      ) : (
                        <span className="mt-2 text-[0.75rem] font-bold text-black/30">Not Available</span>
                      )}

                      {isSelected && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected unit quantity rows */}
            {selectedUnits.size > 0 && (
              <div className="mt-5 flex flex-col gap-3">
                {UNIT_OPTIONS.map((option) => {
                  const matchedUnit = findUnitForOption(product, option.norm);
                  if (!matchedUnit || !isUnitAvailable(matchedUnit)) return null;
                  const unitKey = matchedUnit.unit;
                  if (!selectedUnits.has(unitKey)) return null;

                  const qty = unitQuantities[unitKey] || 1;
                  const lineTotal = (matchedUnit.sellPrice || 0) * qty;

                  return (
                    <div
                      key={unitKey}
                      className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_12px_rgba(0,39,25,0.04)]"
                    >
                      {/* Top row: unit info + line total */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-black/60">
                          {option.label} — Rp {(matchedUnit.sellPrice || 0).toLocaleString("id-ID")} each
                        </span>
                        <span className="text-[1.1rem] font-extrabold text-[#101210]">
                          Rp {lineTotal.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Bottom row: quantity label + stepper */}
                      <div className="flex items-center gap-4">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-black/35">Quantity</span>
                        <div className="flex h-10 items-center rounded-xl border border-black/[0.08] bg-white px-1">
                          <button
                            onClick={() => changeUnitQuantity(unitKey, -1)}
                            disabled={qty <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-black/40 hover:bg-[#f6f8f5] disabled:opacity-30 transition-all"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => handleUnitInput(unitKey, e.target.value)}
                            className="w-12 bg-transparent text-center text-sm font-bold text-[#101210] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => changeUnitQuantity(unitKey, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-black/40 hover:bg-[#f6f8f5] transition-all"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Finalize Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.28)] active:translate-y-0 disabled:opacity-60"
                >
                  {addingToCart ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <CartIcon className="h-4 w-4" />
                  )}
                  {addingToCart ? "Adding…" : "Add to Cart"}
                </button>

                {cartSuccess && (
                  <div className={`rounded-xl px-4 py-2.5 text-sm font-bold text-center ${cartSuccess.includes("Failed") ? "bg-red-50 text-red-600" : "bg-[#f0fdf4] text-primary"}`}>
                    {cartSuccess}
                  </div>
                )}
              </div>
            )}

            {/* Feature badges */}
            <div className="mt-6 flex gap-3">
              <div className="flex flex-1 flex-col items-center text-center gap-2 rounded-2xl bg-[#f9faf8] p-4 border border-black/[0.04]">
                <TruckIcon className="h-5 w-5 text-primary" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-black/45 leading-tight">Same Day<br />Delivery</span>
              </div>
              <div className="flex flex-1 flex-col items-center text-center gap-2 rounded-2xl bg-[#f9faf8] p-4 border border-black/[0.04]">
                <ShieldCheckIcon className="h-5 w-5 text-primary" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-black/45 leading-tight">100%<br />Authentic</span>
              </div>
              <div className="flex flex-1 flex-col items-center text-center gap-2 rounded-2xl bg-[#f9faf8] p-4 border border-black/[0.04]">
                <LeafIcon className="h-5 w-5 text-primary" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-black/45 leading-tight">Eco<br />Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs Section ── */}
      <section className="border-t border-black/[0.04] bg-[#f9faf8]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 lg:px-8 lg:py-14">
          {/* Tab nav */}
          <div className="flex justify-center gap-8 border-b border-black/[0.06]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-3 text-sm font-bold transition-colors ${
                  activeTab === tab.key ? "text-[#101210]" : "text-black/40 hover:text-black/60"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-8 max-w-2xl mx-auto">
            {activeTab === "description" && (
              <div className="text-[0.95rem] text-black/55 leading-[1.8]">
                <p>{product.description}</p>
                <div className="mt-6 rounded-2xl bg-white p-6 border border-black/[0.04]">
                  <h3 className="font-headline text-lg font-bold text-[#101210] mb-4">Product Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "SKU", value: product.sku },
                      { label: "Brand", value: product.brand },
                      { label: "Category", value: product.category },
                      { label: "Sub Category", value: product.subCategory },
                      { label: "Weight", value: `${product.baseWeight}g per piece` },
                      { label: "Status", value: product.unitList?.some(isUnitAvailable) ? "In Stock" : "Out of Stock" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-[#f9faf8] px-4 py-3">
                        <span className="text-sm text-black/40">{item.label}</span>
                        <span className="text-sm font-bold text-[#101210]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="text-[0.95rem] text-black/55 leading-[1.8]">
                <p>Ingredients and nutritional information will be available soon. We are working with our suppliers to provide complete and accurate details for every product.</p>
                <div className="mt-6 rounded-2xl bg-white p-6 border border-black/[0.04]">
                  <h3 className="font-headline text-lg font-bold text-[#101210] mb-4">Nutritional Info</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Serving Size", value: `${product.baseWeight}g` },
                      { label: "Calories", value: "~350 kcal" },
                      { label: "Protein", value: "8g" },
                      { label: "Carbohydrates", value: "52g" },
                      { label: "Fat", value: "14g" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-[#f9faf8] px-4 py-3">
                        <span className="text-sm text-black/40">{item.label}</span>
                        <span className="text-sm font-bold text-[#101210]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="text-[0.95rem] text-black/55 leading-[1.8]">
                <p>We deliver across Jakarta and surrounding areas. Orders placed before 2 PM are eligible for same-day delivery. For other regions, expect delivery within 1-3 business days.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-6 border border-black/[0.04]">
                    <h3 className="font-headline text-base font-bold text-[#101210] mb-2">Delivery</h3>
                    <ul className="space-y-2 text-sm text-black/50">
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        Same-day delivery for Jakarta
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        Free shipping on orders over Rp 100.000
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        Real-time tracking
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-white p-6 border border-black/[0.04]">
                    <h3 className="font-headline text-base font-bold text-[#101210] mb-2">Returns</h3>
                    <ul className="space-y-2 text-sm text-black/50">
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        7-day return policy
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        Damaged items fully refunded
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        Easy pickup from your door
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-6 py-14 lg:px-8">
          <h2 className="font-headline text-[1.6rem] font-extrabold tracking-[-0.03em] text-[#101210] mb-8 text-center">
            You May Also Like
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.productId || p.id} href={`/product/${p.productId || p.id}`} className="group">
                <article className="flex flex-col rounded-[20px] border border-black/5 bg-white p-3 shadow-[0_8px_30px_rgba(0,39,25,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,39,25,0.1)]">
                  <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f9faf8]">
                    <img
                      src={resolveImageUrl(p.url)}
                      alt={p.altText || p.productName}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveImageUrl(); }}
                    />
                  </div>
                  <div className="mt-3 px-1">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">{p.category}</p>
                    <h3 className="mt-1 font-headline text-[1.1rem] font-bold text-[#101210] line-clamp-1">{p.productName}</h3>
                    <p className="mt-1 text-sm font-extrabold text-primary">
                      Rp {(p.unitList?.[0]?.sellPrice || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-[480px] px-6 text-center">
          <h2 className="font-headline text-[1.6rem] font-extrabold tracking-[-0.02em] text-white">
            Get Fresh Updates
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Be the first to know about new arrivals, special offers, and Indonesian cooking tips.
          </p>
          <div className="mt-6 flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:bg-white/15 transition"
            />
            <button className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg hover:bg-white/90 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── Login Prompt Modal ── */}
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-6 py-12 lg:flex-row lg:justify-between lg:px-8">
          <div className="max-w-xs">
            <p className="font-headline text-[1.4rem] font-extrabold tracking-[-0.03em] text-primary">Tokyo GO</p>
            <p className="mt-3 text-sm text-black/50 leading-relaxed">
              Premium Indonesian groceries delivered fresh to your doorstep. Authentic flavors, curated with care.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40 mb-4">Quick Links</p>
              <div className="flex flex-col gap-2.5 text-sm text-black/60">
                <Link href="/" className="hover:text-primary transition">Shop</Link>
                <Link href="/product/category" className="hover:text-primary transition">Categories</Link>
                <Link href="/" className="hover:text-primary transition">New Arrivals</Link>
                <Link href="/" className="hover:text-primary transition">Best Sellers</Link>
              </div>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40 mb-4">Customer Service</p>
              <div className="flex flex-col gap-2.5 text-sm text-black/60">
                <Link href="/" className="hover:text-primary transition">Shipping Policy</Link>
                <Link href="/" className="hover:text-primary transition">Return Policy</Link>
                <Link href="/" className="hover:text-primary transition">FAQ</Link>
                <Link href="/" className="hover:text-primary transition">Contact Us</Link>
              </div>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40 mb-4">Legal</p>
              <div className="flex flex-col gap-2.5 text-sm text-black/60">
                <Link href="/" className="hover:text-primary transition">Privacy Policy</Link>
                <Link href="/" className="hover:text-primary transition">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-black/[0.04]">
          <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-black/40 sm:flex-row lg:px-8">
            <p>© 2024 Tokyo GO. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Secure Payment</span>
              <span>•</span>
              <span>SSL Encrypted</span>
              <span>•</span>
              <span>Halal Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
