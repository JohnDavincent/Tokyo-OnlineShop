"use client";

import { useEffect, useState } from "react";
import { getHotProducts } from "../../../../services/adminProductService";
import {
  MOCK_CATEGORY_SALES,
  MOCK_MONTHLY_SALES,
  MOCK_SALES_TOTALS,
  MOCK_WEEKLY_ITEMS_SOLD,
} from "../../../../services/adminMocks";
import { ApiProduct } from "../../../../types/api";
import { SectionCard, StatCard, StatusBadge } from "../../components/ui";
import { RevenueAreaChart, ShareDonutChart, SimpleBarChart } from "../../components/charts";
import { formatCompactRupiah, formatRupiah } from "../../lib/format";

/*
 * TODO: connect to backend — no sales/profit statistics endpoints exist yet.
 * Charts and totals are mock data; the best-seller ranking is live from
 * GET /tokyo/gropup/product/hot (top 10 by totalSold).
 */

function StatIcon({ path }: { path: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      {path}
    </svg>
  );
}

export default function AdminSalesPage() {
  const [hotProducts, setHotProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    getHotProducts().then(setHotProducts).catch(() => setHotProducts([]));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCompactRupiah(MOCK_SALES_TOTALS.totalRevenue)}
          mock
          trend={{ value: "9.8%", positive: true }}
          icon={<StatIcon path={<><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" /></>} />}
        />
        <StatCard
          label="Total profit"
          value={formatCompactRupiah(MOCK_SALES_TOTALS.totalProfit)}
          hint={`${Math.round((MOCK_SALES_TOTALS.totalProfit / MOCK_SALES_TOTALS.totalRevenue) * 100)}% margin`}
          mock
          trend={{ value: "6.1%", positive: true }}
          icon={<StatIcon path={<><path d="M3 3v16a2 2 0 0 0 2 2h16" strokeLinecap="round" /><path d="m7 14 4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round" /></>} />}
        />
        <StatCard
          label="Total items sold"
          value={MOCK_SALES_TOTALS.totalItemsSold.toLocaleString("id-ID")}
          mock
          icon={<StatIcon path={<><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6.16" strokeLinecap="round" strokeLinejoin="round" /></>} />}
        />
        <StatCard
          label="Avg. order value"
          value={formatRupiah(MOCK_SALES_TOTALS.averageOrderValue)}
          hint={`${MOCK_SALES_TOTALS.totalOrders.toLocaleString("id-ID")} orders`}
          mock
          icon={<StatIcon path={<><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" /></>} />}
        />
      </div>

      {/* Trend + category share */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Revenue & profit trend" subtitle="Monthly, current year" mock className="xl:col-span-2">
          <RevenueAreaChart
            data={MOCK_MONTHLY_SALES}
            series={[
              { key: "revenue", label: "Revenue" },
              { key: "profit", label: "Profit" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Category share" subtitle="Revenue share by category" mock>
          <ShareDonutChart data={MOCK_CATEGORY_SALES.map((c) => ({ name: c.category, value: c.share }))} />
          <ul className="mt-2 flex flex-col gap-2">
            {MOCK_CATEGORY_SALES.map((cat, index) => (
              <li key={cat.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--admin-muted)]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: `var(--admin-chart-${(index % 4) + 1})`,
                      opacity: 1 - index * 0.12,
                    }}
                  />
                  {cat.category}
                </span>
                <span className="font-semibold text-[var(--admin-heading)]">{formatCompactRupiah(cat.revenue)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Orders + items sold + best sellers */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Orders per month" mock>
          <SimpleBarChart data={MOCK_MONTHLY_SALES} xKey="month" yKey="orders" yLabel="Orders" />
        </SectionCard>

        <SectionCard title="Items sold this week" mock>
          <SimpleBarChart data={MOCK_WEEKLY_ITEMS_SOLD} xKey="day" yKey="itemsSold" yLabel="Items sold" />
        </SectionCard>

        <SectionCard title="Best sellers" subtitle="Live top-10 by units sold">
          {hotProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--admin-muted)]">No best-seller data yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {hotProducts.map((product, index) => (
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
