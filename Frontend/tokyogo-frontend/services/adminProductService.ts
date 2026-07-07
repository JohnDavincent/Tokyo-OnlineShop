import { API_BASE_URL } from "./config";
import { adminFetch, parseApiError } from "./adminAuth";
import { ApiCategory, ApiSubCategory } from "../types/api";

const ADMIN_BASE = `${API_BASE_URL}/tokyo/gropup/ad-min`;

/* --- Product create / update ------------------------------ */

export interface ProductUnitPayload {
  unit: string;
  convertQuantity: number;
  basePrice: number;
  sellPrice: number;
}

export interface ProductMetadataPayload {
  name: string;
  sku: string;
  stock: number | null;
  baseWeight: number | null;
  brand: string | null; // brand UUID
  category: string | null; // category UUID
  subCategory: string | null;
  description: string;
  unitList: ProductUnitPayload[];
  altTexts: string[];
}

function buildProductFormData(metadata: ProductMetadataPayload, images: File[]): FormData {
  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  images.forEach((file) => formData.append("images", file));
  return formData;
}

export async function createProduct(metadata: ProductMetadataPayload, images: File[]) {
  const response = await adminFetch(`${ADMIN_BASE}/product`, {
    method: "POST",
    body: buildProductFormData(metadata, images),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to create product"));
  return response.json();
}

export async function updateProduct(productId: string, metadata: ProductMetadataPayload, images: File[]) {
  const response = await adminFetch(`${ADMIN_BASE}/product/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: buildProductFormData(metadata, images),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to update product"));
  return response.json();
}

// TODO: connect to backend — no DELETE /product/{id} endpoint exists yet.
export async function deleteProduct(_productId: string): Promise<never> {
  throw new Error("Delete is not supported by the backend yet");
}

/* --- Product status actions ------------------------------- */

export async function markProductAsNew(productId: string) {
  const response = await adminFetch(`${ADMIN_BASE}/product/${encodeURIComponent(productId)}/mark-new`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to mark product as new"));
  return response.json();
}

export interface FlashSaleUnitPayload {
  unit: string;
  discountPrice: number;
}

export async function createFlashSale(productId: string, flashSaleUntil: string, unitsSale: FlashSaleUnitPayload[]) {
  const response = await adminFetch(`${ADMIN_BASE}/product/${encodeURIComponent(productId)}/flash-sale`, {
    method: "POST",
    body: JSON.stringify({ flashSaleUntil, unitsSale }),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to create flash sale"));
  return response.json();
}

export async function endFlashSale(productId: string) {
  const response = await adminFetch(`${ADMIN_BASE}/product/${encodeURIComponent(productId)}/end-flash-sale`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to end flash sale"));
  return response.json();
}

/* --- Categories & brands ----------------------------------- */

export async function createCategory(name: string, parentId?: string | null) {
  const response = await adminFetch(`${ADMIN_BASE}/category`, {
    method: "POST",
    body: JSON.stringify({ name, parent_id: parentId ?? null }),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to create category"));
  return response.json();
}

export async function uploadCategoryImage(categoryId: string, file: File) {
  const formData = new FormData();
  formData.append("images", file);
  const response = await adminFetch(`${ADMIN_BASE}/category/add-image/${encodeURIComponent(categoryId)}`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to upload category image"));
  return response.json();
}

export async function createBrand(name: string) {
  const response = await adminFetch(`${ADMIN_BASE}/brand`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to create brand"));
  return response.json();
}

/* --- Public reads used by the admin UI --------------------- */

export interface ApiBrand {
  id: string;
  name: string;
  slug?: string;
  status?: string;
}

export async function getBrandList(): Promise<ApiBrand[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/brand/list-brand`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function getAdminCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/category/list-category`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function getAdminSubCategories(parentId: string): Promise<ApiSubCategory[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/category/list-subcategory/${encodeURIComponent(parentId)}`);
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function getHotProducts() {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/product/hot`);
  if (!res.ok) throw new Error("Failed to fetch hot products");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}
