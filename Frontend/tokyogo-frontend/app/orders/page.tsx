"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTransactionList,
  TransactionListItem,
  TransactionStatus,
} from "../../services/transactionService";

import TransactionCard from "./components/TransactionCard";

/* --- Icons ----------------------------------------------- */
function ArrowLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClipboardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statusPriority: Record<TransactionStatus, number> = {
  PENDING: 0,
  SUCCESS: 1,
  FAILED: 2,
};

const sectionLabels: Record<TransactionStatus, string> = {
  PENDING: "Pending Orders",
  SUCCESS: "Completed Orders",
  FAILED: "Failed Orders",
};

function groupByStatus(items: TransactionListItem[]): [TransactionStatus, TransactionListItem[]][] {
  const groups = new Map<TransactionStatus, TransactionListItem[]>();
  for (const item of items) {
    if (!groups.has(item.status)) groups.set(item.status, []);
    groups.get(item.status)!.push(item);
  }
  return (Object.keys(statusPriority) as TransactionStatus[])
    .filter((status) => groups.has(status))
    .map((status) => [status, groups.get(status)!]);
}

/* --- Page ------------------------------------------------ */
export default function OrdersPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    loadTransactions(1);
  }, [router]);

  async function loadTransactions(targetPage: number) {
    setLoading(true);
    setError("");
    try {
      const res = await getTransactionList({ currentPage: targetPage, pageSize: 10 });
      const sorted = [...(res.data.items || [])].sort(
        (a, b) => statusPriority[a.status] - statusPriority[b.status]
      );
      setTransactions(sorted);
      setTotalPages(res.data.total_pages || 1);
      setPage(targetPage);
    } catch (e: unknown) {
      if (e instanceof Error && (e.message === "AUTH_REQUIRED" || e.message.includes("401"))) {
        router.push("/login");
        return;
      }
      console.error("Failed to load transactions:", e);
      setError(e instanceof Error ? e.message : "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-black/50">Loading your orders…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#101210] mb-2">Failed to Load Orders</h1>
          <p className="text-black/50 mb-8">{error}</p>
          <button
            onClick={() => loadTransactions(page)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_8px_24px_rgba(0,105,65,0.25)] hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#0f2118]">
      {/* -- Header -- */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface/60 transition-colors hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-primary/10">
              <ArrowLeftIcon className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to Profile</span>
          </Link>

          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[1.35rem] font-extrabold tracking-[-0.03em] text-primary">
            My Orders
          </h1>

          <div className="w-8" />
        </div>
      </header>

      {/* -- Content -- */}
      <div className="mx-auto max-w-[640px] px-6 py-8 lg:px-8 lg:py-12">
        {transactions.length === 0 ? (
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-10 text-center shadow-[0_16px_40px_rgba(0,39,25,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f6f8f5] text-black/20">
              <ClipboardIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-6 font-headline text-[1.5rem] font-extrabold tracking-[-0.03em] text-[#101210]">
              No Orders Yet
            </h2>
            <p className="mt-2 text-sm text-black/45">
              You haven&apos;t placed any orders. Start shopping to see your order history here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dim"
            >
              Start Shopping <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">
              {transactions.length} order{transactions.length === 1 ? "" : "s"} found
            </p>

            {groupByStatus(transactions).map(([status, items]) => (
              <div key={status} className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/50">
                  {sectionLabels[status]} ({items.length})
                </p>
                {items.map((tx) => (
                  <TransactionCard key={tx.transactionId} tx={tx} />
                ))}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_4px_16px_rgba(0,39,25,0.04)]">
                <button
                  onClick={() => loadTransactions(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/[0.05] disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm font-bold text-black/50">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => loadTransactions(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/[0.05] disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
