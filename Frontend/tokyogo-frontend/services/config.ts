import { ApiProduct } from "../types/api";

export const API_BASE_URL = "http://localhost:5001";
export const AUTH_API_BASE_URL = "http://localhost:5000";
export const CART_API_BASE_URL = "http://localhost:5002";
export const TRANSACTION_API_BASE_URL = "http://localhost:5004";

export function extractProducts(payload: unknown): ApiProduct[] {
  if (Array.isArray(payload)) return payload as ApiProduct[];

  if (payload && typeof payload === "object") {
    if ("data" in payload && Array.isArray((payload as any).data)) {
      return (payload as any).data;
    }
    if ("data" in payload && (payload as any).data && typeof (payload as any).data === "object") {
      if ("content" in (payload as any).data && Array.isArray((payload as any).data.content)) {
        return (payload as any).data.content;
      }
    }
    if ("content" in payload && Array.isArray((payload as any).content)) {
      return (payload as any).content;
    }
  }

  return [];
}

export function normalizeUnit(rawUnit: string) {
  const lo = rawUnit.toLowerCase();
  if (lo.includes("pcs") || lo.includes("piece")) return "Pcs";
  if (lo.includes("pack") || lo.includes("pax")) return "Pack";
  if (lo.includes("box")) return "Box";
  return rawUnit;
}
