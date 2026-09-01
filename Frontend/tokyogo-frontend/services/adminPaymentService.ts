import { PAYMENT_API_BASE_URL } from "./config";
import { adminFetch, parseApiError } from "./adminAuth";
import type { PaymentMethod, PaymentStatus } from "./paymentService";
import type { TransactionPagingResponse } from "./transactionService";

export interface AdminPaymentItem {
  paymentId: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod | null;
  channelLabel: string | null;
  payerName: string | null;
  payerNote: string | null;
  submittedAt: string | null;
  expiresAt: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface AdminPaymentListParams {
  currentPage?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}

export interface PaymentInboxCount {
  waitingConfirmation: number;
  waitingPayment: number;
}

async function call<T>(path: string, init: RequestInit, fallback: string): Promise<T> {
  const response = await adminFetch(`${PAYMENT_API_BASE_URL}${path}`, init);
  if (!response.ok) throw new Error(await parseApiError(response, fallback));
  const json = await response.json();
  return json.data as T;
}

export async function getAdminPaymentInbox(
  params: AdminPaymentListParams = {},
): Promise<TransactionPagingResponse<AdminPaymentItem>> {
  const query = new URLSearchParams();
  if (params.currentPage) query.set("currentPage", String(params.currentPage));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  // "ALL" has to be sent explicitly: an empty status means "the inbox" server-side.
  if (params.status === "ALL") query.set("status", "ALL");
  if (params.keyword) query.set("keyword", params.keyword);

  return call(
    `/tokyo/gropup/ad-min/payment/inbox?${query.toString()}`,
    { method: "GET" },
    "Failed to fetch payments",
  );
}

export async function getAdminPaymentInboxCount(): Promise<PaymentInboxCount> {
  return call("/tokyo/gropup/ad-min/payment/inbox/count", { method: "GET" }, "Failed to fetch inbox count");
}

export async function getAdminPaymentDetail(paymentId: string): Promise<AdminPaymentItem> {
  return call(
    `/tokyo/gropup/ad-min/payment/${encodeURIComponent(paymentId)}`,
    { method: "GET" },
    "Failed to fetch payment detail",
  );
}

export async function getAdminPaymentByTransaction(transactionId: string): Promise<AdminPaymentItem> {
  return call(
    `/tokyo/gropup/ad-min/payment/transaction/${encodeURIComponent(transactionId)}`,
    { method: "GET" },
    "Failed to fetch payment for this order",
  );
}

export async function approvePayment(paymentId: string): Promise<AdminPaymentItem> {
  return call(
    `/tokyo/gropup/ad-min/payment/${encodeURIComponent(paymentId)}/approve`,
    { method: "POST" },
    "Failed to approve payment",
  );
}

export async function rejectPayment(paymentId: string, reason?: string): Promise<AdminPaymentItem> {
  return call(
    `/tokyo/gropup/ad-min/payment/${encodeURIComponent(paymentId)}/reject`,
    { method: "POST", body: JSON.stringify({ reason: reason ?? "" }) },
    "Failed to reject payment",
  );
}
