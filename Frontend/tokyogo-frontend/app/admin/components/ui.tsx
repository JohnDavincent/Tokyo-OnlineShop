"use client";

import { useEffect, useRef, useState } from "react";

/* --- Kebab dropdown menu ------------------------------------
 * Compact secondary-actions menu triggered by a ⋮ button.
 * Closes on outside click and on Escape.
 */

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function KebabMenu({ items, label = "More actions" }: { items: DropdownItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-heading)]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] py-1.5 shadow-[var(--admin-shadow-elevated)]"
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                item.danger
                  ? "text-[var(--admin-danger)] hover:bg-[var(--admin-danger-soft)]"
                  : "text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]"
              } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
            >
              {item.icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Mock badge --------------------------------------------- */

export function MockBadge({ label = "Mock data — backend pending" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--admin-accent-soft)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--admin-accent)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
        <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}

/* --- Section card -------------------------------------------- */

export function SectionCard({
  title,
  subtitle,
  action,
  mock,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  mock?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)] ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              {title && (
                <h2 className="font-headline text-base font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">
                  {title}
                </h2>
              )}
              {mock && <MockBadge />}
            </div>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* --- Stat card ------------------------------------------------ */

export function StatCard({
  label,
  value,
  hint,
  icon,
  mock,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  mock?: boolean;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[var(--admin-shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
          {icon}
        </div>
        {mock && <MockBadge label="Mock" />}
      </div>
      <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-headline text-2xl font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-bold ${trend.positive ? "text-[var(--admin-primary)]" : "text-[var(--admin-danger)]"}`}>
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}

/* --- Status badges -------------------------------------------- */

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
  NEW: "bg-[var(--admin-info-soft)] text-[var(--admin-info)]",
  OUT_OF_STOCK: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
  REMOVED: "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
  IS_NOT_AVAILABLE: "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
  FLASH_SALE: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
  PENDING: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
  SUCCESS: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
  FAILED: "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
  VIP: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
  REGULAR: "bg-[var(--admin-info-soft)] text-[var(--admin-info)]",
  // Voucher lifecycle
  ONGOING: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
  SCHEDULED: "bg-[var(--admin-info-soft)] text-[var(--admin-info)]",
  ENDED: "bg-[var(--admin-surface-2)] text-[var(--admin-muted)]",
  CANCELLED: "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-[var(--admin-surface-2)] text-[var(--admin-muted)]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] ${style}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

/* --- Spinner --------------------------------------------------- */

export function Spinner({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-4 border-[var(--admin-primary)]/20 border-t-[var(--admin-primary)] ${className}`} />
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--admin-muted)]">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-14 text-center">
      <p className="text-sm font-semibold text-[var(--admin-heading)]">{title}</p>
      {hint && <p className="text-xs text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}

/* --- Modal ------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`admin-modal-panel relative max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-elevated)] transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-headline text-lg font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)]"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* --- Form primitives --------------------------------------------- */

export const inputClass =
  "w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]/60 outline-none transition-colors focus:border-[var(--admin-primary)]";

export const labelClass =
  "mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-[var(--admin-on-primary)] shadow-[0_4px_16px_rgba(0,105,65,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[var(--admin-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-2.5 text-sm font-bold text-[var(--admin-heading)] transition-colors hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-danger-soft)] px-5 py-2.5 text-sm font-bold text-[var(--admin-danger)] transition-colors hover:bg-[var(--admin-danger)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

/* --- Table primitives ---------------------------------------------- */

export const thClass =
  "px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--admin-heading)]";

export const tdClass = "px-4 py-3.5 text-sm text-[var(--admin-text)]";
