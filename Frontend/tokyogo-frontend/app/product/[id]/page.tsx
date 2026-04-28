"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────── */
type ApiImage = {
  url: string;
  productName: string | null;
  altText: string | null;
  isPrimary: boolean;
  slug: string | null;
};

type ApiUnit = {
  id: string | null;
  unit: string;
  convertUnit: string | null;
  basePrice: number | null;
  sellPrice: number | null;
  convertQuantity?: number;
  status?: string;
};

type ApiProductDetail = {
  baseWeight: number;
  brand: string;
  category: string;
  description: string;
  imageList: ApiImage[];
  name: string;
  sku: string;
  stock: number | null;
  subCategory: string;
  unitList: ApiUnit[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  value: number;
  data: ApiProductDetail;
};

const API_BASE_URL = "http://localhost:5001";

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

function normalizeUnit(rawUnit: string) {
  const lo = rawUnit.toLowerCase();
  if (lo.includes("pcs") || lo.includes("piece")) return "Pcs";
  if (lo.includes("pack") || lo.includes("pax")) return "Pack";
  if (lo.includes("box")) return "Box";
  return rawUnit;
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

function PackageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || "";

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUnit, setSelectedUnit] = useState<ApiUnit | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError("Product ID is missing");
      return;
    }

    async function loadProduct() {
      try {
        let finalProduct: ApiProductDetail | null = null;
        let listUnits: any[] = [];

        // Always fetch the list first to grab the convertQuantity mapped values
        const listRes = await fetch(`${API_BASE_URL}/tokyo/gropup/product`);
        if (listRes.ok) {
          const listJson = await listRes.json();
          const listData = Array.isArray(listJson) ? listJson : (listJson.data || []);
          
          const decodedName = decodeURIComponent(productId).toLowerCase();
          const matched = listData.find((p: any) =>
            p.productId === productId || p.id === productId || p._id === productId ||
            (p.productName || p.name || "").toLowerCase() === decodedName
          );

          if (matched) {
            listUnits = matched.unitList || [];
            const realId = matched.productId || matched.id || matched._id || productId;
            const detailRes = await fetch(`${API_BASE_URL}/tokyo/gropup/product/${encodeURIComponent(realId)}`);
            if (detailRes.ok) {
              const detailJson = await detailRes.json();
              if (detailJson.success && detailJson.data) {
                finalProduct = detailJson.data;
              }
            }
          }
        }

        // Fallback: If it wasn't matched in the list, just hit the detail endpoint directly
        if (!finalProduct) {
          const detailRes = await fetch(`${API_BASE_URL}/tokyo/gropup/product/${encodeURIComponent(productId)}`);
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            if (detailJson.success && detailJson.data) {
              finalProduct = detailJson.data;
            }
          }
        }

        if (!finalProduct) {
          setError("Product not found");
          return;
        }

        // MERGE: The detail API doesn't return convertQuantity, but the list API does!
        if (listUnits.length > 0 && finalProduct.unitList) {
          finalProduct.unitList = finalProduct.unitList.map(u => {
            const listU = listUnits.find(lu => normalizeUnit(lu.unit) === normalizeUnit(u.unit));
            if (listU) {
              return { ...u, convertQuantity: listU.convertQuantity, status: listU.status };
            }
            return u;
          });
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

      if (data.unitList && data.unitList.length > 0) {
        const firstAvailable = data.unitList.find(isUnitAvailable);
        setSelectedUnit(firstAvailable || data.unitList[0]);
      }

      if (data.imageList && data.imageList.length > 0) {
        const primaryIndex = data.imageList.findIndex((img) => img.isPrimary);
        setActiveImage(primaryIndex >= 0 ? primaryIndex : 0);
      }
    }

    loadProduct();
  }, [productId]);

  function changeQuantity(delta: number) {
    setQuantity((prev) => {
      const num = typeof prev === "number" ? prev : (parseInt(prev || "0", 10) || 0);
      return Math.max(1, num + delta);
    });
  }

  function handleInput(raw: string) {
    if (raw === "") {
      setQuantity("");
      return;
    }
    const val = parseInt(raw, 10);
    setQuantity(isNaN(val) || val < 1 ? 1 : val);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-sm font-medium text-on-surface/50">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-center animate-fade-up">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#101210] mb-2">{error || "Product Not Found"}</h1>
          <p className="text-on-surface/50 mb-8">The product you are looking for does not exist or might have been removed.</p>
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

  const isAvailable = selectedUnit != null && isUnitAvailable(selectedUnit);
  const currentPrice = selectedUnit?.sellPrice || 0;
  const qtyNum = typeof quantity === "number" ? quantity : parseInt(quantity || "1", 10);
  const total = qtyNum * currentPrice;

  const images = product.imageList?.length > 0 ? product.imageList : [{ url: null, altText: product.name, isPrimary: true }];
  const activeImageUrl = resolveImageUrl(images[activeImage]?.url);
  const activeImageAlt = images[activeImage]?.altText || product.name;

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#0f2118]">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface/60 transition-colors hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-primary/10">
              <ArrowLeftIcon className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to shop</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-black/35">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-black/20">/</span>
            <span className="hover:text-primary transition-colors cursor-pointer">{product.category}</span>
            <span className="text-black/20">/</span>
            <span className="text-black/70 truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${isLiked ? "bg-red-50 text-red-500" : "bg-black/5 text-black/40 hover:bg-black/10"}`}
              aria-label="Like product"
            >
              <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Product Hero ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">

          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-white shadow-[0_24px_60px_rgba(0,39,25,0.1)] border border-black/[0.04]">
              <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur-md ${isAvailable ? "bg-emerald-500 text-white" : "bg-black/70 text-white"}`}>
                  {isAvailable ? (
                    <>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
                      </span>
                      In Stock
                    </>
                  ) : (
                    "Out of Stock"
                  )}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10">
                <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
                  {product.category}
                </span>
              </div>

              <img
                src={activeImageUrl}
                alt={String(activeImageAlt)}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveImageUrl(); }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex justify-center gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square w-[18%] max-w-[80px] overflow-hidden rounded-2xl border-2 transition-all duration-300 ${activeImage === idx ? "border-primary shadow-[0_4px_16px_rgba(0,105,65,0.18)]" : "border-transparent bg-white/60 opacity-60 hover:opacity-100"} shadow-sm`}
                  >
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={img.altText || product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveImageUrl(); }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col animate-fade-up">

            {/* Brand & SKU */}
            <div className="flex flex-wrap items-center gap-2 text-[0.75rem] font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1.5 text-primary uppercase tracking-wider">
                <CheckIcon className="h-3 w-3" />
                {product.brand}
              </span>
              <span className="text-black/30">•</span>
              <span className="text-black/40 uppercase tracking-wider font-mono text-[0.7rem]">{product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="mt-3 font-headline text-[2.2rem] sm:text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#101210]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5">
              <span className="text-[2.2rem] font-extrabold tracking-tight text-[#101210] leading-none">
                Rp {currentPrice.toLocaleString("id-ID")}
              </span>
              <span className="ml-2 text-sm text-black/40 font-medium">/ {normalizeUnit(selectedUnit?.unit || "")}</span>
            </div>

            {/* Description */}
            <p className="mt-5 text-[0.95rem] text-black/55 leading-[1.7]">
              {product.description}
            </p>

            {/* Package Size */}
            <div className="mt-6 inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 shadow-[0_2px_12px_rgba(0,39,25,0.05)] border border-black/[0.04]">
              <PackageIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-[#101210]">{product.baseWeight}g</span>
              <span className="text-sm text-black/30">/ pcs</span>
            </div>

            {/* ── Selection Card ── */}
            <div className="mt-6 rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,39,25,0.06)] border border-black/[0.04]">

              {/* Unit Selector */}
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-black/35 mb-4">Select Packaging</p>
                <div className="grid grid-cols-3 gap-3">
                  {UNIT_OPTIONS.map((option) => {
                    const matchedUnit = findUnitForOption(product, option.norm);
                    const avail = isUnitAvailable(matchedUnit);
                    const isSelected = selectedUnit?.unit === matchedUnit?.unit;

                    return (
                      <button
                        key={option.norm}
                        disabled={!avail}
                        onClick={() => {
                          if (matchedUnit) {
                            setSelectedUnit(matchedUnit);
                            setQuantity(1);
                          }
                        }}
                        className={`relative flex flex-col items-center rounded-2xl border-2 px-3 py-4 transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/[0.04] shadow-[0_4px_16px_rgba(0,105,65,0.12)]"
                            : avail
                              ? "border-black/[0.06] bg-[#f6f8f5] hover:border-primary/30 hover:bg-white hover:shadow-sm"
                              : "border-black/[0.04] bg-black/[0.02] cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className={`text-sm font-bold ${avail ? "text-[#101210]" : "text-black/30"}`}>
                          {option.label}
                        </span>

                        {avail && matchedUnit ? (
                          <>
                            <span className="mt-1.5 text-[0.95rem] font-extrabold text-primary">
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

              {/* Quantity & Total */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-t border-black/[0.05] pt-5">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-black/35 mb-2">Quantity</p>
                  <div className={`flex h-12 w-40 items-center justify-between rounded-xl bg-[#f6f8f5] px-2 border border-black/[0.06] ${!isAvailable ? "opacity-50 pointer-events-none" : ""}`}>
                    <button
                      onClick={() => changeQuantity(-1)}
                      disabled={qtyNum <= 1 || !isAvailable}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-black/50 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleInput(e.target.value)}
                      disabled={!isAvailable}
                      className="w-14 bg-transparent text-center text-base font-bold text-[#101210] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => changeQuantity(1)}
                      disabled={!isAvailable}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-black/50 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-black/35 mb-1">Total</p>
                  <p className="text-[1.6rem] font-extrabold tracking-tight text-[#101210]">
                    Rp {total.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-black/40 mt-0.5">
                    {qtyNum} × Rp {currentPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                disabled={!isAvailable}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-[#f0fdf4] py-4 text-sm font-bold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-[0_8px_24px_rgba(0,105,65,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f0fdf4] disabled:hover:text-primary disabled:hover:shadow-none"
              >
                <CartIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                Add to Cart
              </button>
              <button
                disabled={!isAvailable}
                className="flex items-center justify-center rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.28)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                Buy Now
              </button>
            </div>

            {/* Feature Cards */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="group flex flex-col items-center text-center gap-2.5 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,39,25,0.05)] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,39,25,0.08)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <TruckIcon className="h-4 w-4" />
                </div>
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-black/50 leading-tight">Same Day<br />Delivery</span>
              </div>
              <div className="group flex flex-col items-center text-center gap-2.5 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,39,25,0.05)] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,39,25,0.08)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <ShieldCheckIcon className="h-4 w-4" />
                </div>
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-black/50 leading-tight">100%<br />Authentic</span>
              </div>
              <div className="group flex flex-col items-center text-center gap-2.5 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,39,25,0.05)] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,39,25,0.08)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <LeafIcon className="h-4 w-4" />
                </div>
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-black/50 leading-tight">Eco<br />Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Specifications Section ── */}
      <section className="border-t border-black/[0.04] bg-white/50">
        <div className="mx-auto max-w-[1180px] px-6 py-12 lg:px-8 lg:py-16">
          <h2 className="font-headline text-[1.5rem] font-bold tracking-[-0.03em] text-[#101210] mb-6">
            Specifications
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] bg-white shadow-[0_4px_24px_rgba(0,39,25,0.05)] border border-black/[0.04] overflow-hidden">
              {[
                { label: "SKU", value: product.sku },
                { label: "Brand", value: product.brand },
                { label: "Category", value: product.category },
                { label: "Sub Category", value: product.subCategory },
                { label: "Status", value: isAvailable ? "In Stock" : "Out of Stock", highlight: isAvailable },
                { label: "Base Weight", value: `${product.baseWeight}g` },
                { label: "Origin", value: "Local Harvest, Indonesia" },
              ].map((spec, i, arr) => (
                <div
                  key={spec.label}
                  className={`flex items-center justify-between px-6 py-4 ${i !== arr.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                >
                  <span className="text-[0.8rem] font-medium text-black/40">{spec.label}</span>
                  <span className={`text-sm font-bold ${spec.highlight ? "text-emerald-600" : "text-[#101210]"}`}>{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              {/* Unit breakdown */}
              <div className="rounded-[24px] bg-white shadow-[0_4px_24px_rgba(0,39,25,0.05)] border border-black/[0.04] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/[0.04]">
                  <h3 className="text-sm font-bold text-[#101210]">Available Units</h3>
                </div>
                <div className="divide-y divide-black/[0.04]">
                  {UNIT_OPTIONS.map((option) => {
                    const u = findUnitForOption(product, option.norm);
                    const avail = isUnitAvailable(u);
                    return (
                      <div key={option.norm} className="flex items-center justify-between px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block h-2 w-2 rounded-full ${avail ? "bg-emerald-500" : "bg-black/15"}`} />
                          <span className="text-sm font-bold text-[#101210]">{option.label}</span>
                        </div>
                        <div className="text-right">
                          {avail && u ? (
                            <>
                              <span className="text-sm font-extrabold text-[#101210]">
                                Rp {(u.sellPrice || 0).toLocaleString("id-ID")}
                              </span>
                              {u.convertQuantity ? (
                                <span className="ml-2 text-xs text-black/40">({u.convertQuantity} pcs / {option.label.toLowerCase()})</span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-sm font-bold text-black/30">Not Available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="rounded-2xl bg-[#f6f8f5] border border-black/[0.04] p-5">
                <p className="text-[0.85rem] text-black/50 leading-relaxed">
                  Actual product appearance may vary slightly from photos due to natural variations in fresh produce. Weight is approximate and may differ by ±5%.
                </p>
              </div>
            </div>
          </div>
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
    </main>
  );
}
