"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getProductList } from "../../../../services/productService";
import { getAdminCategories, markProductAsNew } from "../../../../services/adminProductService";
import { ApiCategory, ApiProduct } from "../../../../types/api";
import {
  EmptyState,
  KebabMenu,
  LoadingState,
  MockBadge,
  Modal,
  StatusBadge,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  tdClass,
  thClass,
} from "../../components/ui";

const PAGE_SIZE = 10;

function resolveProductImage(url?: string) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

/* --- Unit price breakdown -------------------------------------
 * Buyer-parity view: every unit's price + how many base units it
 * contains, so the seller can answer "how much per pcs?" without
 * opening the detail page.
 */

function UnitPriceBreakdown({ units }: { units: ApiProduct["unitList"] }) {
  if (!units?.length) return <span className="text-[var(--admin-muted)]">—</span>;

  const sorted = [...units].sort((a, b) => (a.convertQuantity ?? 1) - (b.convertQuantity ?? 1));
  const baseUnit = sorted[0];
  const baseName = baseUnit.unit;

  return (
    <div className="min-w-[320px] overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)]/40">
      <div className="grid grid-cols-[minmax(64px,0.9fr)_minmax(100px,1.3fr)_minmax(90px,1fr)_minmax(90px,1fr)] gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
        <span>Unit</span>
        <span>Sell price</span>
        <span>Contains</span>
        <span>Per {baseName}</span>
      </div>

      <div className="divide-y divide-[var(--admin-border)]">
        {sorted.map((unit) => {
          const onSale = unit.discountPrice != null && unit.discountPrice > 0;
          const effectivePrice = onSale ? unit.discountPrice! : unit.sellPrice;
          const qty = unit.convertQuantity ?? 1;
          const isBase = unit === baseUnit;
          const perBase = qty > 0 ? effectivePrice / qty : effectivePrice;

          return (
            <div
              key={unit.unit}
              className={`grid grid-cols-[minmax(64px,0.9fr)_minmax(100px,1.3fr)_minmax(90px,1fr)_minmax(90px,1fr)] items-center gap-2 px-3 py-2 text-xs ${
                onSale ? "bg-[var(--admin-accent-soft)]" : ""
              }`}
            >
              <span className="font-bold uppercase tracking-[0.06em] text-[var(--admin-heading)]">{unit.unit}</span>

              <span className="flex flex-col leading-tight">
                {onSale && (
                  <span className="text-[10px] text-[var(--admin-muted)] line-through">
                    Rp {unit.sellPrice.toLocaleString("id-ID")}
                  </span>
                )}
                <span className={`font-semibold ${onSale ? "text-[var(--admin-accent)]" : "text-[var(--admin-heading)]"}`}>
                  Rp {effectivePrice.toLocaleString("id-ID")}
                </span>
              </span>

              <span className="text-[var(--admin-muted)]">
                {isBase ? "base unit" : `${qty.toLocaleString("id-ID")} ${baseName}`}
              </span>

              <span className="text-[var(--admin-muted)]">
                {isBase ? "—" : `Rp ${Math.round(perBase).toLocaleString("id-ID")}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- Icons for the kebab menu --------------------------------- */

const Icons = {
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  flashSale: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  ),
  markNew: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" strokeLinejoin="round" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  ),
};

/* --- Page ------------------------------------------------------ */

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async (currentPage: number, searchTerm: string, categoryId: string) => {
    setLoading(true);
    try {
      // Backend's product /list is 0-based (unlike transaction /list).
      const result = await getProductList({
        currentPage: currentPage - 1,
        pageSize: PAGE_SIZE,
        sortBy: "name",
        sortOrder: "asc",
        requestDto: {
          categoryParentId: categoryId || null,
          subCategoryId: null,
          search: searchTerm.trim() || null,
        },
      });
      setProducts(result.items);
      setTotalPages(result.total_pages);
      setTotalItems(result.total_items);
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(page, search, categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter]);

  useEffect(() => {
    getAdminCategories().then(setCategories).catch(() => {});
  }, []);

  // Cashier-friendly keyboard shortcut: "/" focuses the search bar
  // instantly, so an admin can look up a product mid-transaction.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      loadProducts(1, value, categoryFilter);
    }, 400);
  }

  function refresh() {
    loadProducts(page, search, categoryFilter);
  }

  async function handleMarkNew(product: ApiProduct) {
    try {
      await markProductAsNew(product.productId ?? "");
      toast.success(`${product.productName} marked as NEW for 1 week`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark as new");
    }
  }

  const hasFlashSale = (p: ApiProduct) =>
    p.status === "FLASH_SALE" || p.unitList?.some((u) => u.discountPrice != null && u.discountPrice > 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero search — the page's most important control for the counter-lookup use case. */}
      <div className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-[var(--admin-shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]">
              {Icons.search}
            </span>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search product name, e.g. beras, indomie…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] py-3.5 pl-12 pr-24 text-base font-medium text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-muted)]/60 focus:border-[var(--admin-primary)]"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 font-mono text-[0.65rem] font-bold text-[var(--admin-muted)] md:inline-block">
              /
            </kbd>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} w-full py-3.5 md:w-52`}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <Link href="/admin/products/categories" className={`${secondaryButtonClass} py-3.5`}>
            Categories & brands
          </Link>
          <Link href="/admin/products/new" className={`${primaryButtonClass} py-3.5`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add product
          </Link>
        </div>

        {!loading && (
          <p className="mt-3 text-xs text-[var(--admin-muted)]">
            {search.trim()
              ? `${totalItems.toLocaleString("id-ID")} result${totalItems === 1 ? "" : "s"} for “${search.trim()}”`
              : `${totalItems.toLocaleString("id-ID")} products in catalog`}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
        {loading ? (
          <LoadingState label="Loading products…" />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" hint="Try a different search or category filter." />
        ) : (
          <table className="w-full">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
              <tr>
                <th className={thClass}>Product</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Pricing</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {products.map((product) => {
                const image = resolveProductImage(product.url);
                const productHasFlashSale = hasFlashSale(product);

                return (
                  <tr key={product.productId} className="transition-colors hover:bg-[var(--admin-surface-2)]/50">
                    <td className={`${tdClass} align-top`}>
                      <div className="flex items-center gap-4">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt={product.altText || product.productName}
                            className="h-16 w-16 rounded-xl border border-[var(--admin-border)] object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--admin-surface-2)] text-xs text-[var(--admin-muted)]">
                            —
                          </div>
                        )}
                        <span className="font-extrabold text-base tracking-tight text-[var(--admin-heading)]">{product.productName}</span>
                      </div>
                    </td>
                    <td className={`${tdClass} align-top`}>{product.category || "—"}</td>
                    <td className={`${tdClass} align-top`}>
                      <UnitPriceBreakdown units={product.unitList} />
                    </td>
                    <td className={`${tdClass} align-top`}>
                      <StatusBadge status={product.status} />
                    </td>
                    <td className={`${tdClass} align-top`}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.productId}/edit`}
                          className={`${secondaryButtonClass} !py-2 !px-3.5 text-xs`}
                        >
                          {Icons.edit}
                          Edit
                        </Link>
                        <KebabMenu
                          items={[
                            {
                              label: productHasFlashSale ? "Manage flash sale" : "Start flash sale",
                              icon: Icons.flashSale,
                              onClick: () => router.push(`/admin/products/${product.productId}/flash-sale`),
                            },
                            {
                              label: "Mark as NEW (1 week)",
                              icon: Icons.markNew,
                              onClick: () => handleMarkNew(product),
                            },
                            {
                              label: "Delete product",
                              icon: Icons.delete,
                              onClick: () => setDeleteTarget(product),
                              danger: true,
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--admin-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={secondaryButtonClass}>
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={secondaryButtonClass}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete modal — backend has no DELETE endpoint yet */}
      {deleteTarget && (
        <Modal open onClose={() => setDeleteTarget(null)} title="Delete product">
          <div className="mb-4">
            <MockBadge label="Backend pending — delete endpoint not available" />
          </div>
          <p className="text-sm text-[var(--admin-text)]">
            You are about to delete <strong>{deleteTarget.productName}</strong>. The backend does not expose a delete
            endpoint yet, so this action cannot be completed from the admin panel.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className={secondaryButtonClass}>
              Cancel
            </button>
            <button
              className={dangerButtonClass}
              onClick={() => {
                // TODO: connect to backend — call DELETE /tokyo/gropup/ad-min/product/{id} once it exists
                toast.error("Delete is not supported by the backend yet");
                setDeleteTarget(null);
              }}
            >
              Delete anyway
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
