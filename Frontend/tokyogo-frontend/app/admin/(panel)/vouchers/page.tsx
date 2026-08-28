"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminAuthRequiredError } from "../../../../services/adminAuth";
import {
  DISCOUNT_TYPES,
  DiscountType,
  VOUCHER_AUDIENCES,
  VOUCHER_TYPES,
  VoucherAudience,
  VoucherDetail,
  VoucherListFilter,
  VoucherListItem,
  VoucherStatus,
  VoucherType,
  humanizeEnum,
  listVouchers,
} from "../../../../services/adminVoucherService";
import {
  EmptyState,
  LoadingState,
  StatusBadge,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  tdClass,
  thClass,
} from "../../components/ui";
import { formatDateTime } from "../../lib/format";
import VoucherFormModal from "./components/VoucherFormModal";

const PAGE_SIZE = 10;

type StatusTab = "ALL" | VoucherStatus;

const STATUS_TABS: Array<{ key: StatusTab; label: string }> = [
  { key: "ALL", label: "All vouchers" },
  { key: "ONGOING", label: "Ongoing" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "ENDED", label: "Ended" },
  { key: "CANCELLED", label: "Cancelled" },
];

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "createdAt:DESC", label: "Newest created" },
  { value: "createdAt:ASC", label: "Oldest created" },
  { value: "startAt:DESC", label: "Latest start date" },
  { value: "startAt:ASC", label: "Earliest start date" },
  { value: "endAt:ASC", label: "Ending soonest" },
  { value: "title:ASC", label: "Title A→Z" },
  { value: "usedCount:DESC", label: "Most used" },
];

const Icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" />
    </svg>
  ),
};

/* --- Period cell ------------------------------------------------
 * Start/end on two lines plus a "x days left" hint, so an admin can
 * spot a voucher about to expire without doing date maths.
 */

function PeriodCell({ start, end }: { start: string | null; end: string | null }) {
  const daysLeft = (() => {
    if (!end) return null;
    // Display-only countdown; a stale value between renders is harmless.
    // eslint-disable-next-line react-hooks/purity
    const diff = new Date(end).getTime() - Date.now();
    if (Number.isNaN(diff) || diff < 0) return null;
    return Math.ceil(diff / 86_400_000);
  })();

  return (
    <div className="leading-tight">
      <p className="text-xs text-[var(--admin-text)]">{start ? formatDateTime(start) : "—"}</p>
      <p className="text-xs text-[var(--admin-muted)]">
        {end ? `→ ${formatDateTime(end)}` : "→ no end date"}
      </p>
      {daysLeft != null && daysLeft <= 7 && (
        <p className="mt-0.5 text-[11px] font-bold text-[var(--admin-accent)]">
          {daysLeft === 0 ? "Ends today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </p>
      )}
    </div>
  );
}

function CodeCell({ code }: { code: string | null }) {
  if (!code) return <span className="text-[var(--admin-muted)]">—</span>;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(
          () => toast.success(`Copied ${code}`),
          () => toast.error("Could not copy the code"),
        );
      }}
      title="Copy code"
      className="group inline-flex items-center gap-2 rounded-lg bg-[var(--admin-surface-2)] px-2.5 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--admin-heading)] transition-colors hover:bg-[var(--admin-primary-soft)]"
    >
      {code}
      <span className="text-[var(--admin-muted)] opacity-0 transition-opacity group-hover:opacity-100">{Icons.copy}</span>
    </button>
  );
}

function StatTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[130px] flex-1 flex-col rounded-2xl border px-4 py-3 text-left transition-all ${
        active
          ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]"
          : "border-[var(--admin-border)] bg-[var(--admin-surface)] hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-card)]"
      }`}
    >
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">{label}</span>
      <span
        className={`mt-1 font-headline text-2xl font-extrabold tracking-[-0.03em] ${
          active ? "text-[var(--admin-primary)]" : "text-[var(--admin-heading)]"
        }`}
      >
        {count == null ? "—" : count.toLocaleString("id-ID")}
      </span>
    </button>
  );
}

/* --- Page -------------------------------------------------------- */

export default function AdminVouchersPage() {
  const router = useRouter();

  const [vouchers, setVouchers] = useState<VoucherListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // 0-based, matching the backend
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [voucherType, setVoucherType] = useState<VoucherType | "">("");
  const [discountType, setDiscountType] = useState<DiscountType | "">("");
  const [audience, setAudience] = useState<VoucherAudience | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortValue, setSortValue] = useState("createdAt:DESC");
  const [showFilters, setShowFilters] = useState(false);

  // Status counts for the tabs (one unpaged fetch, refreshed with the list).
  const [counts, setCounts] = useState<Record<StatusTab, number> | null>(null);

  // Modals. The list endpoint returns summary rows only, so we cache the
  // full DTOs that create/update hand back and reuse them to prefill edits.
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VoucherListItem | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, VoucherDetail>>({});

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof AdminAuthRequiredError) {
        router.replace("/admin/login");
        return;
      }
      toast.error(error instanceof Error ? error.message : fallback);
    },
    [router],
  );

  const buildFilter = useCallback(
    (currentPage: number, searchTerm: string): VoucherListFilter => {
      const [sortBy, sort] = sortValue.split(":") as [VoucherListFilter["sortBy"], "ASC" | "DESC"];
      return {
        currentPage,
        pageSize: PAGE_SIZE,
        pageable: true,
        sortBy,
        sort,
        search: searchTerm.trim() || null,
        voucherStatus: statusTab === "ALL" ? null : statusTab,
        voucherType: voucherType || null,
        discountType: discountType || null,
        audience: audience || null,
        startDate: startDate ? `${startDate}T00:00:00` : null,
        endDate: endDate ? `${endDate}T23:59:59` : null,
      };
    },
    [sortValue, statusTab, voucherType, discountType, audience, startDate, endDate],
  );

  const loadVouchers = useCallback(
    async (currentPage: number, searchTerm: string) => {
      setLoading(true);
      try {
        const result = await listVouchers(buildFilter(currentPage, searchTerm));
        setVouchers(result.items);
        setTotalPages(Math.max(1, result.totalPages));
        setTotalItems(result.totalItems);
      } catch (error) {
        handleError(error, "Failed to load vouchers");
        setVouchers([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [buildFilter, handleError],
  );

  // Status tallies come from one unpaged fetch so the tabs stay accurate
  // regardless of which page or filter the table is showing.
  const loadCounts = useCallback(async () => {
    try {
      const all = await listVouchers({ pageable: false });
      const tally: Record<StatusTab, number> = {
        ALL: all.items.length,
        ONGOING: 0,
        SCHEDULED: 0,
        ENDED: 0,
        CANCELLED: 0,
      };
      all.items.forEach((item) => {
        if (item.voucherStatus && item.voucherStatus in tally) tally[item.voucherStatus] += 1;
      });
      setCounts(tally);
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => {
    loadVouchers(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusTab, voucherType, discountType, audience, startDate, endDate, sortValue]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // "/" focuses the search box, matching the products page shortcut.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
      loadVouchers(0, value);
    }, 400);
  }

  function changeStatusTab(next: StatusTab) {
    setStatusTab(next);
    setPage(0);
  }

  function resetFilters() {
    setVoucherType("");
    setDiscountType("");
    setAudience("");
    setStartDate("");
    setEndDate("");
    setSortValue("createdAt:DESC");
    setPage(0);
  }

  function handleSaved(saved: VoucherDetail) {
    setDetailCache((prev) => ({ ...prev, [saved.id]: saved }));
    setCreateOpen(false);
    setEditTarget(null);
    loadVouchers(page, search);
    loadCounts();
  }

  const activeFilterCount = [voucherType, discountType, audience, startDate, endDate].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Status tabs double as the headline stats */}
      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map((tab) => (
          <StatTab
            key={tab.key}
            label={tab.label}
            count={counts ? counts[tab.key] : null}
            active={statusTab === tab.key}
            onClick={() => changeStatusTab(tab.key)}
          />
        ))}
      </div>

      {/* Search + actions */}
      <div className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-[var(--admin-shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]">
              {Icons.search}
            </span>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search voucher title or code…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] py-3.5 pl-12 pr-24 text-base font-medium text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-muted)]/60 focus:border-[var(--admin-primary)]"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 font-mono text-[0.65rem] font-bold text-[var(--admin-muted)] md:inline-block">
              /
            </kbd>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`${secondaryButtonClass} py-3.5`}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[var(--admin-primary)] px-1.5 py-0.5 text-[0.6rem] font-bold text-[var(--admin-on-primary)]">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button type="button" onClick={() => setCreateOpen(true)} className={`${primaryButtonClass} py-3.5`}>
            {Icons.plus}
            Create voucher
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[var(--admin-border)] pt-4 md:grid-cols-3 xl:grid-cols-6">
            <div>
              <label htmlFor="f-type" className={labelClass}>
                Voucher type
              </label>
              <select
                id="f-type"
                value={voucherType}
                onChange={(e) => {
                  setVoucherType(e.target.value as VoucherType | "");
                  setPage(0);
                }}
                className={inputClass}
              >
                <option value="">All</option>
                {VOUCHER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {humanizeEnum(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-discount" className={labelClass}>
                Discount type
              </label>
              <select
                id="f-discount"
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value as DiscountType | "");
                  setPage(0);
                }}
                className={inputClass}
              >
                <option value="">All</option>
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {humanizeEnum(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-audience" className={labelClass}>
                Audience
              </label>
              <select
                id="f-audience"
                value={audience}
                onChange={(e) => {
                  setAudience(e.target.value as VoucherAudience | "");
                  setPage(0);
                }}
                className={inputClass}
              >
                <option value="">All</option>
                {VOUCHER_AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {humanizeEnum(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-start" className={labelClass}>
                Starts from
              </label>
              <input
                id="f-start"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="f-end" className={labelClass}>
                Starts before
              </label>
              <input
                id="f-end"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="f-sort" className={labelClass}>
                Sort by
              </label>
              <select
                id="f-sort"
                value={sortValue}
                onChange={(e) => {
                  setSortValue(e.target.value);
                  setPage(0);
                }}
                className={inputClass}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className="md:col-span-3 xl:col-span-6">
                <button type="button" onClick={resetFilters} className={`${secondaryButtonClass} !py-2 text-xs`}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <p className="mt-3 text-xs text-[var(--admin-muted)]">
            {search.trim()
              ? `${totalItems.toLocaleString("id-ID")} result${totalItems === 1 ? "" : "s"} for “${search.trim()}”`
              : `${totalItems.toLocaleString("id-ID")} voucher${totalItems === 1 ? "" : "s"} in this view`}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
        {loading ? (
          <LoadingState label="Loading vouchers…" />
        ) : vouchers.length === 0 ? (
          <EmptyState
            title="No vouchers found"
            hint={
              search.trim() || activeFilterCount > 0
                ? "Try a different search or clear the filters."
                : "Create your first voucher to get started."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                <tr>
                  <th className={thClass}>Code</th>
                  <th className={thClass}>Voucher</th>
                  <th className={thClass}>Type</th>
                  <th className={thClass}>Period</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {vouchers.map((voucher) => (
                  <tr key={voucher.voucherId} className="transition-colors hover:bg-[var(--admin-surface-2)]/50">
                    <td className={`${tdClass} align-top`}>
                      <CodeCell code={voucher.voucherCode} />
                    </td>
                    <td className={`${tdClass} align-top`}>
                      <p className="font-extrabold tracking-tight text-[var(--admin-heading)]">
                        {voucher.voucherTitle || "Untitled voucher"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--admin-muted)]">
                        {voucher.voucherId.slice(0, 8)}
                      </p>
                    </td>
                    <td className={`${tdClass} align-top`}>
                      <p className="text-xs font-semibold text-[var(--admin-heading)]">
                        {humanizeEnum(voucher.voucherType)}
                      </p>
                      <p className="text-xs text-[var(--admin-muted)]">{humanizeEnum(voucher.discountType)}</p>
                    </td>
                    <td className={`${tdClass} align-top`}>
                      <PeriodCell start={voucher.startDate} end={voucher.endDate} />
                    </td>
                    <td className={`${tdClass} align-top`}>
                      {voucher.voucherStatus ? <StatusBadge status={voucher.voucherStatus} /> : "—"}
                    </td>
                    <td className={`${tdClass} align-top`}>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setEditTarget(voucher)}
                          className={`${secondaryButtonClass} !px-3.5 !py-2 text-xs`}
                        >
                          {Icons.edit}
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && vouchers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--admin-muted)]">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              className={secondaryButtonClass}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={secondaryButtonClass}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {createOpen && (
        <VoucherFormModal mode="create" onClose={() => setCreateOpen(false)} onSaved={handleSaved} />
      )}

      {editTarget && (
        <VoucherFormModal
          mode="edit"
          target={editTarget}
          detail={detailCache[editTarget.voucherId]}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
