import { API_BASE_URL } from "./config";
import { ApiCategory, ApiSubCategory, ApiResponse } from "../types/api";

export async function getCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/category/list-category`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json: ApiResponse<ApiCategory[]> = await res.json();
  if (json.success && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}

export async function getSubCategories(): Promise<ApiSubCategory[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/category/list-subcategory`);
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  const json: ApiResponse<ApiSubCategory[]> = await res.json();
  if (json.success && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}

export async function getSubCategoriesByCategoryId(categoryId: string): Promise<ApiSubCategory[]> {
  const res = await fetch(`${API_BASE_URL}/tokyo/gropup/category/list-subcategory/${categoryId}`);
  if (!res.ok) throw new Error("Failed to fetch subcategories by category");
  const json: ApiResponse<ApiSubCategory[]> = await res.json();
  if (json.success && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}
