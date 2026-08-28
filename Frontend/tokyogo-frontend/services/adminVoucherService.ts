import { AUTH_API_BASE_URL } from "./config";
import { adminFetch, parseApiError } from "./adminAuth";

/**
 * Admin voucher endpoints live in `user-services` (AUTH_API_BASE_URL),
 * under `/tokyo/group/ad-min` — note "group", not the "gropup" typo used
 * by the product service. All three require a ROLE_ADMIN bearer token.
 *
 *   POST /voucher        -> create
 *   PUT  /voucher/{id}   -> partial update (null field = keep old value)
 *   POST /voucher/list   -> filtered + paged list
 */

const VOUCHER_BASE = `${AUTH_API_BASE_URL}/tokyo/group/ad-min/voucher`;

/* --- Enums (mirror the backend) ------------------------------ */

export type VoucherType = "DISCOUNT" | "FREE" | "CASHBACK";
export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE";
export type VoucherStatus = "SCHEDULED" | "ONGOING" | "ENDED" | "CANCELLED";
export type VoucherAudience = "ALL_USER" | "REGULAR_MEMBER" | "VIP_MEMBER";

export const VOUCHER_TYPES: VoucherType[] = ["DISCOUNT", "FREE", "CASHBACK"];
export const DISCOUNT_TYPES: DiscountType[] = ["PERCENTAGE", "FIXED_AMOUNT"];
export const VOUCHER_STATUSES: VoucherStatus[] = ["SCHEDULED", "ONGOING", "ENDED", "CANCELLED"];
export const VOUCHER_AUDIENCES: VoucherAudience[] = ["ALL_USER", "REGULAR_MEMBER", "VIP_MEMBER"];

/* --- Payloads ------------------------------------------------- */

export interface CreateVoucherPayload {
  title: string;
  description: string | null;
  voucherType: VoucherType;
  discountType: DiscountType;
  value: number;
  startAt: string; // LocalDateTime, e.g. 2026-08-28T10:00:00
  endAt: string | null;
  totalQuote: number | null;
  usageLimit: number | null;
  code: string;
  minimalSpend: number | null;
  maximumDiscount: number | null;
  minQuantity: number | null;
  applicableProductId: string[] | null;
  applicableCategoryId: string[] | null;
  audience: VoucherAudience;
}

/** Partial update — every field is optional; omitted/null keeps the stored value. */
export type UpdateVoucherPayload = Partial<Omit<CreateVoucherPayload, "code">>;

export interface VoucherListFilter {
  pageSize?: number;
  currentPage?: number; // 0-based
  sortBy?: "createdAt" | "startAt" | "endAt" | "title" | "usedCount";
  sort?: "ASC" | "DESC";
  pageable?: boolean;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  discountType?: DiscountType | null;
  voucherStatus?: VoucherStatus | null;
  voucherType?: VoucherType | null;
  audience?: VoucherAudience | null;
  code?: string | null;
}

/* --- Responses ------------------------------------------------ */

/** Row shape returned by /voucher/list — deliberately narrower than VoucherDto. */
export interface VoucherListItem {
  voucherId: string;
  voucherTitle: string | null;
  voucherCode: string | null;
  startDate: string | null;
  endDate: string | null;
  discountType: DiscountType | null;
  voucherStatus: VoucherStatus | null;
  voucherType: VoucherType | null;
}

/** Full shape returned by create/update (VoucherDto). */
export interface VoucherDetail {
  id: string;
  code: string | null;
  title: string | null;
  description: string | null;
  voucherType: VoucherType | null;
  discountType: DiscountType | null;
  value: number | null;
  audience: VoucherAudience | null;
  voucherStatus: VoucherStatus | null;
  startAt: string | null;
  endAt: string | null;
  totalQuote: number | null;
  usedCount: number | null;
  usageLimit: number | null;
  criteria: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VoucherListResult {
  items: VoucherListItem[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

/* --- Calls ---------------------------------------------------- */

export async function createVoucher(payload: CreateVoucherPayload): Promise<VoucherDetail> {
  const response = await adminFetch(VOUCHER_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to create voucher"));
  const json = await response.json();
  return json.data as VoucherDetail;
}

export async function updateVoucher(voucherId: string, payload: UpdateVoucherPayload): Promise<VoucherDetail> {
  const response = await adminFetch(`${VOUCHER_BASE}/${encodeURIComponent(voucherId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to update voucher"));
  const json = await response.json();
  return json.data as VoucherDetail;
}

export async function listVouchers(filter: VoucherListFilter = {}): Promise<VoucherListResult> {
  const body: VoucherListFilter = {
    pageSize: 10,
    currentPage: 0,
    sortBy: "createdAt",
    sort: "DESC",
    pageable: true,
    ...filter,
  };

  const response = await adminFetch(`${VOUCHER_BASE}/list`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to load vouchers"));

  const json = await response.json();
  const paging = json?.data ?? {};

  return {
    items: Array.isArray(paging.items) ? (paging.items as VoucherListItem[]) : [],
    totalPages: paging.total_pages ?? 1,
    totalItems: paging.total_items ?? 0,
    currentPage: paging.current_page ?? 0,
    pageSize: paging.page_size ?? body.pageSize ?? 10,
  };
}

/* --- Helpers -------------------------------------------------- */

/**
 * `<input type="datetime-local">` yields "2026-08-28T10:00" but Jackson
 * needs seconds on a LocalDateTime. Empty input -> null (field ignored).
 */
export function toLocalDateTime(value: string): string | null {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}

/** Inverse of toLocalDateTime, for prefilling a datetime-local input. */
export function toDateTimeLocalInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 16);
}

export function formatVoucherValue(discountType: DiscountType | null, value: number | null): string {
  if (value == null) return "—";
  if (discountType === "PERCENTAGE") return `${value}%`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
