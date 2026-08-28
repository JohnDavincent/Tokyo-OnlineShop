"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminAuth, getAdminEmail } from "../../../services/adminAuth";

function NavIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
    products: (
      <>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </>
    ),
    transactions: (
      <>
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
      </>
    ),
    customers: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    vouchers: (
      <>
        <path d="M3 8.5V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 7V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-7Z" strokeLinejoin="round" />
        <path d="M14 8.5 10 15.5" strokeLinecap="round" />
        <circle cx="10" cy="9.5" r="1" />
        <circle cx="14" cy="14.5" r="1" />
      </>
    ),
    sales: (
      <>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" strokeLinecap="round" />
        <path d="m7 14 4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    site: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" strokeLinecap="round" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
        <path d="m16 17 5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      {icons[name]}
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products", label: "Product", icon: "products" },
  { href: "/admin/transactions", label: "Transaction", icon: "transactions" },
  { href: "/admin/customers", label: "Customer", icon: "customers" },
  { href: "/admin/vouchers", label: "Voucher", icon: "vouchers" },
  { href: "/admin/sales", label: "Sales", icon: "sales" },
  { href: "/admin/site", label: "Dashboard Panel", icon: "site" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const adminEmail = typeof window !== "undefined" ? getAdminEmail() : null;

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  function handleLogout() {
    clearAdminAuth();
    router.replace("/admin/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-[var(--admin-sidebar-bg)] px-4 py-6">
      <Link href="/admin" className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7bfeb8] font-headline text-lg font-extrabold text-[#003627]">
          T
        </div>
        <div>
          <p className="font-headline text-base font-extrabold tracking-[-0.02em] text-white">Tokyo GO</p>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--admin-sidebar-active-text)]">
            Admin Panel
          </p>
        </div>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--admin-sidebar-active-bg)] text-[var(--admin-sidebar-active-text)]"
                  : "text-[var(--admin-sidebar-text)] hover:bg-white/5 hover:text-white"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        {adminEmail && (
          <p className="truncate px-3 pb-2 text-xs text-[var(--admin-sidebar-text)]" title={adminEmail}>
            {adminEmail}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--admin-sidebar-text)] transition-colors hover:bg-white/5 hover:text-white"
        >
          <NavIcon name="logout" />
          Log out
        </button>
      </div>
    </aside>
  );
}
