"use client";

import { RefObject } from "react";
import { ApiCategory } from "../../../../types/api";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  FilterIcon,
  PackageIcon,
} from "./Icons";
import { resolveCategoryImage } from "../lib/helpers";

interface SidebarProps {
  categories: ApiCategory[];
  activeCategoryId: string;
  activeCategoryObj?: ApiCategory;
  activeCategoryName: string;
  totalItems: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCategory: (id: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  sidebarHovered: boolean;
  setSidebarHovered: (v: boolean) => void;
  sidebarExpanded: boolean;
  activeCategoryBtnRef: RefObject<HTMLButtonElement | null>;
}

export function Sidebar({
  categories,
  activeCategoryId,
  activeCategoryObj,
  activeCategoryName,
  totalItems,
  searchQuery,
  setSearchQuery,
  setCategory,
  sidebarCollapsed,
  setSidebarCollapsed,
  sidebarHovered,
  setSidebarHovered,
  sidebarExpanded,
  activeCategoryBtnRef,
}: SidebarProps) {
  return (
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
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
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
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/40 mb-2.5">Now Browsing</div>
              {activeCategoryId ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-2 ring-primary/15">
                    <img
                      src={activeCategoryObj ? resolveCategoryImage(activeCategoryObj.imageUrl) : resolveCategoryImage()}
                      alt={activeCategoryName}
                      className="relative z-10 h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#f0fdf4]">
                      <PackageIcon className="h-6 w-6 text-primary" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline text-[1.05rem] font-bold text-[#101210] truncate">{activeCategoryName}</div>
                    <div className="mt-0.5 text-xs font-bold text-primary">
                      {totalItems} product{totalItems !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0fdf4]">
                    <GridIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-headline text-[1.05rem] font-bold text-[#101210]">All Products</div>
                    <div className="mt-0.5 text-xs font-bold text-primary">
                      {totalItems} product{totalItems !== 1 ? "s" : ""}
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
            style={{ opacity: sidebarExpanded ? 1 : 0, transition: "opacity 0.3s cubic-bezier(0.4,0,0.2,1)" }}
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
                  style={{ maxWidth: sidebarExpanded ? "180px" : "0px", opacity: sidebarExpanded ? 1 : 0 }}
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
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      {!cat.imageUrl && (
                        <span className={`absolute inset-0 flex items-center justify-center rounded-xl ${isActive ? "bg-white/20" : "bg-[#f0fdf4] group-hover:bg-[#dcfce7]"} transition-colors duration-300`}>
                          <PackageIcon className="h-5 w-5" />
                        </span>
                      )}
                    </span>
                    <span
                      className="whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{ maxWidth: sidebarExpanded ? "180px" : "0px", opacity: sidebarExpanded ? 1 : 0 }}
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
  );
}
