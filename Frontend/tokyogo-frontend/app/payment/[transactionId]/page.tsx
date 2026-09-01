"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PaymentChannel,
  PaymentData,
  confirmPayment,
  formatCountdown,
  getPaymentByTransaction,
  selectPaymentMethod,
} from "../../../services/paymentService";

/* --- Icons ----------------------------------------------- */
function ArrowLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QrIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" strokeLinecap="round" />
    </svg>
  );
}

function BankIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 10h18L12 4 3 10Z" strokeLinejoin="round" />
      <path d="M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HourglassIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M7 3h10M7 21h10M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l2.4-2.3A4 4 0 0 0 16 6.5V3M8 21v-3.5a4 4 0 0 1 1.6-3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --- Small pieces ---------------------------------------- */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy — please copy it manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/10"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ResultScreen({
  tone,
  icon,
  title,
  message,
  orderId,
  children,
}: {
  tone: "success" | "danger" | "neutral";
  icon: React.ReactNode;
  title: string;
  message: string;
  orderId: string;
  children?: React.ReactNode;
}) {
  const toneClasses = {
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-500",
    neutral: "bg-amber-50 text-amber-600",
  }[tone];

  return (
    <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
      <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${toneClasses}`}>
        {icon}
      </div>
      <h2 className="font-headline text-2xl font-extrabold tracking-[-0.03em] text-[#101210]">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-black/50">{message}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-black/35">Order {orderId}</p>
      {children}
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/orders"
          className="flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dim"
        >
          View My Orders
        </Link>
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-2xl border border-black/[0.08] bg-white py-3.5 text-sm font-bold text-[#101210] transition-all hover:bg-[#f6f8f5]"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

/* --- Page ------------------------------------------------ */

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = Array.isArray(params.transactionId) ? params.transactionId[0] : params.transactionId;

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [switchingChannel, setSwitchingChannel] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Ticking locally rather than polling: the server value only refreshes on load.
  const expiredHandled = useRef(false);

  const applyPayment = useCallback((data: PaymentData) => {
    setPayment(data);
    setSecondsLeft(data.secondsRemaining);
    if (data.status === "WAITING_PAYMENT") {
      expiredHandled.current = false;
    }
  }, []);

  const load = useCallback(async () => {
    if (!transactionId) {
      setError("Transaction ID is missing");
      setLoading(false);
      return;
    }

    try {
      const data = await getPaymentByTransaction(transactionId);
      applyPayment(data);
      setError("");
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "AUTH_REQUIRED") {
        router.push("/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load the payment for this order.");
    } finally {
      setLoading(false);
    }
  }, [transactionId, router, applyPayment]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    load();
  }, [load, router]);

  // Countdown for the open window.
  useEffect(() => {
    if (!payment || payment.status !== "WAITING_PAYMENT") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // The sweep on the backend is the real authority — re-read once we hit zero.
          if (!expiredHandled.current) {
            expiredHandled.current = true;
            load();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payment, load]);

  // While an admin decision is pending, check back every few seconds.
  useEffect(() => {
    if (!payment || payment.status !== "WAITING_CONFIRMATION") return;
    const poll = setInterval(load, 8000);
    return () => clearInterval(poll);
  }, [payment, load]);

  async function handleSelectChannel(channel: PaymentChannel) {
    if (!payment || payment.channelCode === channel.code) return;
    setSwitchingChannel(channel.code);
    try {
      const data = await selectPaymentMethod(payment.paymentId, channel.code);
      applyPayment(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "AUTH_REQUIRED") {
        router.push("/login");
        return;
      }
      toast.error(e instanceof Error ? e.message : "Could not select that payment method.");
      load();
    } finally {
      setSwitchingChannel(null);
    }
  }

  async function handleConfirm() {
    if (!payment) return;
    setSubmitting(true);
    try {
      const data = await confirmPayment(payment.paymentId, {
        payerName: payerName.trim() || undefined,
        note: note.trim() || undefined,
      });
      applyPayment(data);
      setConfirmOpen(false);
      toast.success("Payment submitted. We will confirm it shortly.");
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "AUTH_REQUIRED") {
        router.push("/login");
        return;
      }
      toast.error(e instanceof Error ? e.message : "Could not submit your payment.");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  /* -- Loading / error -- */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-black/50">Loading payment…</p>
        </div>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8f5] p-6">
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <CrossIcon />
          </div>
          <h1 className="mb-2 font-headline text-2xl font-bold text-[#101210]">Payment Unavailable</h1>
          <p className="mb-8 text-black/50">{error || "We could not find a payment for this order."}</p>
          <Link
            href="/orders"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-primary py-4 font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.25)] transition-all hover:-translate-y-0.5 hover:bg-primary-dim"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const amount = `Rp ${payment.amount.toLocaleString("id-ID")}`;
  const channel = payment.selectedChannel;
  const urgent = secondsLeft > 0 && secondsLeft <= 300;

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#0f2118]">
      {/* -- Header -- */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface/60 transition-colors hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-primary/10">
              <ArrowLeftIcon className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">My Orders</span>
          </Link>

          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[1.35rem] font-extrabold tracking-[-0.03em] text-primary">
            Payment
          </h1>

          <div className="w-8" />
        </div>
      </header>

      <div className="mx-auto max-w-[640px] space-y-5 px-6 py-8 lg:px-8 lg:py-12">
        {payment.status === "PAID" && (
          <ResultScreen
            tone="success"
            icon={<CheckIcon />}
            title="Payment Confirmed"
            message="Your payment has been approved and your order is now being prepared."
            orderId={payment.orderId}
          />
        )}

        {payment.status === "REJECTED" && (
          <ResultScreen
            tone="danger"
            icon={<CrossIcon />}
            title="Payment Rejected"
            message="We could not verify your payment, so this order has been cancelled."
            orderId={payment.orderId}
          >
            {payment.rejectionReason && (
              <p className="mx-auto mt-4 max-w-sm rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm font-medium text-red-600">
                {payment.rejectionReason}
              </p>
            )}
          </ResultScreen>
        )}

        {payment.status === "EXPIRED" && (
          <ResultScreen
            tone="danger"
            icon={<ClockIcon className="h-8 w-8" />}
            title="Payment Window Closed"
            message="This order was cancelled because it was not paid in time. You can place it again from your cart."
            orderId={payment.orderId}
          />
        )}

        {payment.status === "WAITING_CONFIRMATION" && (
          <ResultScreen
            tone="neutral"
            icon={<HourglassIcon />}
            title="Waiting for Confirmation"
            message="Thanks! Our team is checking your payment. This page updates on its own once a decision is made."
            orderId={payment.orderId}
          >
            <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-black/[0.06] bg-[#f6f8f5] p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-black/40">Amount</span>
                <span className="text-sm font-extrabold text-[#101210]">{amount}</span>
              </div>
              {channel && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-black/40">Paid via</span>
                  <span className="text-sm font-bold text-[#101210]">{channel.label}</span>
                </div>
              )}
              {payment.payerName && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-black/40">From</span>
                  <span className="text-sm font-bold text-[#101210]">{payment.payerName}</span>
                </div>
              )}
            </div>
          </ResultScreen>
        )}

        {payment.status === "WAITING_PAYMENT" && (
          <>
            {/* Countdown + amount */}
            <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">Total Payment</p>
                  <p className="mt-1 font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">
                    {amount}
                  </p>
                  <p className="mt-1 text-xs font-bold text-black/40">Order {payment.orderId}</p>
                </div>

                <div
                  className={`flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 ${
                    urgent ? "border-red-200 bg-red-50 text-red-600" : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <span className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.12em]">
                    <ClockIcon className="h-3 w-3" /> Pay within
                  </span>
                  <span className="mt-1 font-headline text-xl font-extrabold tabular-nums tracking-tight">
                    {formatCountdown(secondsLeft)}
                  </span>
                </div>
              </div>

              <p className="mt-4 rounded-2xl bg-[#f6f8f5] px-4 py-3 text-xs font-medium leading-relaxed text-black/50">
                Transfer the exact amount, then press <strong className="font-bold text-black/70">I Have Paid</strong>.
                Our admin verifies every payment manually before the order is released.
              </p>
            </div>

            {/* Method picker */}
            <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
              <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">
                Choose Payment Method
              </p>

              <div className="flex flex-col gap-3">
                {payment.availableChannels.map((option) => {
                  const active = payment.channelCode === option.code;
                  const busy = switchingChannel === option.code;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      disabled={busy}
                      onClick={() => handleSelectChannel(option)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all disabled:opacity-60 ${
                        active
                          ? "border-primary bg-primary/[0.06] shadow-[0_4px_16px_rgba(0,105,65,0.12)]"
                          : "border-black/[0.07] bg-white hover:border-primary/30 hover:bg-[#f6f8f5]"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active ? "bg-primary text-white" : "bg-black/[0.04] text-black/50"
                        }`}
                      >
                        {option.method === "QRIS" ? <QrIcon /> : <BankIcon />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-[#101210]">{option.label}</span>
                        <span className="block text-xs font-medium text-black/45">
                          {option.method === "QRIS" ? "Scan and pay instantly" : option.accountName ?? "Bank transfer"}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          active ? "border-primary bg-primary text-white" : "border-black/15"
                        }`}
                      >
                        {active && <CheckIcon className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instructions for the chosen channel */}
            {channel && (
              <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
                <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">
                  {channel.method === "QRIS" ? "Scan to Pay" : "Transfer To"}
                </p>

                {channel.method === "QRIS" ? (
                  <div className="flex flex-col items-center">
                    {channel.qrImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={channel.qrImageUrl}
                        alt="QRIS payment code"
                        className="h-64 w-64 rounded-2xl border border-black/[0.06] bg-white object-contain p-3"
                      />
                    ) : (
                      <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-black/15 bg-[#f6f8f5] p-6 text-center text-xs font-semibold text-black/40">
                        QRIS image has not been configured yet. Please use a bank transfer.
                      </div>
                    )}
                    <p className="mt-4 text-center text-sm font-bold text-[#101210]">{channel.label}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-black/[0.06] bg-[#f6f8f5] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/40">{channel.label}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="min-w-0 flex-1 font-headline text-xl font-extrabold tracking-tight text-[#101210]">
                        {channel.accountNumber}
                      </p>
                      {channel.accountNumber && <CopyButton value={channel.accountNumber} />}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-black/45">{channel.accountName}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-[#f6f8f5] p-4">
                  <p className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-[0.12em] text-black/40">
                      Exact Amount
                    </span>
                    <span className="block font-headline text-lg font-extrabold text-primary">{amount}</span>
                  </p>
                  <CopyButton value={String(payment.amount)} />
                </div>

                {channel.instruction && (
                  <p className="mt-3 text-xs font-medium leading-relaxed text-black/45">{channel.instruction}</p>
                )}
              </div>
            )}

            {/* Confirm */}
            <button
              type="button"
              disabled={!channel}
              onClick={() => setConfirmOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              {channel ? "I Have Paid" : "Choose a payment method first"}
            </button>
          </>
        )}
      </div>

      {/* -- Confirm modal -- */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="border-b border-black/[0.06] px-7 py-6">
              <h2 className="font-headline text-xl font-extrabold tracking-[-0.03em] text-[#101210]">
                Confirm Your Payment
              </h2>
              <p className="mt-1 text-sm font-medium text-black/50">
                Only press this after you have transferred {amount}. False confirmations are rejected by our admin.
              </p>
            </div>

            <div className="space-y-4 px-7 py-6">
              <div>
                <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-black/40">
                  Sender Name <span className="font-medium normal-case tracking-normal text-black/30">(optional)</span>
                </label>
                <input
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  maxLength={120}
                  placeholder="Name on the account you paid from"
                  className="w-full rounded-2xl border border-black/[0.08] bg-[#f6f8f5] px-4 py-3 text-sm font-medium text-[#101210] outline-none transition-colors focus:border-primary/40 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-black/40">
                  Note <span className="font-medium normal-case tracking-normal text-black/30">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={255}
                  rows={3}
                  placeholder="Anything that helps us find your transfer"
                  className="w-full resize-none rounded-2xl border border-black/[0.08] bg-[#f6f8f5] px-4 py-3 text-sm font-medium text-[#101210] outline-none transition-colors focus:border-primary/40 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-black/[0.06] px-7 py-5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="flex-1 rounded-2xl border border-black/[0.08] bg-white py-3.5 text-sm font-bold text-[#101210] transition-all hover:bg-[#f6f8f5] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all hover:bg-primary-dim disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Yes, I Have Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
