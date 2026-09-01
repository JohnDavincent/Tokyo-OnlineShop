"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getAdminTransactionDetail } from "../../../../../services/adminTransactionService";
import {
  AdminPaymentItem,
  approvePayment,
  getAdminPaymentByTransaction,
  rejectPayment,
} from "../../../../../services/adminPaymentService";
import type { TransactionDetailData } from "../../../../../services/transactionService";
import {
  LoadingState,
  Modal,
  SectionCard,
  StatusBadge,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  tdClass,
  thClass,
} from "../../../components/ui";
import { formatDateTime, formatRupiah } from "../../../lib/format";

interface DetailView {
  isMock: boolean;
  orderId: string;
  transactionId: string;
  status: string;
  grandTotal: number;
  customerName: string;
  customerPhone: string;
  addressLines: string[];
  createdAt?: string;
  items: Array<{ productName: string; productUnit: string; price: number; quantity: number; subTotal: number }>;
}

function realToView(data: TransactionDetailData): DetailView {
  return {
    isMock: false,
    orderId: data.orderId,
    transactionId: data.transactionId,
    status: data.status,
    grandTotal: data.grandTotal,
    customerName: data.address?.recipientName ?? "—",
    customerPhone: data.address?.recipientPhone ?? "—",
    addressLines: [
      data.address?.addressLine,
      [data.address?.city, data.address?.province, data.address?.postalCode].filter(Boolean).join(", "),
    ].filter((line): line is string => !!line),
    items: data.items ?? [],
  };
}

export default function AdminTransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const transactionId = params.id;

  const [view, setView] = useState<DetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payment, setPayment] = useState<AdminPaymentItem | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!transactionId) return;
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getAdminTransactionDetail(transactionId);
      setView(realToView(data));
    } catch (error) {
      setView(null);
      setLoadError(error instanceof Error ? error.message : "Failed to load transaction");
      setLoading(false);
      return;
    }

    // An order placed before the payment service existed simply has no payment.
    try {
      setPayment(await getAdminPaymentByTransaction(transactionId));
    } catch {
      setPayment(null);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove() {
    if (!payment) return;
    setActing(true);
    try {
      await approvePayment(payment.paymentId);
      toast.success(`Payment for ${payment.orderId} approved`);
      setApproveOpen(false);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve payment");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!payment) return;
    setActing(true);
    try {
      await rejectPayment(payment.paymentId, rejectReason.trim() || undefined);
      toast.success(`Payment for ${payment.orderId} rejected`);
      setRejectOpen(false);
      setRejectReason("");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject payment");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <LoadingState label="Loading transaction…" />;

  if (!view) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm font-semibold text-[var(--admin-heading)]">Transaction not found</p>
        {loadError && <p className="text-xs text-[var(--admin-muted)]">{loadError}</p>}
        <Link href="/admin/transactions" className={secondaryButtonClass}>
          Back to transactions
        </Link>
      </div>
    );
  }

  const canDecide = payment?.status === "WAITING_CONFIRMATION";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/transactions"
            aria-label="Back to transactions"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
                {view.orderId}
              </h2>
              <StatusBadge status={view.status} />
            </div>
            {view.createdAt && <p className="text-xs text-[var(--admin-muted)]">{formatDateTime(view.createdAt)}</p>}
          </div>
        </div>

        {canDecide && (
          <div className="flex items-center gap-2">
            <button onClick={() => setApproveOpen(true)} className={primaryButtonClass}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Approve payment
            </button>
            <button
              onClick={() => {
                setRejectOpen(true);
                setRejectReason("");
              }}
              className={dangerButtonClass}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Items" className="xl:col-span-2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--admin-border)]">
                <th className={thClass}>Product</th>
                <th className={thClass}>Unit</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Qty</th>
                <th className={`${thClass} text-right`}>Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {view.items.map((item, index) => (
                <tr key={`${item.productName}-${index}`}>
                  <td className={`${tdClass} font-semibold text-[var(--admin-heading)]`}>{item.productName}</td>
                  <td className={tdClass}>{item.productUnit}</td>
                  <td className={tdClass}>{formatRupiah(item.price)}</td>
                  <td className={tdClass}>{item.quantity}</td>
                  <td className={`${tdClass} text-right font-semibold text-[var(--admin-heading)]`}>
                    {formatRupiah(item.subTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--admin-border)]">
                <td colSpan={4} className={`${tdClass} font-bold uppercase tracking-[0.1em] text-[var(--admin-muted)]`}>
                  Grand total
                </td>
                <td className={`${tdClass} text-right font-headline text-base font-extrabold text-[var(--admin-primary)]`}>
                  {formatRupiah(view.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </SectionCard>

        <SectionCard title="Customer & delivery">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Recipient</p>
              <p className="mt-1 text-sm font-semibold text-[var(--admin-heading)]">{view.customerName}</p>
              <p className="text-xs text-[var(--admin-muted)]">{view.customerPhone}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Address</p>
              {view.addressLines.map((line) => (
                <p key={line} className="mt-1 text-sm text-[var(--admin-text)]">
                  {line}
                </p>
              ))}
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Payment</p>
              {payment ? (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  <StatusBadge status={payment.status} />
                  <p className="text-xs text-[var(--admin-text)]">
                    {payment.channelLabel ?? "Method not chosen yet"}
                  </p>
                  {payment.payerName && (
                    <p className="text-xs text-[var(--admin-muted)]">Sender: {payment.payerName}</p>
                  )}
                  {payment.payerNote && (
                    <p className="text-xs text-[var(--admin-muted)]">Note: {payment.payerNote}</p>
                  )}
                  {payment.submittedAt && (
                    <p className="text-xs text-[var(--admin-muted)]">
                      Submitted {formatDateTime(payment.submittedAt)}
                    </p>
                  )}
                  {payment.reviewedAt && (
                    <p className="text-xs text-[var(--admin-muted)]">
                      Reviewed {formatDateTime(payment.reviewedAt)}
                      {payment.reviewedBy ? ` by ${payment.reviewedBy}` : ""}
                    </p>
                  )}
                  {payment.rejectionReason && (
                    <p className="text-xs text-[var(--admin-danger)]">{payment.rejectionReason}</p>
                  )}
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-[var(--admin-muted)]">
                  No payment record for this order.
                </p>
              )}
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Transaction ID</p>
              <p className="mt-1 break-all font-mono text-xs text-[var(--admin-text)]">{view.transactionId}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <Modal open={approveOpen} onClose={() => setApproveOpen(false)} title="Approve payment">
        <p className="text-sm text-[var(--admin-text)]">
          Approve the payment for order <strong>{view.orderId}</strong> from <strong>{view.customerName}</strong> (
          {formatRupiah(view.grandTotal)})? This marks the order as paid and updates product sold counts.
        </p>
        <p className="mt-2 text-xs text-[var(--admin-muted)]">
          Check the money has actually arrived before approving. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setApproveOpen(false)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button onClick={handleApprove} disabled={acting} className={primaryButtonClass}>
            {acting ? "Approving…" : "Yes, approve"}
          </button>
        </div>
      </Modal>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject payment">
        <p className="text-sm text-[var(--admin-text)]">
          Order <strong>{view.orderId}</strong> will be cancelled and the customer will see your reason.
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
          <button onClick={() => setRejectOpen(false)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button onClick={handleReject} disabled={acting} className={dangerButtonClass}>
            {acting ? "Rejecting…" : "Reject payment"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
