"use client";

import ProductForm from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
          Add product
        </h1>
        <p className="text-sm text-[var(--admin-muted)]">Create a new grocery product for the storefront.</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
