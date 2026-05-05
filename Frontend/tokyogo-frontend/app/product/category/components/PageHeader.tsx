"use client";

import Link from "next/link";
import { ArrowRightIcon } from "./Icons";

interface PageHeaderProps {
  activeCategoryName: string;
  activeSubCategoryName: string;
  totalItems: number;
}

export function PageHeader({ activeCategoryName, activeSubCategoryName, totalItems }: PageHeaderProps) {
  return (
    <section className="bg-white border-b border-black/[0.04]">
      <div className="mx-auto max-w-[1180px] px-6 py-6 lg:px-8">
        <nav className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-black/35">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ArrowRightIcon className="h-3 w-3" />
          <span className="text-black/70">{activeCategoryName || "All Products"}</span>
          {activeSubCategoryName && (
            <>
              <ArrowRightIcon className="h-3 w-3" />
              <span className="text-black/70">{activeSubCategoryName}</span>
            </>
          )}
        </nav>
        <h1 className="mt-3 font-headline text-[2.4rem] font-extrabold tracking-[-0.04em] text-[#101210]">
          {activeSubCategoryName || activeCategoryName || "All Products"}
        </h1>
        <p className="mt-1 text-base text-on-surface/60">
          {totalItems} product{totalItems !== 1 ? "s" : ""} available
        </p>
      </div>
    </section>
  );
}
