"use client";

import { ApiCategory, ApiSubCategory } from "../../../../types/api";
import { FilterIcon } from "./Icons";

interface MobileFilterProps {
  categories: ApiCategory[];
  subCategories: ApiSubCategory[];
  activeCategoryId: string;
  activeSubCategoryId: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCategory: (id: string) => void;
  setSubCategory: (id: string) => void;
  mobileFilterOpen: boolean;
  setMobileFilterOpen: (v: boolean) => void;
}

export function MobileFilter({
  categories,
  subCategories,
  activeCategoryId,
  activeSubCategoryId,
  searchQuery,
  setSearchQuery,
  setCategory,
  setSubCategory,
  mobileFilterOpen,
  setMobileFilterOpen,
}: MobileFilterProps) {
  return (
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

          {/* Categories */}
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/40 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${!activeCategoryId ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"}`}
              >
                All
              </button>
              {categories.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${isActive ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"}`}
                  >
                    {cat.categoryName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategories */}
          {subCategories.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/40 mb-2">Subcategories</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSubCategory("")}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${!activeSubCategoryId ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"}`}
                >
                  All
                </button>
                {subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubCategory(sub.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${activeSubCategoryId === sub.id ? "bg-primary text-white" : "bg-[#f6f8f5] text-black/60 border border-black/[0.06]"}`}
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
  );
}
