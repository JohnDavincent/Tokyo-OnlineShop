"use client";

import { Suspense } from "react";
import { useCategoryPage } from "./hooks/useCategoryPage";
import { SiteHeader } from "./components/SiteHeader";
import { PageHeader } from "./components/PageHeader";
import { Sidebar } from "./components/Sidebar";
import { MobileFilter } from "./components/MobileFilter";
import { SubcategoryBar } from "./components/SubcategoryBar";
import { ProductGrid } from "./components/ProductGrid";
import { SiteFooter } from "./components/SiteFooter";

function CategoryPageContent() {
  const {
    products,
    categories,
    subCategories,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    mobileFilterOpen,
    setMobileFilterOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarHovered,
    setSidebarHovered,
    sidebarExpanded,
    currentPage,
    totalPages,
    totalItems,
    activeCategoryId,
    activeCategoryName,
    activeCategoryObj,
    activeSubCategoryId,
    activeSubCategoryName,
    activeCategoryBtnRef,
    setCategory,
    setSubCategory,
    goToPage,
    clearAllFilters,
  } = useCategoryPage();

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-on-surface">
      <SiteHeader />

      <PageHeader
        activeCategoryName={activeCategoryName}
        activeSubCategoryName={activeSubCategoryName}
        totalItems={totalItems}
      />

      <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex gap-10">
          <Sidebar
            categories={categories}
            activeCategoryId={activeCategoryId}
            activeCategoryObj={activeCategoryObj}
            activeCategoryName={activeCategoryName}
            totalItems={totalItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCategory={setCategory}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            sidebarHovered={sidebarHovered}
            setSidebarHovered={setSidebarHovered}
            sidebarExpanded={sidebarExpanded}
            activeCategoryBtnRef={activeCategoryBtnRef}
          />

          <MobileFilter
            categories={categories}
            subCategories={subCategories}
            activeCategoryId={activeCategoryId}
            activeSubCategoryId={activeSubCategoryId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCategory={setCategory}
            setSubCategory={setSubCategory}
            mobileFilterOpen={mobileFilterOpen}
            setMobileFilterOpen={setMobileFilterOpen}
          />

          <div className="flex-1 min-w-0">
            <SubcategoryBar
              subCategories={subCategories}
              activeSubCategoryId={activeSubCategoryId}
              setSubCategory={setSubCategory}
            />

            <ProductGrid
              products={products}
              loading={loading}
              totalItems={totalItems}
              currentPage={currentPage}
              totalPages={totalPages}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={clearAllFilters}
              onPageChange={goToPage}
            />
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

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
