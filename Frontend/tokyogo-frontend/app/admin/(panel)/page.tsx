"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductList } from "../../../services/productService";
import { getAdminCategories, getHotProducts } from "../../../services/adminProductService";
import { MOCK_MONTHLY_SALES, MOCK_SALES_TOTALS, MOCK_WEEKLY_ITEMS_SOLD } from "../../../services/adminMocks";
import { ApiProduct } from "../../../types/api";
import { MockBadge, SectionCard, StatCard, StatusBadge } from "../components/ui";
import { RevenueAreaChart, SimpleBarChart } from "../components/charts";
import { formatCompactRupiah, formatRupiah } from "../lib/format";

function StatIcon({ path }: { path: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      {path}
    </svg>
  );
}

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [hotProducts, setHotProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    getProductList({
      currentPage: 0, // backend's /list endpoint is 0-based
      pageSize: 1,
      sortBy: "name",
      sortOrder: "asc",
      requestDto: { categoryParentId: null, subCategoryId: null, search: null },
    })
      .then((res) => setProductCount(res.total_items))
      .catch(() => setProductCount(null));

    getAdminCategories()
      .then((cats) => setCategoryCount(cats.length))
      .catch(() => setCategoryCount(null));

    getHotProducts()
      .then(setHotProducts)
      .catch(() => setHotProducts([]));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCompactRupiah(MOCK_SALES_TOTALS.totalRevenue)}
          hint="All time"
          mock
          trend={{ value: "9.8% vs last month", positive: true }}
          icon={<StatIcon path={<><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" /></>} />}
        />
        <StatCard
          label="Total profit"
          value={formatCompactRupiah(MOCK_SALES_TOTALS.totalProfit)}
          hint="All time"
          mock
          trend={{ value: "6.1% vs last month", positive: true }}
          icon={<StatIcon path={<><path d="M3 3v16a2 2 0 0 0 2 2h16" strokeLinecap="round" /><path d="m7 14 4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round" /></>} />}
        />
        <StatCard
          label="Items sold"
          value={MOCK_SALES_TOTALS.totalItemsSold.toLocaleString("id-ID")}
          hint={`${MOCK_SALES_TOTALS.totalOrders.toLocaleString("id-ID")} orders`}
          mock
          icon={<StatIcon path={<><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6.16" strokeLinecap="round" strokeLinejoin="round" /></>} />}
        />
        <StatCard
          label="Products live"
          value={productCount !== null ? productCount.toLocaleString("id-ID") : "—"}
          hint={categoryCount !== null ? `${categoryCount} categories` : undefined}
          icon={<StatIcon path={<><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>} />}
        />
      </div>

      {/* Revenue chart + product summary */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Revenue & profit" subtitle="Monthly, current year" mock className="xl:col-span-2">
          <RevenueAreaChart
            data={MOCK_MONTHLY_SALES}
            series={[
              { key: "revenue", label: "Revenue" },
              { key: "profit", label: "Profit" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Store summary" subtitle="Product management at a glance">
          <ul className="flex flex-col gap-4">
            <li className="flex items-center justify-between">
              <span className="text-sm text-[var(--admin-muted)]">Products live</span>
              <span className="font-headline text-sm font-extrabold text-[var(--admin-heading)]">
                {productCount !== null ? productCount.toLocaleString("id-ID") : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-sm text-[var(--admin-muted)]">Categories</span>
              <span className="font-headline text-sm font-extrabold text-[var(--admin-heading)]">
                {categoryCount !== null ? categoryCount : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                Low stock <MockBadge label="Mock" />
              </span>
              <span className="font-headline text-sm font-extrabold text-[var(--admin-danger)]">
                {MOCK_SALES_TOTALS.lowStockCount}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                Avg. order value <MockBadge label="Mock" />
              </span>
              <span className="font-headline text-sm font-extrabold text-[var(--admin-heading)]">
                {formatRupiah(MOCK_SALES_TOTALS.averageOrderValue)}
              </span>
            </li>
          </ul>
          <Link
            href="/admin/products"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] py-2.5 text-sm font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-primary-soft)]"
          >
            Manage products
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </SectionCard>
      </div>

      {/* Weekly sold + best sellers */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Items sold this week" mock className="xl:col-span-2">
          <SimpleBarChart data={MOCK_WEEKLY_ITEMS_SOLD} xKey="day" yKey="itemsSold" yLabel="Items sold" />
        </SectionCard>

        <SectionCard title="Best sellers" subtitle="Live from the store's top-sold ranking">
          {hotProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--admin-muted)]">No best-seller data yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {hotProducts.slice(0, 6).map((product, index) => (
                <li key={product.productId ?? product.productName} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] font-headline text-xs font-extrabold text-[var(--admin-primary)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--admin-heading)]">{product.productName}</p>
                    <p className="text-xs text-[var(--admin-muted)]">{product.category}</p>
                  </div>
                  <StatusBadge status={product.status} />
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
