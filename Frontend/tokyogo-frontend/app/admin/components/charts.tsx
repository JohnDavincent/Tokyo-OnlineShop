"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactRupiah } from "../lib/format";

const CHART_COLORS = [
  "var(--admin-chart-1)",
  "var(--admin-chart-2)",
  "var(--admin-chart-3)",
  "var(--admin-chart-4)",
];

const tooltipStyle = {
  backgroundColor: "var(--admin-surface)",
  border: "1px solid var(--admin-border)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "var(--admin-text)",
};

const axisTick = { fill: "var(--admin-muted)", fontSize: 11 };

export function RevenueAreaChart<T extends object>({
  data,
  series,
}: {
  data: T[];
  series: Array<{ key: string; label: string }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`admin-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="var(--admin-chart-grid)" vertical={false} />
        <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactRupiah(v)} width={72} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => [
            formatCompactRupiah(Number(value)),
            series.find((s) => s.key === String(name))?.label ?? String(name),
          ]}
        />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5}
            fill={`url(#admin-grad-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart<T extends object>({
  data,
  xKey,
  yKey,
  yLabel,
  currency = false,
}: {
  data: T[];
  xKey: string;
  yKey: string;
  yLabel: string;
  currency?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--admin-chart-grid)" vertical={false} />
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          tickFormatter={currency ? (v: number) => formatCompactRupiah(v) : undefined}
          width={currency ? 72 : 40}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--admin-chart-grid)" }}
          formatter={(value) => [
            currency ? formatCompactRupiah(Number(value)) : Number(value).toLocaleString("id-ID"),
            yLabel,
          ]}
        />
        <Bar dataKey={yKey} fill="var(--admin-chart-1)" radius={[8, 8, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ShareDonutChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95} paddingAngle={3} strokeWidth={0}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={1 - i * 0.12} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value}%`, String(name)]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
