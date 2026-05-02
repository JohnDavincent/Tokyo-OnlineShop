"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────── */
type UnitList = {
  unit: string;
  convertQuantity: number;
  sellPrice: number;
  status: string;
};

type ApiProduct = {
  productId?: string;
  id?: string;
  productName: string;
  status: string;
  url: string;
  altText: string;
  category: string;
  subCategory?: string;
  unitList: UnitList[];
};

type ApiCategory = {
  id: string;
  categoryName: string;
  altText: string | null;
  imageUrl: string | null;
};

const API_BASE_URL = "http://localhost:5001";

/* ─── Helpers ───────────────────────────────────────────── */
function resolveProductImage(url?: string) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

function resolveCategoryImage(url?: string | null) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/image/category/${filename}`;
}

function normalizeUnit(rawUnit: string) {
  const lo = rawUnit.toLowerCase();
  if (lo.includes("pcs") || lo.includes("piece")) return "Pcs";
  if (lo.includes("pack") || lo.includes("pax")) return "Pack";
  if (lo.includes("box")) return "Box";
  return rawUnit;
}

function getLowestPrice(unitList?: UnitList[]) {
  if (!unitList || unitList.length === 0) return 0;
  const available = unitList.filter((u) => u.status === "AVAILABLE" && u.sellPrice > 0);
  if (available.length === 0) return 0;
  return Math.min(...available.map((u) => u.sellPrice));
}

function getPriceRange(unitList?: UnitList[]) {
  if (!unitList || unitList.length === 0) return null;
  const prices = unitList.filter((u) => u.sellPrice > 0).map((u) => u.sellPrice);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `Rp ${min.toLocaleString("id-ID")}` : `Rp ${min.toLocaleString("id-ID")} - ${max.toLocaleString("id-ID")}`;
}

function extractProducts(payload: unknown): ApiProduct[] {
  if (Array.isArray(payload)) return payload as ApiProduct[];
  if (payload && typeof payload === "object") {
    if ("data" in payload && Array.isArray((payload as any).data)) {
      return (payload as any).data;
    }
    if ("data" in payload && (payload as any).data && typeof (payload as any).data === "object") {
      if ("content" in (payload as any).data && Array.isArray((payload as any).data.content)) {
        return (payload as any).data.content;
      }
    }
    if ("content" in payload && Array.isArray((payload as any).content)) {
      return (payload as any).content;
    }
  }
  return [];
}

/* ─── Icons ─────────────────────────────────────────────── */
function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 5h2.5l1.8 8.2a1.5 1.5 0 0 0 1.46 1.18h7.98a1.5 1.5 0 0 0 1.45-1.11L20 8H7.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function FilterIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const topNav = ["Categories", "Wholesale", "Deals", "Rewards"];

/* ─── Page Content (uses useSearchParams, must be wrapped in Suspense) ── */
function CategoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId") || "";
  const activeSubCategoryFromUrl = searchParams.get("subcategory") || "";

  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; subCategory: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const activeCategoryBtnRef = useRef<HTMLButtonElement>(null);

  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  const activeCategoryName = activeCategoryObj ? activeCategoryObj.categoryName : "";

  /* ── Fetch all products & categories once ── */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/tokyo/gropup/product`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/tokyo/gropup/category/list-category`).then((r) => r.json()),
    ])
      .then(([productJson, categoryJson]) => {
        setAllProducts(extractProducts(productJson));
        if (Array.isArray(categoryJson.data)) {
          setCategories(categoryJson.data);
        }
      })
      .catch((e) => console.error("Failed to load data:", e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeCategoryBtnRef.current) {
      activeCategoryBtnRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeCategoryId]);

  /* ── Fetch subcategories when category changes ── */
  useEffect(() => {
    if (!activeCategoryId) {
      setSubCategories([]);
      return;
    }
    fetch(`${API_BASE_URL}/tokyo/gropup/category/list-subcategory/${activeCategoryId}`)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) {
          setSubCategories(json.data);
        } else {
          setSubCategories([]);
        }
      })
      .catch((e) => {
        console.error("Failed to load subcategories:", e);
        setSubCategories([]);
      });
  }, [activeCategoryId]);

  /* ── Active subcategory from URL ── */
  const activeSubCategory = useMemo(() => {
    if (!activeSubCategoryFromUrl) return "";
    const exists = subCategories.some((s) => s.subCategory === activeSubCategoryFromUrl);
    return exists ? activeSubCategoryFromUrl : "";
  }, [activeSubCategoryFromUrl, subCategories]);

  /* ── Filtered products ── */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (activeCategoryId && activeCategoryName) {
      result = result.filter((p) => p.category === activeCategoryName);
    }

    // Subcategory filter
    if (activeSubCategory) {
      result = result.filter((p) => p.subCategory === activeSubCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.productName.toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => getLowestPrice(a.unitList) - getLowestPrice(b.unitList));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => getLowestPrice(b.unitList) - getLowestPrice(a.unitList));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return result;
  }, [allProducts, activeCategoryId, activeCategoryName, activeSubCategory, searchQuery, sortBy]);

  /* ── URL helpers ── */
  function setCategory(catId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      params.set("categoryId", catId);
    } else {
      params.delete("categoryId");
    }
    params.delete("subcategory");
    router.replace(`/product/category?${params.toString()}`);
  }

  function setSubCategory(sub: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sub) {
      params.set("subcategory", sub);
    } else {
      params.delete("subcategory");
    }
    router.replace(`/product/category?${params.toString()}`);
  }

  const sidebarExpanded = !(sidebarCollapsed && !sidebarHovered);

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
            <button aria-label="Search" className="transition-transform duration-200 hover:scale-110">
              <SearchIcon />
            </button>
            <button aria-label="Account" className="transition-transform duration-200 hover:scale-110">
              <UserIcon />
            </button>
            <button aria-label="Cart" className="transition-transform duration-200 hover:scale-110">
              <CartIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb & Title ── */}
      <section className="bg-white border-b border-black/[0.04]">
        <div className="mx-auto max-w-[1180px] px-6 py-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-black/35">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ArrowRightIcon className="h-3 w-3" />
            <span className="text-black/70">{activeCategoryName || "All Products"}</span>
            {activeSubCategory && (
              <>
                <ArrowRightIcon className="h-3 w-3" />
                <span className="text-black/70">{activeSubCategory}</span>
              </>
            )}
          </nav>
          <h1 className="mt-3 font-headline text-[2.4rem] font-extrabold tracking-[-0.04em] text-[#101210]">
            {activeSubCategory || activeCategoryName || "All Products"}
          </h1>
          <p className="mt-1 text-base text-on-surface/60">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex gap-10">
          {/* ── Sidebar ── */}
          <aside
            className="hidden lg:block shrink-0 self-start sticky top-24 overflow-visible"
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
            style={{
              width: sidebarExpanded ? "280px" : "76px",
              transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className="space-y-5 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 pb-2"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
            >
              {/* Collapse Toggle */}
              <div
                className="flex transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ justifyContent: sidebarExpanded ? "flex-end" : "center" }}
              >
                <button
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-black/[0.06] text-black/40 hover:text-primary hover:shadow-md hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
                </button>
              </div>

              {/* Search */}
              <div
                className="relative overflow-hidden"
                style={{
                  opacity: sidebarExpanded ? 1 : 0,
                  transform: sidebarExpanded ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                  pointerEvents: sidebarExpanded ? "auto" : "none",
                }}
              >
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white border border-black/[0.06] py-3 pl-10 pr-4 text-sm font-medium text-[#101210] placeholder:text-black/30 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Now Browsing */}
              <div
                className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  gridTemplateRows: sidebarExpanded ? "1fr" : "0fr",
                  opacity: sidebarExpanded ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="rounded-[20px] bg-white p-3 shadow-[0_4px_24px_rgba(0,39,25,0.06)] border border-black/[0.04]">
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/40 mb-2.5">
                      Now Browsing
                    </div>
                    {activeCategoryId ? (
                      (() => {
                        const activeCat = activeCategoryObj;
                        return (
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-2 ring-primary/15">
                              <img
                                src={activeCat ? resolveCategoryImage(activeCat.imageUrl) : resolveCategoryImage()}
                                alt={activeCategoryName}
                                className="relative z-10 h-full w-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#f0fdf4]">
                                <PackageIcon className="h-6 w-6 text-primary" />
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-headline text-[1.05rem] font-bold text-[#101210] truncate">
                                {activeCategoryName}
                              </div>
                              <div className="mt-0.5 text-xs font-bold text-primary">
                                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0fdf4]">
                          <GridIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-headline text-[1.05rem] font-bold text-[#101210]">All Products</div>
                          <div className="mt-0.5 text-xs font-bold text-primary">
                            {allProducts.length} product{allProducts.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-[24px] bg-white p-2.5 shadow-[0_4px_24px_rgba(0,39,25,0.06)] border border-black/[0.04]">
                <h3
                  className="text-sm font-bold text-[#101210] mb-3 flex items-center gap-2 px-2"
                  style={{
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: "opacity 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <FilterIcon className="h-4 w-4 text-primary shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden">Categories</span>
                </h3>
                <div className="space-y-2">
                  {/* All Products */}
                  <button
                    ref={!activeCategoryId ? activeCategoryBtnRef : undefined}
                    onClick={() => setCategory("")}
                    className={`group w-full flex items-center rounded-2xl px-2.5 py-2.5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${!activeCategoryId
                      ? "bg-primary text-white shadow-[0_6px_20px_rgba(0,105,65,0.25)] scale-[1.02]"
                      : "text-black/60 hover:scale-[1.05] hover:shadow-lg hover:bg-[#f6f8f5] hover:text-[#101210]"
                      }`}
                    style={{ transformOrigin: "center left" }}
                  >
                    <span
                      className="flex items-center min-w-0 shrink-0"
                      style={{
                        gap: sidebarExpanded ? "12px" : "0px",
                        justifyContent: sidebarExpanded ? "flex-start" : "center",
                        width: sidebarExpanded ? "auto" : "100%",
                      }}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${!activeCategoryId ? "bg-white/20" : "bg-[#f0fdf4] group-hover:bg-[#dcfce7]"} transition-colors duration-300`}>
                        <GridIcon className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${!activeCategoryId ? "" : "group-hover:scale-110"}`} />
                      </span>
                      <span
                        className="whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{
                          maxWidth: sidebarExpanded ? "180px" : "0px",
                          opacity: sidebarExpanded ? 1 : 0,
                        }}
                      >
                        All Products
                      </span>
                    </span>
                  </button>

                  {/* Category Items */}
                  {categories.map((cat) => {
                    const isActive = activeCategoryId === cat.id;
                    const catImg = resolveCategoryImage(cat.imageUrl);
                    return (
                      <button
                        key={cat.id}
                        ref={isActive ? activeCategoryBtnRef : undefined}
                        onClick={() => setCategory(cat.id)}
                        className={`group w-full flex items-center rounded-2xl px-2.5 py-2.5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive
                          ? "bg-primary text-white shadow-[0_6px_20px_rgba(0,105,65,0.25)] scale-[1.02]"
                          : "text-black/60 hover:scale-[1.05] hover:shadow-lg hover:bg-[#f6f8f5] hover:text-[#101210]"
                          }`}
                        style={{ transformOrigin: "center left" }}
                      >
                        <span
                          className="flex items-center min-w-0 shrink-0"
                          style={{
                            gap: sidebarExpanded ? "12px" : "0px",
                            justifyContent: sidebarExpanded ? "flex-start" : "center",
                            width: sidebarExpanded ? "auto" : "100%",
                          }}
                        >
                          <span className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ${isActive ? "ring-2 ring-white/40" : ""} transition-all duration-300`}>
                            <img
                              src={catImg}
                              alt={cat.categoryName}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                            {!cat.imageUrl && (
                              <span className={`absolute inset-0 flex items-center justify-center rounded-xl ${isActive ? "bg-white/20" : "bg-[#f0fdf4] group-hover:bg-[#dcfce7]"} transition-colors duration-300`}>
                                <PackageIcon className="h-5 w-5" />
                              </span>
                            )}
                          </span>
                          <span
                            className="whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{
                              maxWidth: sidebarExpanded ? "180px" : "0px",
                              opacity: sidebarExpanded ? 1 : 0,
                            }}
                          >
                            {cat.categoryName}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Mobile Filter Toggle ── */}
          <div className="lg:hidden mb-4 w-full">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-[#101210] shadow-[0_2px_12px_rgba(0,39,25,0.05)] border border-black/[0.04]"
            >
              <FilterIcon className="h-4 w-4" />
              {mobileFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>

            {mobileFilterOpen && (
              <div className="mt-3 rounded-[24px] bg-white p-5 shadow-[0_4px_24px_rgba(0,39,25,0.05)] border border-black/[0.04] space-y-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-[#f6f8f5] border border-black/[0.06] py-2.5 px-4 text-sm font-medium placeholder:text-black/30 outline-none"
                />
                {/* Mobile Categories */}
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/40 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategory("")}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${!activeCategoryId ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"
                        }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => {
                      const isActive = activeCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${isActive ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"
                            }`}
                        >
                          {cat.categoryName}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Mobile Subcategories */}
                {subCategories.length > 0 && (
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/40 mb-2">Subcategories</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSubCategory("")}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${!activeSubCategory ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"
                          }`}
                      >
                        All
                      </button>
                      {subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSubCategory(sub.subCategory)}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${activeSubCategory === sub.subCategory ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"
                            }`}
                        >
                          {sub.subCategory}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Product Area ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-black/50 hidden sm:block">
                Showing <span className="font-bold text-[#101210]">{filteredProducts.length}</span> products
              </p>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-black/50 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl bg-white border border-black/[0.06] py-2.5 px-4 text-sm font-bold text-[#101210] outline-none focus:border-primary/40 cursor-pointer shadow-sm"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Subcategory Bar */}
            {subCategories.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setSubCategory("")}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${!activeSubCategory
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,105,65,0.25)]"
                      : "bg-white text-black/60 border border-black/[0.06] hover:border-primary/30 hover:text-primary"
                      }`}
                  >
                    <TagIcon className="h-3.5 w-3.5" />
                    All
                  </button>
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSubCategory(sub.subCategory)}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${activeSubCategory === sub.subCategory
                        ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,105,65,0.25)]"
                        : "bg-white text-black/60 border border-black/[0.06] hover:border-primary/30 hover:text-primary"
                        }`}
                    >
                      {sub.subCategory}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-[20px] bg-white p-3 shadow-sm border border-black/[0.04]">
                    <div className="aspect-[1/0.95] animate-pulse rounded-[14px] bg-black/6" />
                    <div className="mt-4 h-3 w-20 animate-pulse rounded-full bg-black/6" />
                    <div className="mt-3 h-6 w-3/4 animate-pulse rounded-full bg-black/6" />
                    <div className="mt-4 h-12 animate-pulse rounded-xl bg-black/6" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-black/[0.03] rounded-full flex items-center justify-center mb-5">
                  <PackageIcon className="h-8 w-8 text-black/20" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#101210]">No products found</h3>
                <p className="mt-2 text-sm text-black/50 max-w-xs">
                  Try adjusting your search, category, or subcategory filter to find what you are looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategory("");
                    setSubCategory("");
                  }}
                  className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const priceRange = getPriceRange(product.unitList);
                  const isAvail = product.status === "AVAILABLE";

                  return (
                    <article
                      key={product.productId || product.id}
                      className="group flex flex-col rounded-[20px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,39,25,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,39,25,0.1)] overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <div
                          className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${isAvail ? "bg-emerald-500/90 text-white" : "bg-black/60 text-white"
                            }`}
                        >
                          {isAvail ? "Available" : "Out of Stock"}
                        </div>
                        <div className="relative aspect-[1/0.95] bg-slate-100 overflow-hidden">
                          <img
                            src={resolveProductImage(product.url)}
                            alt={product.altText || product.productName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = resolveProductImage();
                            }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary truncate">
                          {product.subCategory || product.category}
                        </p>
                        <h3 className="mt-1.5 font-headline text-[1.2rem] font-bold leading-tight tracking-[-0.03em] text-[#131713] line-clamp-2 min-h-[3rem]">
                          {product.productName}
                        </h3>

                        {/* Price */}
                        <div className="mt-3">
                          {priceRange ? (
                            <span className="text-[1.1rem] font-extrabold tracking-tight text-[#101210]">
                              {priceRange}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-black/30">Price unavailable</span>
                          )}
                        </div>

                        {/* Unit badges */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.unitList?.slice(0, 2).map((unitItem) => {
                            const norm = normalizeUnit(unitItem.unit);
                            const unavailable = unitItem.status !== "AVAILABLE";
                            return (
                              <span
                                key={unitItem.unit}
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[0.65rem] font-bold ${unavailable
                                  ? "bg-black/[0.03] text-black/25 line-through"
                                  : "bg-[#f0fdf4] text-primary"
                                  }`}
                              >
                                {norm} {unavailable ? "(N/A)" : `Rp ${unitItem.sellPrice.toLocaleString("id-ID")}`}
                              </span>
                            );
                          })}
                          {product.unitList && product.unitList.length > 2 && (
                            <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[0.65rem] font-bold bg-black/[0.03] text-black/40">
                              +{product.unitList.length - 2} more
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <Link
                          href={`/product/${product.productId || product.id}`}
                          className="mt-auto pt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(0,105,65,0.28)] active:translate-y-0"
                        >
                          View Details
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 bg-white/65">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">Tokyo GO</p>
            <p className="mt-3 text-sm text-on-surface/55">&copy; 2024 Tokyo GO. Precision Freshness.</p>
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

/* ─── Page Export with Suspense Boundary ── */
export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        </main>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
