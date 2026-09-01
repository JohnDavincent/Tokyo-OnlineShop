"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminTransactionList, type AdminTransactionListItem } from "../../../../services/adminTransactionService";
import type { TransactionStatus } from "../../../../services/transactionService";
import {
  EmptyState,
  StatusBadge,
  inputClass,
  primaryButtonClass,
  tdClass,
  thClass,
  LoadingState,
} from "../../components/ui";
import { formatDateTime, formatRupiah } from "../../lib/format";
import { toast } from "sonner";

const STATUS_OPTIONS: Array<TransactionStatus | "ALL"> = [
  "ALL",
  "WAITING_PAYMENT",
  "WAITING_CONFIRMATION",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "PENDING",
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lookupId, setLookupId] = useState("");

  const [transactions, setTransactions] = useState<AdminTransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce customer search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(customerSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [customerSearch]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminTransactionList({
        currentPage: 1,
        pageSize: 50,
        status: statusFilter,
        keyword: debouncedSearch.trim(),
        startDate,
        endDate,
      });
      setTransactions(data.items || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupId.trim()) return;
    router.push(`/admin/transactions/${encodeURIComponent(lookupId.trim())}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
            All transactions
          </h2>
        </div>

        <form onSubmit={handleLookup} className="flex items-center gap-2">
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Open transaction by ID…"
            className={`${inputClass} w-72`}
          />
          <button type="submit" className={primaryButtonClass}>
            Open
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "ALL")}
          className={`${inputClass} w-40`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search order ID, customer…"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className={`${inputClass} w-64`}
        />
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          <span className="text-xs text-[var(--admin-muted)]">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
        {loading ? (
          <div className="py-12">
            <LoadingState label="Loading transactions…" />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions match the filters" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
              <tr>
                <th className={thClass}>Order</th>
                <th className={thClass}>Customer</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Items</th>
                <th className={thClass}>Total</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {transactions.map((trx) => (
                <tr key={trx.transactionId} className="transition-colors hover:bg-[var(--admin-surface-2)]/50">
                  <td className={`${tdClass} font-semibold text-[var(--admin-heading)]`}>{trx.orderId}</td>
                  <td className={tdClass}>
                    <p className="font-semibold text-[var(--admin-heading)]">{trx.customerName || "—"}</p>
                    <p className="text-xs text-[var(--admin-muted)]">{trx.customerPhone || "—"}</p>
                  </td>
                  <td className={tdClass}>{formatDateTime(trx.createdAt)}</td>
                  <td className={tdClass}>{trx.itemCount}</td>
                  <td className={`${tdClass} font-semibold text-[var(--admin-heading)]`}>{formatRupiah(trx.grandTotal)}</td>
                  <td className={tdClass}>
                    <StatusBadge status={trx.status} />
                  </td>
                  <td className={tdClass}>
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/transactions/${trx.transactionId}`}
                        className="text-sm font-bold text-[var(--admin-primary)] hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
