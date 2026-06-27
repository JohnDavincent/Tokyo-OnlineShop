import { TRANSACTION_API_BASE_URL } from "./config";
import { AuthRequiredError, authFetch } from "./authFetch";

export interface TransactionRequest {
  addressId: string;
}

export interface TransactionDetail {
  price: number;
  productName: string;
  productUnit: string;
  quantity: number;
  subTotal: number;
}

export interface TransactionUserAddress {
  address: string;
  addressId: string | null;
  city: string;
  defaultShipping: boolean;
  label: string | null;
  notes: string;
  postalCode: string;
  province: string | null;
  recipientName: string;
  recipientPhoneNumber: string;
}

export interface TransactionData {
  GrandTotal: number;
  transactionDetail: TransactionDetail[];
  transactionId: string;
  userAddress: TransactionUserAddress;
}

export interface TransactionResponse {
  status: number;
  code: string;
  message: string;
  data: TransactionData;
}

export async function checkoutTransaction(addressId: string): Promise<TransactionResponse> {
  let response: Response;

  try {
    response = await authFetch(`${TRANSACTION_API_BASE_URL}/tokyo/gropup/transaction`, {
      method: "POST",
      body: JSON.stringify({ addressId }),
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      throw new Error("AUTH_REQUIRED");
    }

    throw error;
  }

  if (!response.ok) {
    let errorMsg = "Checkout failed";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

/* --- Transaction History DTOs ---------------------------- */

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface TransactionListItem {
  transactionId: string;
  orderId: string;
  status: TransactionStatus;
  grandTotal: number;
}

export interface TransactionPagingResponse<T> {
  items: T[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface TransactionListResponse {
  status: number;
  code: string;
  message: string;
  data: TransactionPagingResponse<TransactionListItem>;
}

export interface TransactionListParams {
  currentPage?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export interface TransactionDetailAddress {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  addressLabel: string | null;
  deliveryNotes: string | null;
}

export interface TransactionDetailItem {
  productName: string;
  productUnit: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface TransactionDetailData {
  transactionId: string;
  orderId: string;
  status: TransactionStatus;
  grandTotal: number;
  address: TransactionDetailAddress;
  items: TransactionDetailItem[];
}

export interface TransactionDetailResponse {
  status: number;
  code: string;
  message: string;
  data: TransactionDetailData;
}

/* --- Transaction History Fetch Functions ----------------- */

export async function getTransactionList(params: TransactionListParams = {}): Promise<TransactionListResponse> {
  const query = new URLSearchParams();
  if (params.currentPage) query.set("currentPage", String(params.currentPage));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const url = `${TRANSACTION_API_BASE_URL}/tokyo/gropup/transaction/list?${query.toString()}`;

  let response: Response;
  try {
    response = await authFetch(url, { method: "GET" });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }

  if (!response.ok) {
    let errorMsg = "Failed to fetch transactions";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function getTransactionDetail(transactionId: string): Promise<TransactionDetailResponse> {
  const url = `${TRANSACTION_API_BASE_URL}/tokyo/gropup/transaction/${encodeURIComponent(transactionId)}`;

  let response: Response;
  try {
    response = await authFetch(url, { method: "GET" });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }

  if (!response.ok) {
    let errorMsg = "Failed to fetch transaction detail";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
