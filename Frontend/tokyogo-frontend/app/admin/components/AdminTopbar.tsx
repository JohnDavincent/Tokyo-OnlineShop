"use client";

import { usePathname } from "next/navigation";
import { useAdminTheme } from "./AdminThemeProvider";
import { getAdminEmail } from "../../../services/adminAuth";

const PAGE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/admin/products", title: "Product Management" },
  { prefix: "/admin/transactions", title: "Transactions" },
  { prefix: "/admin/customers", title: "Customers" },
  { prefix: "/admin/sales", title: "Sales & Analytics" },
  { prefix: "/admin/site", title: "Dashboard Panel" },
  { prefix: "/admin", title: "Dashboard" },
];

export default function AdminTopbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAdminTheme();

  const title = PAGE_TITLES.find((p) => pathname.startsWith(p.prefix))?.title ?? "Dashboard";
  const email = typeof window !== "undefined" ? getAdminEmail() : null;
  const initials = email ? email.slice(0, 2).toUpperCase() : "AD";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/90 px-8 py-4 backdrop-blur-xl">
      <h1 className="font-headline text-xl font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-heading)]"
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-xs font-extrabold text-[var(--admin-on-primary)]"
          title={email ?? "Admin"}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
