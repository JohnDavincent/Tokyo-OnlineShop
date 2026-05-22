import { TRANSACTION_API_BASE_URL } from "./config";

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

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function checkoutTransaction(addressId: string): Promise<TransactionResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  const response = await fetch(`${TRANSACTION_API_BASE_URL}/tokyo/gropup/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ addressId }),
  });

  if (!response.ok) {
    let errorMsg = "Checkout failed";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
