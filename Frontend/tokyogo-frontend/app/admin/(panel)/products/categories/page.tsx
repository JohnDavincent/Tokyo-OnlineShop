"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ApiBrand,
  createBrand,
  createCategory,
  getAdminCategories,
  getAdminSubCategories,
  getBrandList,
  uploadCategoryImage,
} from "../../../../../services/adminProductService";
import { ApiCategory, ApiSubCategory } from "../../../../../types/api";
import {
  EmptyState,
  LoadingState,
  SectionCard,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../components/ui";

function resolveCategoryImage(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/image/category/${filename}`;
}

function CategoryRow({
  category,
  onImageUploaded,
}: {
  category: ApiCategory;
  onImageUploaded: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [subCategories, setSubCategories] = useState<ApiSubCategory[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next && subCategories === null) {
      try {
        setSubCategories(await getAdminSubCategories(category.id));
      } catch {
        setSubCategories([]);
      }
    }
  }

  async function handleImageChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadCategoryImage(category.id, file);
      toast.success(`Image uploaded for ${category.categoryName}`);
      onImageUploaded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const image = resolveCategoryImage(category.imageUrl);

  return (
    <li className="rounded-xl border border-[var(--admin-border)]">
      <div className="flex items-center gap-3 p-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={category.altText ?? category.categoryName} className="h-11 w-11 rounded-lg border border-[var(--admin-border)] object-cover" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--admin-surface-2)] text-[0.6rem] font-bold uppercase text-[var(--admin-muted)]">
            No img
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--admin-heading)]">{category.categoryName}</p>
          <button onClick={toggleExpanded} className="text-xs font-semibold text-[var(--admin-primary)] hover:underline">
            {expanded ? "Hide sub-categories" : "Show sub-categories"}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e.target.files)} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={secondaryButtonClass}
        >
          {uploading ? "Uploading…" : image ? "Replace image" : "Add image"}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[var(--admin-border)] px-3 py-2.5">
          {subCategories === null ? (
            <p className="text-xs text-[var(--admin-muted)]">Loading…</p>
          ) : subCategories.length === 0 ? (
            <p className="text-xs text-[var(--admin-muted)]">No sub-categories yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subCategories.map((sub) => (
                <span key={sub.id} className="rounded-full bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-heading)]">
                  {sub.subCategory}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [newBrandName, setNewBrandName] = useState("");
  const [creatingBrand, setCreatingBrand] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [cats, brandList] = await Promise.all([getAdminCategories(), getBrandList()]);
      setCategories(cats);
      setBrands(brandList);
    } catch {
      toast.error("Failed to load categories or brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setCreatingCategory(true);
    try {
      await createCategory(newCategoryName.trim(), newCategoryParent || null);
      toast.success(newCategoryParent ? "Sub-category created" : "Category created");
      setNewCategoryName("");
      setNewCategoryParent("");
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (newBrandName.trim().length < 2) {
      toast.error("Brand name must be at least 2 characters");
      return;
    }
    setCreatingBrand(true);
    try {
      await createBrand(newBrandName.trim());
      toast.success("Brand created");
      setNewBrandName("");
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create brand");
    } finally {
      setCreatingBrand(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
            Categories & brands
          </h1>
          <p className="text-sm text-[var(--admin-muted)]">Organize how products are grouped on the storefront.</p>
        </div>
        <Link href="/admin/products" className={secondaryButtonClass}>
          Back to products
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Categories" subtitle="Top-level and sub-categories" className="xl:col-span-2">
          <form onSubmit={handleCreateCategory} className="mb-6 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label htmlFor="cat-name" className={labelClass}>Name</label>
              <input id="cat-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className={inputClass} placeholder="e.g. Frozen Food" />
            </div>
            <div>
              <label htmlFor="cat-parent" className={labelClass}>Parent (optional)</label>
              <select id="cat-parent" value={newCategoryParent} onChange={(e) => setNewCategoryParent(e.target.value)} className={inputClass}>
                <option value="">None — top-level category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={creatingCategory} className={primaryButtonClass}>
              {creatingCategory ? "Creating…" : "Create"}
            </button>
          </form>

          {loading ? (
            <LoadingState label="Loading categories…" />
          ) : categories.length === 0 ? (
            <EmptyState title="No categories yet" hint="Create the first category above." />
          ) : (
            <ul className="flex flex-col gap-3">
              {categories.map((category) => (
                <CategoryRow key={category.id} category={category} onImageUploaded={loadAll} />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Brands" subtitle="Product manufacturers">
          <form onSubmit={handleCreateBrand} className="mb-6 flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="brand-name" className={labelClass}>Name</label>
              <input id="brand-name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className={inputClass} placeholder="e.g. Indofood" />
            </div>
            <button type="submit" disabled={creatingBrand} className={primaryButtonClass}>
              {creatingBrand ? "…" : "Add"}
            </button>
          </form>

          {loading ? (
            <LoadingState label="Loading brands…" />
          ) : brands.length === 0 ? (
            <EmptyState title="No brands yet" />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {brands.map((brand) => brand && (
                <li key={brand.id || brand.name} className="rounded-full bg-[var(--admin-surface-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--admin-heading)]">
                  {brand.name}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
