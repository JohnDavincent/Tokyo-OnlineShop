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
