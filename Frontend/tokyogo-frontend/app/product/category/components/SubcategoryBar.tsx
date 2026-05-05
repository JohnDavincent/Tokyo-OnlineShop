"use client";

import { ApiSubCategory } from "../../../../types/api";
import { TagIcon } from "./Icons";

interface SubcategoryBarProps {
  subCategories: ApiSubCategory[];
  activeSubCategoryId: string;
  setSubCategory: (id: string) => void;
}

export function SubcategoryBar({ subCategories, activeSubCategoryId, setSubCategory }: SubcategoryBarProps) {
  if (subCategories.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSubCategory("")}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${!activeSubCategoryId
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
            onClick={() => setSubCategory(sub.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${activeSubCategoryId === sub.id
              ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,105,65,0.25)]"
              : "bg-white text-black/60 border border-black/[0.06] hover:border-primary/30 hover:text-primary"
              }`}
          >
            {sub.subCategory}
          </button>
        ))}
      </div>
    </div>
  );
}
