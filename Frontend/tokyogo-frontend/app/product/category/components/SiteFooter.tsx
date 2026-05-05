"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/65">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <p className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">Tokyo GO</p>
          <p className="mt-3 text-sm text-on-surface/55">&copy; 2024 Tokyo GO. Precision Freshness.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-on-surface/58">
          <Link href="/">About Us</Link>
          <Link href="/">Sustainability</Link>
          <Link href="/">Shipping Policy</Link>
          <Link href="/">Contact Support</Link>
          <Link href="/">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
