"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiProduct, ApiCategory, ApiSubCategory } from "../../../../types/api";
import { getCategories, getSubCategoriesByCategoryId } from "../../../../services/categoryService";
import { getProductList } from "../../../../services/productService";
import { getLowestPrice } from "../lib/helpers";

const PAGE_SIZE = 12;

export function useCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoryId = searchParams.get("categoryId") || "";
  const activeSubCategoryId = searchParams.get("subcategoryId") || "";

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ApiSubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const activeCategoryBtnRef = useRef<HTMLButtonElement>(null);

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.id === activeCategoryId),
    [categories, activeCategoryId]
  );
  const activeCategoryName = activeCategoryObj?.categoryName || "";

  const activeSubCategoryName = useMemo(() => {
    if (!activeSubCategoryId) return "";
    const sub = subCategories.find((s) => s.id === activeSubCategoryId);
    return sub?.subCategory || "";
  }, [activeSubCategoryId, subCategories]);

  const sidebarExpanded = !(sidebarCollapsed && !sidebarHovered);

  /* ── Fetch categories on mount ── */
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => console.error("Failed to load categories:", e));
  }, []);

  /* ── Fetch subcategories when category changes ── */
  useEffect(() => {
    if (!activeCategoryId) {
      setSubCategories([]);
      return;
    }
    getSubCategoriesByCategoryId(activeCategoryId)
      .then(setSubCategories)
      .catch((e) => {
        console.error("Failed to load subcategories:", e);
        setSubCategories([]);
      });
  }, [activeCategoryId]);

  /* ── Fetch products when filters change ── */
  useEffect(() => {
    const sortMap: Record<string, { sortBy: string; sortOrder: string }> = {
      default: { sortBy: "name", sortOrder: "ASC" },
      name: { sortBy: "name", sortOrder: "ASC" },
      "price-low": { sortBy: "name", sortOrder: "ASC" },
      "price-high": { sortBy: "name", sortOrder: "ASC" },
    };
    const { sortBy: backendSortBy, sortOrder } = sortMap[sortBy] || sortMap.default;

    setLoading(true);
    getProductList({
      currentPage: currentPage - 1,
      pageSize: PAGE_SIZE,
      sortBy: backendSortBy,
      sortOrder,
      requestDto: {
        categoryParentId: activeCategoryId || null,
        subCategoryId: activeSubCategoryId || null,
        search: searchQuery.trim() || null,
      },
    })
      .then(({ items, total_pages, total_items }) => {
        let result = [...items];
        if (sortBy === "price-low") {
          result.sort((a, b) => getLowestPrice(a.unitList) - getLowestPrice(b.unitList));
        } else if (sortBy === "price-high") {
          result.sort((a, b) => getLowestPrice(b.unitList) - getLowestPrice(a.unitList));
        }
        setProducts(result);
        setTotalPages(total_pages);
        setTotalItems(total_items);
      })
      .catch((e) => {
        console.error("Failed to load products:", e);
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      })
      .finally(() => setLoading(false));
  }, [activeCategoryId, activeSubCategoryId, searchQuery, sortBy, currentPage]);

  /* ── Scroll active category into view ── */
  useEffect(() => {
    if (activeCategoryBtnRef.current) {
      activeCategoryBtnRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeCategoryId]);

  /* ── Reset page when filters change ── */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, activeSubCategoryId, searchQuery, sortBy]);

  /* ── URL helpers ── */
  function setCategory(catId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (catId) params.set("categoryId", catId);
    else params.delete("categoryId");
    params.delete("subcategoryId");
    router.replace(`/product/category?${params.toString()}`);
  }

  function setSubCategory(subId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (subId) params.set("subcategoryId", subId);
    else params.delete("subcategoryId");
    router.replace(`/product/category?${params.toString()}`);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearAllFilters() {
    setSearchQuery("");
    setCategory("");
    setSubCategory("");
    setCurrentPage(1);
  }

  return {
    // Data
    products,
    categories,
    subCategories,
    loading,

    // UI state
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

    // Pagination
    currentPage,
    totalPages,
    totalItems,
    goToPage,

    // Active selections
    activeCategoryId,
    activeCategoryName,
    activeCategoryObj,
    activeSubCategoryId,
    activeSubCategoryName,
    activeCategoryBtnRef,

    // Actions
    setCategory,
    setSubCategory,
    clearAllFilters,
  };
}
