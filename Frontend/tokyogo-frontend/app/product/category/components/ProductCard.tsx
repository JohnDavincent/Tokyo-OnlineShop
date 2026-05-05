"use client";

import Link from "next/link";
import { ApiProduct } from "../../../../types/api";
import { ArrowRightIcon } from "./Icons";
import { resolveProductImage, normalizeUnit, getPriceRange } from "../lib/helpers";

interface ProductCardProps {
  product: ApiProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceRange = getPriceRange(product.unitList);
  const isAvail = product.status === "AVAILABLE";

  return (
    <article className="group flex flex-col rounded-[20px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,39,25,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,39,25,0.1)] overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${isAvail ? "bg-emerald-500/90 text-white" : "bg-black/60 text-white"}`}
        >
          {isAvail ? "Available" : "Out of Stock"}
        </div>
        <div className="relative aspect-[1/0.95] bg-slate-100 overflow-hidden">
          <img
            src={resolveProductImage(product.url)}
            alt={product.altText || product.productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveProductImage(); }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary truncate">
          {product.subCategory || product.category}
        </p>
        <h3 className="mt-1.5 font-headline text-[1.2rem] font-bold leading-tight tracking-[-0.03em] text-[#131713] line-clamp-2 min-h-[3rem]">
          {product.productName}
        </h3>

        {/* Price */}
        <div className="mt-3">
          {priceRange ? (
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[#101210]">{priceRange}</span>
          ) : (
            <span className="text-sm font-bold text-black/30">Price unavailable</span>
          )}
        </div>

        {/* Unit badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {product.unitList?.slice(0, 2).map((unitItem) => {
            const norm = normalizeUnit(unitItem.unit);
            const unavailable = unitItem.status !== "AVAILABLE";
            return (
              <span
                key={unitItem.unit}
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[0.65rem] font-bold ${unavailable ? "bg-black/[0.03] text-black/25 line-through" : "bg-[#f0fdf4] text-primary"}`}
              >
                {norm} {unavailable ? "(N/A)" : `Rp ${unitItem.sellPrice.toLocaleString("id-ID")}`}
              </span>
            );
          })}
          {product.unitList && product.unitList.length > 2 && (
            <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[0.65rem] font-bold bg-black/[0.03] text-black/40">
              +{product.unitList.length - 2} more
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/product/${product.productId || product.id}`}
          className="mt-auto pt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(0,105,65,0.28)] active:translate-y-0"
        >
          View Details
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
