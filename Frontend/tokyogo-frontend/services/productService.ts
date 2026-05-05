import { API_BASE_URL, extractProducts, normalizeUnit } from "./config";
import { ApiProduct, ApiProductDetail, ApiResponse } from "../types/api";

export async function getProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/product`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  return extractProducts(json);
}

export async function getArrivalProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/product/arrival`);
  if (!res.ok) throw new Error("Failed to fetch arrival products");
  const json = await res.json();
  return extractProducts(json);
}

export async function getProductsByCategory(categoryId: string): Promise<ApiProduct[]> {
  const productUrl = categoryId
    ? `${API_BASE_URL}/tokyo/gropup/product/category-list/${categoryId}`
    : `${API_BASE_URL}/tokyo/gropup/product`;
  const res = await fetch(productUrl);
  if (!res.ok) throw new Error("Failed to fetch products by category");
  const json = await res.json();
  return extractProducts(json);
}

export async function getProductList(body: {
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  requestDto: {
    categoryParentId: string | null;
    subCategoryId: string | null;
    search: string | null;
  };
}): Promise<{ items: ApiProduct[]; total_pages: number; total_items: number }> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/product/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to fetch product list");
  const json = await res.json();
  const pagingData = json?.data;
  return {
    items: pagingData?.items || [],
    total_pages: pagingData?.total_pages || 1,
    total_items: pagingData?.total_items || 0,
  };
}

export async function getProductDetail(productId: string): Promise<ApiProductDetail | null> {
  let finalProduct: ApiProductDetail | null = null;
  let listUnits: any[] = [];

  // Always fetch the list first to grab the convertQuantity mapped values
  const listRes = await fetch(`${API_BASE_URL}/tokyo/gropup/product`);
  if (listRes.ok) {
    const listJson = await listRes.json();
    const listData = Array.isArray(listJson) ? listJson : (listJson.data || []);

    const decodedName = decodeURIComponent(productId).toLowerCase();
    const matched = listData.find((p: any) =>
      p.productId === productId || p.id === productId || p._id === productId ||
      (p.productName || p.name || "").toLowerCase() === decodedName
    );

    if (matched) {
      listUnits = matched.unitList || [];
      const realId = matched.productId || matched.id || matched._id || productId;
      const detailRes = await fetch(`${API_BASE_URL}/tokyo/gropup/product/detail/${encodeURIComponent(realId)}`);
      if (detailRes.ok) {
        const detailJson = await detailRes.json();
        if (detailJson.data) {
          finalProduct = detailJson.data;
        }
      }
    }
  }

  // Fallback: If it wasn't matched in the list, just hit the detail endpoint directly
  if (!finalProduct) {
    const detailRes = await fetch(`${API_BASE_URL}/tokyo/gropup/product/detail/${encodeURIComponent(productId)}`);
    if (detailRes.ok) {
      const detailJson = await detailRes.json();
      if (detailJson.data) {
        finalProduct = detailJson.data;
      }
    }
  }

  if (!finalProduct) {
    return null;
  }

  // MERGE: The detail API doesn't return convertQuantity, but the list API does!
  if (listUnits.length > 0 && finalProduct.unitList) {
    finalProduct.unitList = finalProduct.unitList.map(u => {
      const listU = listUnits.find(lu => normalizeUnit(lu.unit) === normalizeUnit(u.unit));
      if (listU) {
        return { ...u, convertQuantity: listU.convertQuantity, status: listU.status };
      }
      return u;
    });
  }

  return finalProduct;
}
