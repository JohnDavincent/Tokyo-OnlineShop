"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getProductDetail, getProducts } from "../../../../../../services/productService";
import { createFlashSale, endFlashSale } from "../../../../../../services/adminProductService";
import { ApiProductDetail, ApiProduct } from "../../../../../../types/api";
import {
  EmptyState,
  LoadingState,
  SectionCard,
  StatusBadge,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../../components/ui";
import { formatRupiah } from "../../../../lib/format";

function resolveProductImage(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

type DiscountMode = "percent" | "amount";

interface UnitFormRow {
  unit: string;
  sellPrice: number;
  enabled: boolean;
  mode: DiscountMode;
  value: string; // percent (0-100) or absolute discount price
  existingDiscountPrice?: number | null;
  existingFlashSaleUntil?: string | null;
}

function computeFinalPrice(row: UnitFormRow): number | null {
  const v = Number(row.value);
  if (!v || v <= 0) return null;
  if (row.mode === "percent") {
    if (v >= 100) return null;
    return Math.round(row.sellPrice * (1 - v / 100));
  }
  return v; // absolute discounted price
}

export default function FlashSalePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [detail, setDetail] = useState<ApiProductDetail | null>(null);
  const [listUnits, setListUnits] = useState<ApiProduct["unitList"]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [until, setUntil] = useState("");
  const [rows, setRows] = useState<UnitFormRow[]>([]);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      // Detail gives brand/category/description; list gives the live sellPrice
      // + discountPrice per unit which we need for the form defaults.
      const [d, allProducts] = await Promise.all([getProductDetail(productId), getProducts()]);
      const listMatch = allProducts.find((p) => p.productId === productId);

      setDetail(d);
      setListUnits(listMatch?.unitList ?? []);

      const initialRows: UnitFormRow[] = (listMatch?.unitList ?? []).map((u) => {
        const onSale = u.discountPrice != null && u.discountPrice > 0;
        return {
          unit: u.unit,
          sellPrice: u.sellPrice,
          enabled: onSale,
          mode: "percent",
          value: onSale ? String(Math.round(((u.sellPrice - u.discountPrice!) / u.sellPrice) * 100)) : "",
          existingDiscountPrice: u.discountPrice,
        };
      });
      setRows(initialRows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const anyExistingFlashSale = useMemo(
    () => listUnits.some((u) => u.discountPrice != null && u.discountPrice > 0),
    [listUnits],
  );

  function updateRow(index: number, patch: Partial<UnitFormRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit() {
    const selected = rows.filter((r) => r.enabled);
    if (!until) return void toast.error("Set the flash sale end date & time");
    if (selected.length === 0) return void toast.error("Enable at least one unit");

    const payload: Array<{ unit: string; discountPrice: number }> = [];
    for (const row of selected) {
      const final = computeFinalPrice(row);
      if (final == null || final <= 0) {
        return void toast.error(`Enter a valid ${row.mode === "percent" ? "percentage" : "discount price"} for ${row.unit}`);
      }
      if (final >= row.sellPrice) {
        return void toast.error(`Discount for ${row.unit} must be below ${formatRupiah(row.sellPrice)}`);
      }
      payload.push({ unit: row.unit, discountPrice: final });
    }

    setSubmitting(true);
    try {
      await createFlashSale(productId, `${until}:00`, payload);
      toast.success("Flash sale started");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start flash sale");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnd() {
    setEnding(true);
    try {
      await endFlashSale(productId);
      toast.success("Flash sale ended");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to end flash sale");
    } finally {
      setEnding(false);
    }
  }

  if (loading) return <LoadingState label="Loading product…" />;
  if (!detail) return <EmptyState title="Product not found" hint="It may have been removed, or the ID is invalid." />;

  const image = resolveProductImage(detail.imageList?.[0]?.url);
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            aria-label="Back to products"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--admin-accent)]">Flash sale</p>
            <h1 className="font-headline text-xl font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
              {detail.name}
            </h1>
          </div>
        </div>
        {anyExistingFlashSale && (
          <button onClick={handleEnd} disabled={ending} className={dangerButtonClass}>
            {ending ? "Ending…" : "End current flash sale"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        {/* Left: product summary */}
        <SectionCard title="Product">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={detail.name}
              className="mb-4 aspect-square w-full rounded-2xl border border-[var(--admin-border)] object-cover"
            />
          ) : (
            <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-2xl bg-[var(--admin-surface-2)] text-xs text-[var(--admin-muted)]">
              No image
            </div>
          )}
          <p className="font-headline text-base font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">
            {detail.name}
          </p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            {[detail.brand, detail.category].filter(Boolean).join(" · ") || "—"}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[var(--admin-text)]">{detail.description || "No description."}</p>
          {anyExistingFlashSale && (
            <div className="mt-4 rounded-xl bg-[var(--admin-accent-soft)] p-3">
              <div className="flex items-center gap-2">
                <StatusBadge status="FLASH_SALE" />
                <p className="text-xs font-semibold text-[var(--admin-accent)]">Currently on flash sale</p>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--admin-muted)]">
                Toggling units below and pressing “Start flash sale” will overwrite the current configuration.
              </p>
            </div>
          )}
        </SectionCard>

        {/* Right: form */}
        <div className="flex flex-col gap-6">
          <SectionCard title="1. When does the sale end?" subtitle="The discount reverts automatically after this time.">
            <div className="max-w-md">
              <label htmlFor="until" className={labelClass}>
                End date & time
              </label>
              <input
                id="until"
                type="datetime-local"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                className={`${inputClass} py-3`}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="2. Choose the discount for each unit"
            subtitle={`${enabledCount} of ${rows.length} unit${rows.length === 1 ? "" : "s"} on sale`}
          >
            <div className="flex flex-col gap-3">
              {rows.map((row, index) => {
                const finalPrice = row.enabled ? computeFinalPrice(row) : null;
                const savings = finalPrice != null ? row.sellPrice - finalPrice : 0;
                const savingsPct = finalPrice != null ? Math.round((savings / row.sellPrice) * 100) : 0;
                const invalid = row.enabled && (finalPrice == null || finalPrice >= row.sellPrice);

                return (
                  <div
                    key={row.unit}
                    className={`rounded-2xl border p-4 transition-colors ${
                      row.enabled
                        ? invalid
                          ? "border-[var(--admin-danger)] bg-[var(--admin-danger-soft)]/30"
                          : "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]"
                        : "border-[var(--admin-border)]"
                    }`}
                  >
                    {/* Top row: toggle + unit + original price */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => updateRow(index, { enabled: e.target.checked })}
                          className="h-4 w-4 accent-[var(--admin-primary)]"
                        />
                        <span className="font-bold uppercase tracking-[0.08em] text-[var(--admin-heading)]">
                          {row.unit}
                        </span>
                      </label>
                      <span className="text-xs text-[var(--admin-muted)]">
                        Sell price <span className="font-semibold text-[var(--admin-heading)]">{formatRupiah(row.sellPrice)}</span>
                      </span>
                    </div>

                    {row.enabled && (
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr_auto] md:items-end">
                        {/* Percent / amount mode toggle */}
                        <div>
                          <p className={labelClass}>Discount by</p>
                          <div className="inline-flex overflow-hidden rounded-xl border border-[var(--admin-border)]">
                            <button
                              type="button"
                              onClick={() => updateRow(index, { mode: "percent", value: "" })}
                              className={`px-3 py-2 text-xs font-bold transition-colors ${
                                row.mode === "percent"
                                  ? "bg-[var(--admin-primary)] text-[var(--admin-on-primary)]"
                                  : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface-2)]"
                              }`}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRow(index, { mode: "amount", value: "" })}
                              className={`px-3 py-2 text-xs font-bold transition-colors ${
                                row.mode === "amount"
                                  ? "bg-[var(--admin-primary)] text-[var(--admin-on-primary)]"
                                  : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface-2)]"
                              }`}
                            >
                              Rp
                            </button>
                          </div>
                        </div>

                        {/* Value input */}
                        <div>
                          <label htmlFor={`v-${index}`} className={labelClass}>
                            {row.mode === "percent" ? "Discount percentage" : "Sale price (Rp)"}
                          </label>
                          <input
                            id={`v-${index}`}
                            type="number"
                            min={1}
                            max={row.mode === "percent" ? 99 : undefined}
                            step={row.mode === "percent" ? 1 : 500}
                            placeholder={row.mode === "percent" ? "e.g. 20" : "e.g. 60000"}
                            value={row.value}
                            onChange={(e) => updateRow(index, { value: e.target.value })}
                            className={inputClass}
                          />
                        </div>

                        {/* Live preview */}
                        <div className="rounded-xl bg-[var(--admin-surface)] px-4 py-3 min-w-[160px]">
                          <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                            Buyer sees
                          </p>
                          {finalPrice != null ? (
                            <>
                              <p className="mt-1 text-xs text-[var(--admin-muted)] line-through">
                                {formatRupiah(row.sellPrice)}
                              </p>
                              <p className="font-headline text-lg font-extrabold tracking-[-0.02em] text-[var(--admin-primary)]">
                                {formatRupiah(finalPrice)}
                              </p>
                              <p className="text-[11px] font-bold text-[var(--admin-accent)]">
                                Save {formatRupiah(savings)} · −{savingsPct}%
                              </p>
                            </>
                          ) : (
                            <p className="mt-1 text-xs text-[var(--admin-muted)]">Enter a value…</p>
                          )}
                        </div>
                      </div>
                    )}

                    {invalid && (
                      <p className="mt-3 text-xs font-semibold text-[var(--admin-danger)]">
                        Discount must be greater than 0 and lower than the sell price.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/products" className={secondaryButtonClass}>
              Cancel
            </Link>
            <button onClick={handleSubmit} disabled={submitting} className={primaryButtonClass}>
              {submitting ? "Starting…" : anyExistingFlashSale ? "Update flash sale" : "Start flash sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
