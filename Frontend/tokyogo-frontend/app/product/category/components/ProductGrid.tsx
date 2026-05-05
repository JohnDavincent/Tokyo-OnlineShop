"use client";

import { ApiProduct } from "../../../../types/api";
import { PackageIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: ApiProduct[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

export function ProductGrid({
  products,
  loading,
  totalItems,
  currentPage,
  totalPages,
  sortBy,
  setSortBy,
  onClearFilters,
  onPageChange,
}: ProductGridProps) {
  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-black/50 hidden sm:block">
          Showing <span className="font-bold text-[#101210]">{products.length}</span> of <span className="font-bold text-[#101210]">{totalItems}</span> products
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

      {/* Grid */}
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
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-black/[0.03] rounded-full flex items-center justify-center mb-5">
            <PackageIcon className="h-8 w-8 text-black/20" />
          </div>
          <h3 className="font-headline text-xl font-bold text-[#101210]">No products found</h3>
          <p className="mt-2 text-sm text-black/50 max-w-xs">
            Try adjusting your search, category, or subcategory filter to find what you are looking for.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.productId || product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-black/[0.06] text-black/60 hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${page === currentPage
                    ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,105,65,0.25)]"
                    : "bg-white border border-black/[0.06] text-black/60 hover:text-primary hover:border-primary/30"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-black/[0.06] text-black/60 hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
