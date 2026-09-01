"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AdminPaymentItem,
  approvePayment,
  getAdminPaymentInbox,
  rejectPayment,
} from "../../../../services/adminPaymentService";
import type { PaymentStatus } from "../../../../services/paymentService";
import {
  EmptyState,
  LoadingState,
  Modal,
  StatusBadge,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  tdClass,
  thClass,
} from "../../components/ui";
import { formatDateTime, formatRupiah } from "../../lib/format";

const STATUS_TABS: Array<{ value: PaymentStatus | "ALL"; label: string }> = [
  { value: "WAITING_CONFIRMATION", label: "Inbox" },
  { value: "WAITING_PAYMENT", label: "Awaiting payment" },
  { value: "PAID", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "ALL", label: "All" },
];

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("WAITING_CONFIRMATION");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const [approveTarget, setApproveTarget] = useState<AdminPaymentItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminPaymentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminPaymentInbox({
        currentPage: 1,
        pageSize: 50,
        status: statusFilter,
        keyword: debouncedSearch.trim(),
      });
      setPayments(data.items || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // New payments arrive without any action from the admin, so refresh the inbox on a timer.
  useEffect(() => {
    if (statusFilter !== "WAITING_CONFIRMATION") return;
    const poll = setInterval(load, 20000);
    return () => clearInterval(poll);
  }, [statusFilter, load]);

  async function handleApprove() {
    if (!approveTarget) return;
    setActing(true);
    try {
      await approvePayment(approveTarget.paymentId);
      toast.success(`Payment for ${approveTarget.orderId} approved`);
      setApproveTarget(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve payment");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setActing(true);
    try {
      await rejectPayment(rejectTarget.paymentId, rejectReason.trim() || undefined);
      toast.success(`Payment for ${rejectTarget.orderId} rejected`);
      setRejectTarget(null);
      setRejectReason("");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject payment");
    } finally {
      setActing(false);
    }
  }

  const inboxCount = payments.filter((p) => p.status === "WAITING_CONFIRMATION").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
            Payment inbox
          </h2>
          <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
            Customers who claim they have paid land here. Approving releases the order; rejecting cancels it.
          </p>
        </div>

        <input
          type="search"
          placeholder="Search order ID or sender…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} w-64`}
        />
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-[var(--admin-primary)] text-[var(--admin-on-primary)]"
                  : "border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]"
              }`}
            >
              {tab.label}
              {tab.value === "WAITING_CONFIRMATION" && inboxCount > 0 && statusFilter === "WAITING_CONFIRMATION" && (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[0.65rem] font-extrabold">
                  {inboxCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
        {loading ? (
          <LoadingState label="Loading payments…" />
        ) : payments.length === 0 ? (
          <EmptyState
            title="Nothing here"
            hint={
              statusFilter === "WAITING_CONFIRMATION"
                ? "No payments are waiting for your decision."
                : "No payments match this filter."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                <tr>
                  <th className={thClass}>Order</th>
                  <th className={thClass}>Amount</th>
                  <th className={thClass}>Method</th>
                  <th className={thClass}>Sender</th>
                  <th className={thClass}>Submitted</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.paymentId}
                    className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-surface-2)]/60"
                  >
                    <td className={tdClass}>
                      <Link
                        href={`/admin/transactions/${payment.transactionId}`}
                        className="font-bold text-[var(--admin-heading)] hover:text-[var(--admin-primary)]"
                      >
                        {payment.orderId}
                      </Link>
                    </td>
                    <td className={`${tdClass} font-bold`}>{formatRupiah(payment.amount)}</td>
                    <td className={tdClass}>{payment.channelLabel ?? "—"}</td>
                    <td className={tdClass}>
                      <span className="block">{payment.payerName ?? "—"}</span>
                      {payment.payerNote && (
                        <span className="block max-w-[220px] truncate text-xs text-[var(--admin-muted)]">
                          {payment.payerNote}
                        </span>
                      )}
                    </td>
                    <td className={tdClass}>
                      {payment.submittedAt ? formatDateTime(payment.submittedAt) : "—"}
                    </td>
                    <td className={tdClass}>
                      <StatusBadge status={payment.status} />
                      {payment.status === "REJECTED" && payment.rejectionReason && (
                        <span className="mt-1 block max-w-[200px] truncate text-xs text-[var(--admin-muted)]">
                          {payment.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      {payment.status === "WAITING_CONFIRMATION" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setApproveTarget(payment)}
                            className={`${primaryButtonClass} px-4 py-2`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectTarget(payment);
                              setRejectReason("");
                            }}
                            className={`${dangerButtonClass} px-4 py-2`}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--admin-muted)]">
                          {payment.reviewedBy ? `by ${payment.reviewedBy}` : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve confirmation */}
      <Modal open={!!approveTarget} onClose={() => setApproveTarget(null)} title="Approve this payment?">
        <p className="text-sm text-[var(--admin-text)]">
          This marks order <strong>{approveTarget?.orderId}</strong> as paid for{" "}
          <strong>{approveTarget ? formatRupiah(approveTarget.amount) : ""}</strong>. The order will be released and
          product sold counters will be updated.
        </p>
        <p className="mt-2 text-xs text-[var(--admin-muted)]">
          Check the money has actually arrived before approving — this cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setApproveTarget(null)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleApprove} disabled={acting} className={primaryButtonClass}>
            {acting ? "Approving…" : "Approve payment"}
          </button>
        </div>
      </Modal>

      {/* Reject confirmation */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject this payment?">
        <p className="text-sm text-[var(--admin-text)]">
          Order <strong>{rejectTarget?.orderId}</strong> will be cancelled and the customer will see your reason.
        </p>
        <div className="mt-4">
          <label className={labelClass}>Reason (optional)</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            maxLength={255}
            rows={3}
            placeholder="e.g. no transfer received for this amount"
            className={`${inputClass} resize-none`}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setRejectTarget(null)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleReject} disabled={acting} className={dangerButtonClass}>
            {acting ? "Rejecting…" : "Reject payment"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
