export function resolveProductImage(url?: string) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

export function resolveCategoryImage(url?: string | null) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/image/category/${filename}`;
}

export function normalizeUnit(rawUnit: string) {
  const lo = rawUnit.toLowerCase();
  if (lo.includes("pcs") || lo.includes("piece")) return "Pcs";
  if (lo.includes("pack") || lo.includes("pax")) return "Pack";
  if (lo.includes("box")) return "Box";
  return rawUnit;
}

import { UnitList } from "../../../../types/api";

export function getLowestPrice(unitList?: UnitList[]) {
  if (!unitList || unitList.length === 0) return 0;
  const available = unitList.filter((u) => u.status === "AVAILABLE" && u.sellPrice > 0);
  if (available.length === 0) return 0;
  return Math.min(...available.map((u) => u.sellPrice));
}

export function getPriceRange(unitList?: UnitList[]) {
  if (!unitList || unitList.length === 0) return null;
  const prices = unitList.filter((u) => u.sellPrice > 0).map((u) => u.sellPrice);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `Rp ${min.toLocaleString("id-ID")}` : `Rp ${min.toLocaleString("id-ID")} - ${max.toLocaleString("id-ID")}`;
}
