"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTransactionDetail,
  TransactionDetailData,
} from "../../../services/transactionService";
import StatusBadge from "../components/StatusBadge";

/* --- Icons ----------------------------------------------- */
function ArrowLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PackageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --- Helpers --------------------------------------------- */
function normalizeUnit(rawUnit: string) {
  const lo = rawUnit.toLowerCase();
  if (lo.includes("pcs") || lo.includes("piece")) return "Pcs";
  if (lo.includes("pack") || lo.includes("pax")) return "Pack";
  if (lo.includes("box")) return "Box";
  return rawUnit;
}

/* --- Page ------------------------------------------------ */
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<TransactionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    if (!id) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    async function loadDetail() {
      try {
        const res = await getTransactionDetail(id as string);
        setOrder(res.data);
      } catch (e: unknown) {
        if (e instanceof Error && (e.message === "AUTH_REQUIRED" || e.message.includes("401"))) {
          router.push("/login");
          return;
        }
        console.error("Failed to load transaction detail:", e);
        setError(e instanceof Error ? e.message : "Failed to load order detail. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-black/50">Loading order details…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#101210] mb-2">{error ? "Failed to Load Order" : "Order Not Found"}</h1>
          <p className="text-black/50 mb-8">{error || "We couldn't find the order you're looking for."}</p>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_8px_24px_rgba(0,105,65,0.25)] hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const addr = order.address;

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
            <span className="hidden sm:inline">Back to Orders</span>
          </Link>

          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[1.35rem] font-extrabold tracking-[-0.03em] text-primary">
            Order Detail
          </h1>

          <div className="w-8" />
        </div>
      </header>

      {/* -- Content -- */}
      <div className="mx-auto max-w-[640px] px-6 py-8 lg:px-8 lg:py-12 space-y-5">
        {/* Order Summary */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40 mb-4">Order Summary</p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-black/40 uppercase tracking-[0.12em]">Order ID</p>
                <p className="text-lg font-extrabold text-[#101210]">{order.orderId}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="h-px bg-black/[0.05]" />

            <div className="flex items-center justify-between">
              <span className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-black/40">Grand Total</span>
              <span className="font-headline text-[1.65rem] font-extrabold tracking-[-0.04em] text-primary">
                Rp {order.grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPinIcon className="h-4 w-4" />
            </div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">Deliver To</p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-[#f6f8f5] p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-extrabold text-[#101210]">{addr.recipientName}</span>
              {addr.addressLabel && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                  {addr.addressLabel}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-black/50">{addr.recipientPhone}</p>
            <p className="mt-2 text-sm font-bold text-[#101210] leading-relaxed">{addr.addressLine}</p>
            <p className="text-xs font-medium text-black/40">
              {addr.city}, {addr.province} {addr.postalCode}
            </p>
            {addr.deliveryNotes && (
              <p className="mt-1.5 text-xs font-medium text-black/35 italic">Note: {addr.deliveryNotes}</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PackageIcon className="h-4 w-4" />
            </div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">Items Ordered ({order.items.length})</p>
          </div>

          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => {
              const normUnit = normalizeUnit(item.productUnit);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-black/[0.05] bg-[#f6f8f5] p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#101210]">{item.productName}</p>
                    <p className="text-xs text-black/45 mt-0.5">
                      {item.quantity} × {normUnit} @ Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-[#101210] shrink-0 ml-4">
                    Rp {item.subTotal.toLocaleString("id-ID")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/orders"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.28)] active:translate-y-0"
        >
          Back to Orders
        </Link>
      </div>
    </main>
  );
}
