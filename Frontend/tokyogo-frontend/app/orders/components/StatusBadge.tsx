"use client";

import { TransactionStatus } from "../../../services/transactionService";

const statusMeta: Record<TransactionStatus, { label: string; classes: string }> = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  WAITING_PAYMENT: {
    label: "Awaiting Payment",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  WAITING_CONFIRMATION: {
    label: "Verifying Payment",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SUCCESS: {
    label: "Success",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  FAILED: {
    label: "Failed",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  EXPIRED: {
    label: "Expired",
    classes: "bg-neutral-100 text-neutral-600 border-neutral-300",
  },
};

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const meta = statusMeta[status] || statusMeta.PENDING;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}
