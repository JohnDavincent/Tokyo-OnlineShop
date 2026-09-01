import { TRANSACTION_API_BASE_URL } from "./config";
import { adminFetch, parseApiError } from "./adminAuth";
import type { TransactionDetailData, TransactionStatus, TransactionPagingResponse } from "./transactionService";

export interface AdminTransactionListItem {
  transactionId: string;
  orderId: string;
  status: TransactionStatus;
  grandTotal: number;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  itemCount: number;
}

export interface AdminTransactionListParams {
  currentPage?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  keyword?: string;
}

export async function getAdminTransactionList(
  params: AdminTransactionListParams = {}
): Promise<TransactionPagingResponse<AdminTransactionListItem>> {
  const query = new URLSearchParams();
  if (params.currentPage) query.set("currentPage", String(params.currentPage));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.keyword) query.set("keyword", params.keyword);

  const url = `${TRANSACTION_API_BASE_URL}/tokyo/gropup/ad-min/transaction/list?${query.toString()}`;
  const response = await adminFetch(url, { method: "GET" });
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to fetch transactions"));
  const json = await response.json();
  return json.data;
}

export async function getAdminTransactionDetail(transactionId: string): Promise<TransactionDetailData> {
  const response = await adminFetch(
    `${TRANSACTION_API_BASE_URL}/tokyo/gropup/ad-min/transaction/${encodeURIComponent(transactionId)}`,
    { method: "GET" },
  );
  if (!response.ok) throw new Error(await parseApiError(response, "Failed to fetch transaction detail"));
  const json = await response.json();
  return json.data;
}

/*
 * Orders are no longer confirmed from here. A transaction only becomes SUCCESS
 * or FAILED when an admin approves or rejects its payment — see adminPaymentService.
 */
