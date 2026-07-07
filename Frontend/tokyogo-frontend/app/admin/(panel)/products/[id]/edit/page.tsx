"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import ProductForm, { ProductFormInitialValues } from "../../components/ProductForm";
import { getProductDetail } from "../../../../../../services/productService";
import { LoadingState, EmptyState } from "../../../../components/ui";

function resolveProductImage(url?: string) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [initialValues, setInitialValues] = useState<ProductFormInitialValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    getProductDetail(productId)
      .then((detail) => {
        if (!detail) {
          setInitialValues(null);
          return;
        }
        setInitialValues({
          name: detail.name ?? "",
          sku: detail.sku ?? "",
          stock: detail.stock != null ? String(detail.stock) : "",
          baseWeight: detail.baseWeight != null ? String(detail.baseWeight) : "",
          brandName: detail.brand,
          categoryName: detail.category,
          subCategory: detail.subCategory,
          description: detail.description ?? "",
          units: (detail.unitList ?? []).map((unit) => ({
            unit: unit.unit,
            convertQuantity: unit.convertQuantity ?? 1,
            basePrice: unit.basePrice ?? 0,
            sellPrice: unit.sellPrice ?? 0,
          })),
          existingImageUrls: (detail.imageList ?? [])
            .map((img) => resolveProductImage(img.url))
            .filter((url): url is string => !!url),
        });
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <LoadingState label="Loading product…" />;

  if (!initialValues) {
    return <EmptyState title="Product not found" hint="It may have been removed, or the ID is invalid." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-headline text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-heading)]">
          Edit product
        </h1>
        <p className="text-sm text-[var(--admin-muted)]">{initialValues.name}</p>
      </div>
      <ProductForm mode="edit" productId={productId} initialValues={initialValues} />
    </div>
  );
}
