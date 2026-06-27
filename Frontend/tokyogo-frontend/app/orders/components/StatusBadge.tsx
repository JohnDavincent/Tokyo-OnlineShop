"use client";

import { TransactionStatus } from "../../../services/transactionService";

const statusMeta: Record<TransactionStatus, { label: string; classes: string }> = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  SUCCESS: {
    label: "Success",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  FAILED: {
    label: "Failed",
    classes: "bg-red-50 text-red-700 border-red-200",
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
