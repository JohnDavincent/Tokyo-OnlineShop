"use client";

import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MOCK_CUSTOMERS,
  MembershipTier,
  MockCustomer,
  MockVoucher,
} from "../../../../services/adminMocks";
import {
  EmptyState,
  MockBadge,
  Modal,
  StatCard,
  StatusBadge,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  tdClass,
  thClass,
} from "../../components/ui";
import { formatDate, formatRupiah } from "../../lib/format";

/*
 * TODO: connect to backend — there are no admin endpoints yet for:
 *   - listing member customers
 *   - reading a member's vouchers
 *   - issuing vouchers to a membership tier
 * The whole section runs on mock data (services/adminMocks.ts).
 */

function VoucherChip({ voucher }: { voucher: MockVoucher }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-dashed px-3.5 py-2.5 ${
        voucher.used
          ? "border-[var(--admin-border)] opacity-50"
          : "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]"
      }`}
    >
      <div>
        <p className="font-mono text-xs font-bold text-[var(--admin-heading)]">{voucher.code}</p>
        <p className="text-xs text-[var(--admin-muted)]">{voucher.description}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-[var(--admin-primary)]">{voucher.discountLabel}</p>
        <p className="text-[0.65rem] text-[var(--admin-muted)]">
          {voucher.used ? "Used" : `Expires ${formatDate(voucher.expiresAt)}`}
        </p>
      </div>
    </div>
  );
}

function IssueVoucherModal({
  onClose,
  onIssue,
}: {
  onClose: () => void;
  onIssue: (voucher: Omit<MockVoucher, "voucherId" | "used">) => void;
}) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [targetTier, setTargetTier] = useState<MembershipTier>("REGULAR");
  const [expiresAt, setExpiresAt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !description.trim() || !discountLabel.trim() || !expiresAt) {
      toast.error("Fill in all voucher fields");
      return;
    }
    onIssue({
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountLabel: discountLabel.trim(),
      targetTier,
      expiresAt,
    });
  }

  return (
    <Modal open onClose={onClose} title="Release voucher to a tier">
      <div className="mb-4">
        <MockBadge />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="v-code" className={labelClass}>Voucher code</label>
            <input id="v-code" value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} placeholder="VIPJULY15" />
          </div>
          <div>
            <label htmlFor="v-discount" className={labelClass}>Discount</label>
            <input id="v-discount" value={discountLabel} onChange={(e) => setDiscountLabel(e.target.value)} className={inputClass} placeholder="15% / Free delivery" />
          </div>
        </div>
        <div>
          <label htmlFor="v-desc" className={labelClass}>Description</label>
          <input id="v-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="15% off groceries" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="v-tier" className={labelClass}>Target membership tier</label>
            <select id="v-tier" value={targetTier} onChange={(e) => setTargetTier(e.target.value as MembershipTier)} className={inputClass}>
              <option value="REGULAR">REGULAR</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label htmlFor="v-expiry" className={labelClass}>Expires</label>
            <input id="v-expiry" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass}>
            Release voucher
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<MockCustomer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<MembershipTier | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      if (tierFilter !== "ALL" && customer.membership !== tierFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!customer.name.toLowerCase().includes(q) && !customer.phoneNumber.includes(q)) return false;
      }
      return true;
    });
  }, [customers, search, tierFilter]);

  const vipCount = customers.filter((c) => c.membership === "VIP").length;
  const activeVouchers = customers.reduce(
    (sum, c) => sum + c.vouchers.filter((v) => !v.used).length,
    0,
  );

  function handleIssueVoucher(voucher: Omit<MockVoucher, "voucherId" | "used">) {
    // TODO: connect to backend — POST an "issue voucher to tier" endpoint once it exists
    const issued: MockVoucher = { ...voucher, voucherId: `v-${Date.now()}`, used: false };
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.membership === voucher.targetTier
          ? { ...customer, vouchers: [issued, ...customer.vouchers] }
          : customer,
      ),
    );
    const count = customers.filter((c) => c.membership === voucher.targetTier).length;
    toast.success(`Voucher ${issued.code} released to ${count} ${voucher.targetTier} member${count === 1 ? "" : "s"} (mock)`);
    setIssueOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
            Member customers
          </h2>
          <MockBadge />
        </div>
        <button onClick={() => setIssueOpen(true)} className={primaryButtonClass}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4Z" strokeLinejoin="round" />
            <path d="M13 7v10" strokeDasharray="2 3" strokeLinecap="round" />
          </svg>
          Release voucher
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total members"
          value={String(customers.length)}
          mock
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="VIP members"
          value={String(vipCount)}
          hint={`${customers.length - vipCount} regular`}
          mock
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          label="Active vouchers"
          value={String(activeVouchers)}
          mock
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4Z" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} w-72`}
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as MembershipTier | "ALL")}
          className={`${inputClass} w-40`}
        >
          <option value="ALL">All tiers</option>
          <option value="VIP">VIP</option>
          <option value="REGULAR">REGULAR</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
        {filtered.length === 0 ? (
          <EmptyState title="No members match the search" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
              <tr>
                <th className={thClass}>Member</th>
                <th className={thClass}>Tier</th>
                <th className={thClass}>Joined</th>
                <th className={thClass}>Orders</th>
                <th className={thClass}>Total spent</th>
                <th className={`${thClass} text-right`}>Vouchers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filtered.map((customer) => {
                const expanded = expandedId === customer.id;
                const activeCount = customer.vouchers.filter((v) => !v.used).length;
                return (
                  <Fragment key={customer.id}>
                    <tr className="transition-colors hover:bg-[var(--admin-surface-2)]/50">
                      <td className={tdClass}>
                        <p className="font-semibold text-[var(--admin-heading)]">{customer.name}</p>
                        <p className="text-xs text-[var(--admin-muted)]">{customer.phoneNumber}</p>
                      </td>
                      <td className={tdClass}>
                        <StatusBadge status={customer.membership} />
                      </td>
                      <td className={tdClass}>{formatDate(customer.joinedAt)}</td>
                      <td className={tdClass}>{customer.totalOrders}</td>
                      <td className={`${tdClass} font-semibold text-[var(--admin-heading)]`}>
                        {formatRupiah(customer.totalSpent)}
                      </td>
                      <td className={tdClass}>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setExpandedId(expanded ? null : customer.id)}
                            className="text-sm font-bold text-[var(--admin-primary)] hover:underline"
                          >
                            {customer.vouchers.length === 0
                              ? "None"
                              : `${activeCount} active${expanded ? " ▲" : " ▼"}`}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && customer.vouchers.length > 0 && (
                      <tr>
                        <td colSpan={6} className="bg-[var(--admin-surface-2)]/60 px-6 py-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {customer.vouchers.map((voucher) => (
                              <VoucherChip key={voucher.voucherId} voucher={voucher} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {issueOpen && <IssueVoucherModal onClose={() => setIssueOpen(false)} onIssue={handleIssueVoucher} />}
    </div>
  );
}
