"use client";

import Link from "next/link";
import { TransactionListItem } from "../../../services/transactionService";
import StatusBadge from "./StatusBadge";

export default function TransactionCard({ tx }: { tx: TransactionListItem }) {
  return (
    <Link
      href={`/orders/${tx.transactionId}`}
      className="group flex items-center justify-between rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_16px_rgba(0,39,25,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(0,39,25,0.08)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-[#101210] truncate">
            {tx.orderId}
          </span>
          <StatusBadge status={tx.status} />
        </div>
        <p className="mt-1 text-xs font-medium text-black/35 truncate">
          {tx.transactionId}
        </p>
      </div>
      <div className="shrink-0 text-right ml-4">
        <p className="text-[1.05rem] font-extrabold tracking-tight text-primary">
          Rp {tx.grandTotal.toLocaleString("id-ID")}
        </p>
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-black/35">
          Grand Total
        </p>
      </div>
    </Link>
  );
}
