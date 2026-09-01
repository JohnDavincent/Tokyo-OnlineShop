import { PAYMENT_API_BASE_URL } from "./config";
import { AuthRequiredError, authFetch } from "./authFetch";

/* --- DTOs ------------------------------------------------ */

export type PaymentStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "PAID"
  | "REJECTED"
  | "EXPIRED";

export type PaymentMethod = "QRIS" | "BANK_TRANSFER";

export interface PaymentChannel {
  code: string;
  method: PaymentMethod;
  label: string;
  accountNumber: string | null;
  accountName: string | null;
  qrImageUrl: string | null;
  instruction: string | null;
}

export interface PaymentData {
  paymentId: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod | null;
  channelCode: string | null;
  expiresAt: string;
  /** Server-side truth for the countdown; the page ticks down from here. */
  secondsRemaining: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  payerName: string | null;
  payerNote: string | null;
  selectedChannel: PaymentChannel | null;
  availableChannels: PaymentChannel[];
}

interface PaymentEnvelope<T> {
  status: number;
  code: string;
  message: string;
  data: T;
}

/* --- Helpers --------------------------------------------- */

async function paymentFetch<T>(path: string, init: RequestInit = {}): Promise<PaymentEnvelope<T>> {
  let response: Response;

  try {
    response = await authFetch(`${PAYMENT_API_BASE_URL}${path}`, init);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }

  if (!response.ok) {
    let errorMsg = "Payment request failed";
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

/* --- Calls ----------------------------------------------- */

export async function getPaymentChannels(): Promise<PaymentChannel[]> {
  const json = await paymentFetch<PaymentChannel[]>("/tokyo/gropup/payment/channels", { method: "GET" });
  return json.data;
}

export async function getPaymentByTransaction(transactionId: string): Promise<PaymentData> {
  const json = await paymentFetch<PaymentData>(
    `/tokyo/gropup/payment/transaction/${encodeURIComponent(transactionId)}`,
    { method: "GET" },
  );
  return json.data;
}

export async function selectPaymentMethod(paymentId: string, channelCode: string): Promise<PaymentData> {
  const json = await paymentFetch<PaymentData>(
    `/tokyo/gropup/payment/${encodeURIComponent(paymentId)}/method`,
    { method: "POST", body: JSON.stringify({ channelCode }) },
  );
  return json.data;
}

export async function confirmPayment(
  paymentId: string,
  payload: { payerName?: string; note?: string } = {},
): Promise<PaymentData> {
  const json = await paymentFetch<PaymentData>(
    `/tokyo/gropup/payment/${encodeURIComponent(paymentId)}/confirm`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return json.data;
}

/* --- Display helpers ------------------------------------- */

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  WAITING_PAYMENT: "Waiting for payment",
  WAITING_CONFIRMATION: "Waiting for confirmation",
  PAID: "Paid",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
