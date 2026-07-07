"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  confirmTransaction,
  getAdminTransactionDetail,
} from "../../../../../services/adminTransactionService";
import type { TransactionDetailData } from "../../../../../services/transactionService";
import {
  LoadingState,
  Modal,
  SectionCard,
  StatusBadge,
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirm() {
    if (!view) return;
    setConfirming(true);
    try {
      await confirmTransaction(view.transactionId);
      toast.success(`Transaction ${view.orderId} confirmed`);
      setConfirmOpen(false);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm transaction");
    } finally {
      setConfirming(false);
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

  const canConfirm = view.status === "PENDING";

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

        {canConfirm && (
          <button onClick={() => setConfirmOpen(true)} className={primaryButtonClass}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Confirm transaction
          </button>
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
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Payment status</p>
              <div className="mt-1.5">
                <StatusBadge status={view.status} />
              </div>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">Transaction ID</p>
              <p className="mt-1 break-all font-mono text-xs text-[var(--admin-text)]">{view.transactionId}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm transaction">
        <p className="text-sm text-[var(--admin-text)]">
          Confirm order <strong>{view.orderId}</strong> for <strong>{view.customerName}</strong> (
          {formatRupiah(view.grandTotal)})? This marks it as processed and updates product sold counts.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setConfirmOpen(false)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={confirming} className={primaryButtonClass}>
            {confirming ? "Confirming…" : "Yes, confirm"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
