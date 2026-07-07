"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ApiBrand,
  ProductMetadataPayload,
  ProductUnitPayload,
  createProduct,
  getAdminCategories,
  getAdminSubCategories,
  getBrandList,
  updateProduct,
} from "../../../../../services/adminProductService";
import { ApiCategory, ApiSubCategory } from "../../../../../types/api";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "../../../components/ui";

export interface ProductFormInitialValues {
  name: string;
  sku: string;
  stock: string;
  baseWeight: string;
  brandName: string;
  categoryName: string;
  subCategory: string;
  description: string;
  units: ProductUnitPayload[];
  existingImageUrls: string[];
}

interface UnitRow {
  unit: string;
  convertQuantity: string;
  basePrice: string;
  sellPrice: string;
}

const EMPTY_UNIT: UnitRow = { unit: "", convertQuantity: "", basePrice: "", sellPrice: "" };

export default function ProductForm({
  mode,
  productId,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductFormInitialValues;
}) {
  const router = useRouter();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [stock, setStock] = useState(initialValues?.stock ?? "");
  const [baseWeight, setBaseWeight] = useState(initialValues?.baseWeight ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState(initialValues?.subCategory ?? "");
  const [units, setUnits] = useState<UnitRow[]>(
    initialValues?.units.length
      ? initialValues.units.map((u) => ({
          unit: u.unit,
          convertQuantity: String(u.convertQuantity ?? ""),
          basePrice: u.basePrice ? Number(u.basePrice).toLocaleString("id-ID") : "",
          sellPrice: u.sellPrice ? Number(u.sellPrice).toLocaleString("id-ID") : "",
        }))
      : [{ ...EMPTY_UNIT }],
  );
  const [images, setImages] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ApiSubCategory[]>([]);

  useEffect(() => {
    getBrandList()
      .then((list) => {
        console.log("[ProductForm] loaded brands:", list);
        console.log("[ProductForm] initial brandName:", initialValues?.brandName);
        setBrands(list);
        if (initialValues?.brandName) {
          const match = list.find((b) => b.name.toLowerCase() === initialValues.brandName.toLowerCase());
          console.log("[ProductForm] matched brand:", match);
          if (match) setBrandId(match.id);
        }
      })
      .catch((err) => {
        console.error("[ProductForm] failed to load brands:", err);
        toast.error("Failed to load brands");
      });

    getAdminCategories()
      .then(async (list) => {
        console.log("[ProductForm] loaded categories:", list);
        console.log("[ProductForm] initial categoryName:", initialValues?.categoryName);
        setCategories(list);
        if (initialValues?.categoryName) {
          // 1. Try direct match
          let match = list.find((c) => c.categoryName.toLowerCase() === initialValues.categoryName.toLowerCase());
          console.log("[ProductForm] direct category match:", match);

          // 2. Fallback: search subcategories of each category to find the parent category
          if (!match) {
            console.log("[ProductForm] searching subcategories for parent category...");
            for (const cat of list) {
              try {
                const subs = await getAdminSubCategories(cat.id);
                const hasSub = subs.some(
                  (sub) =>
                    sub.subCategory.toLowerCase() === initialValues.categoryName.toLowerCase() ||
                    sub.subCategory.toLowerCase() === (initialValues.subCategory || "").toLowerCase()
                );
                if (hasSub) {
                  match = cat;
                  console.log("[ProductForm] found parent category via subcategory lookup:", cat);
                  break;
                }
              } catch (e) {
                // Ignore subcategory load errors for individual categories
              }
            }
          }

          if (match) {
            setCategoryId(match.id);
          }
        }
      })
      .catch((err) => {
        console.error("[ProductForm] failed to load categories:", err);
        toast.error("Failed to load categories");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    getAdminSubCategories(categoryId).then(setSubCategories).catch(() => setSubCategories([]));
  }, [categoryId]);

  const imagePreviews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  function handleImagesChange(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    setImages(files);
    setAltTexts(files.map((f) => f.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]/g, " ")));
  }

  function updateUnit(index: number, field: keyof UnitRow, value: string) {
    setUnits((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (name.trim().length < 3) return void toast.error("Name must be at least 3 characters");
    if (sku.trim().length < 3) return void toast.error("SKU must be at least 3 characters");

    const parsedUnits: ProductUnitPayload[] = [];
    for (const row of units) {
      if (!row.unit.trim()) return void toast.error("Every unit row needs a unit name");
      const convertQuantity = Number(row.convertQuantity);
      const basePrice = Number(row.basePrice.replace(/\D/g, ""));
      const sellPrice = Number(row.sellPrice.replace(/\D/g, ""));
      if (!convertQuantity || convertQuantity <= 0) return void toast.error(`Convert quantity for "${row.unit}" must be positive`);
      if (!basePrice || basePrice <= 0) return void toast.error(`Base price for "${row.unit}" must be positive`);
      if (!sellPrice || sellPrice <= 0) return void toast.error(`Sell price for "${row.unit}" must be positive`);
      parsedUnits.push({ unit: row.unit.trim(), convertQuantity, basePrice, sellPrice });
    }
    if (parsedUnits.length === 0) return void toast.error("Add at least one unit");

    if (mode === "create" && images.length === 0) {
      toast.error("Add at least one product image");
      return;
    }

    const metadata: ProductMetadataPayload = {
      name: name.trim(),
      sku: sku.trim(),
      stock: stock ? Number(stock) : null,
      baseWeight: baseWeight ? Number(baseWeight) : null,
      brand: brandId || null,
      category: categoryId || null,
      subCategory: subCategory.trim() || null,
      description: description.trim(),
      unitList: parsedUnits,
      altTexts: images.length > 0 ? altTexts : [],
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createProduct(metadata, images);
        toast.success("Product created");
      } else {
        await updateProduct(productId ?? "", metadata, images);
        toast.success("Product updated");
      }
      router.push("/admin/products");
    } catch (error) {
      if (error instanceof Error && error.message === "ADMIN_AUTH_REQUIRED") {
        toast.error("Session expired. Redirecting to admin login...");
        setTimeout(() => {
          router.replace("/admin/login");
        }, 1500);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to save product");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Basic info */}
        <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-card)] xl:col-span-2">
          <h2 className="mb-5 font-headline text-base font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">
            Basic information
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="p-name" className={labelClass}>Product name *</label>
              <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Beras Jiva" />
            </div>
            <div>
              <label htmlFor="p-sku" className={labelClass}>SKU *</label>
              <input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} placeholder="SBA-001" />
            </div>
            <div>
              <label htmlFor="p-stock" className={labelClass}>Stock</label>
              <input id="p-stock" type="number" min={1} value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} placeholder="100" />
            </div>
            <div>
              <label htmlFor="p-weight" className={labelClass}>Base weight (g)</label>
              <input id="p-weight" type="number" min={1} value={baseWeight} onChange={(e) => setBaseWeight(e.target.value)} className={inputClass} placeholder="500" />
            </div>
            <div>
              <label htmlFor="p-brand" className={labelClass}>Brand</label>
              <select id="p-brand" value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
                <option value="">No brand</option>
                {brands.map((brand) => brand && (
                  <option key={brand.id || brand.name} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-category" className={labelClass}>Category</label>
              <select id="p-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-subcategory" className={labelClass}>Sub-category</label>
              <input
                id="p-subcategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className={inputClass}
                placeholder="Snack"
                list="subcategory-options"
              />
              <datalist id="subcategory-options">
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.subCategory} />
                ))}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-description" className={labelClass}>Description</label>
              <textarea
                id="p-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`${inputClass} resize-y`}
                placeholder="Describe the product…"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-card)]">
          <h2 className="mb-5 font-headline text-base font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">
            Images
          </h2>

          {mode === "edit" && initialValues?.existingImageUrls?.length ? (
            <div className="mb-4">
              <p className={labelClass}>Current images</p>
              <div className="flex flex-wrap gap-2">
                {initialValues.existingImageUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="Current product"
                    className="h-16 w-16 rounded-lg border border-[var(--admin-border)] object-cover"
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--admin-muted)]">
                Uploading new files replaces all current images; leave empty to keep them.
              </p>
            </div>
          ) : null}

          <label
            htmlFor="p-images"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--admin-border)] px-4 py-8 text-center transition-colors hover:border-[var(--admin-primary)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-[var(--admin-muted)]">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-semibold text-[var(--admin-heading)]">Click to choose images</span>
            <span className="text-xs text-[var(--admin-muted)]">PNG / JPG, first image becomes primary</span>
          </label>
          <input
            id="p-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImagesChange(e.target.files)}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {images.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreviews[index]} alt={file.name} className="h-12 w-12 rounded-lg border border-[var(--admin-border)] object-cover" />
                  <input
                    value={altTexts[index] ?? ""}
                    onChange={(e) =>
                      setAltTexts((prev) => prev.map((alt, i) => (i === index ? e.target.value : alt)))
                    }
                    placeholder="Alt text"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Units */}
      <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-card)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-base font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">
            Selling units
          </h2>
          <button
            type="button"
            onClick={() => setUnits((prev) => [...prev, { ...EMPTY_UNIT }])}
            className={secondaryButtonClass}
          >
            Add unit
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {units.map((row, index) => (
            <div key={index} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-[var(--admin-border)] p-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <div>
                <label className={labelClass}>Unit *</label>
                <input value={row.unit} onChange={(e) => updateUnit(index, "unit", e.target.value)} className={inputClass} placeholder="pcs / pack / box" />
              </div>
              <div>
                <label className={labelClass}>Convert qty *</label>
                <input type="number" min={1} value={row.convertQuantity} onChange={(e) => updateUnit(index, "convertQuantity", e.target.value)} className={inputClass} placeholder="1" />
              </div>
              <div>
                <label className={labelClass}>Base price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--admin-muted)]">Rp</span>
                  <input
                    type="text"
                    value={row.basePrice}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      updateUnit(index, "basePrice", digits ? Number(digits).toLocaleString("id-ID") : "");
                    }}
                    className={`${inputClass} pl-9`}
                    placeholder="60.000"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Sell price *</label>
                  {row.basePrice && row.sellPrice && (
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.05em]">
                      {(() => {
                        const bp = Number(row.basePrice.replace(/\D/g, ""));
                        const sp = Number(row.sellPrice.replace(/\D/g, ""));
                        if (bp > 0) {
                          const pct = ((sp - bp) / bp) * 100;
                          const isProfit = pct >= 0;
                          return (
                            <span className={isProfit ? "text-[var(--admin-primary)]" : "text-[var(--admin-danger)]"}>
                              {isProfit ? "+" : ""}{pct.toFixed(2)}% margin
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--admin-muted)]">Rp</span>
                  <input
                    type="text"
                    value={row.sellPrice}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      updateUnit(index, "sellPrice", digits ? Number(digits).toLocaleString("id-ID") : "");
                    }}
                    className={`${inputClass} pl-9`}
                    placeholder="80.000"
                  />
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove unit"
                onClick={() => setUnits((prev) => prev.filter((_, i) => i !== index))}
                disabled={units.length === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--admin-danger)] transition-colors hover:bg-[var(--admin-danger-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/admin/products" className={secondaryButtonClass}>
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
