"use client";

import Link from "next/link";
import { SearchIcon, UserIcon, CartIcon } from "./Icons";

const topNav = ["Categories", "Wholesale", "Deals", "Rewards"];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">
          Tokyo GO
        </Link>

        <nav className="hidden items-center gap-10 text-[0.98rem] text-on-surface/80 md:flex">
          {topNav.map((item) => (
            <Link key={item} href="/" className="transition-colors duration-200 hover:text-primary">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-primary">
          <button aria-label="Search" className="transition-transform duration-200 hover:scale-110">
            <SearchIcon />
          </button>
          <Link href="/login" aria-label="Account" className="transition-transform duration-200 hover:scale-110">
            <UserIcon />
          </Link>
          <button aria-label="Cart" className="transition-transform duration-200 hover:scale-110">
            <CartIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
