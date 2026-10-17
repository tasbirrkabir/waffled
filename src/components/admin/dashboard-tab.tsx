"use client";

/**
 * Dashboard tab: stat cards, 14-day chart (recharts — pink revenue area +
 * lime orders bars), top products, status breakdown and recent orders.
 */

import * as React from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  Banknote,
  CalendarDays,
  ChevronRight,
  Cookie,
  Hourglass,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { formatTk } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "./api";
import { useAdminData } from "./use-admin-data";
import { StatusBadge, asStatus, statusMeta } from "./status-badge";
import { compactTk, formatShortDateTime, timeAgo } from "./utils";
import { EmptyState, ErrorState, SkeletonCards, TabToolbar } from "./ui-bits";
import type { AdminAnalytics, DailyPoint } from "./types";

function ChartTip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as DailyPoint | undefined;
  if (!point) return null;
  return (
    <div className="rounded-xl border-2 border-ink bg-surface px-3 py-2.5 text-xs shadow-[3px_3px_0_0_var(--color-ink)]">
      <p className="font-display text-sm font-bold">{point.label}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-muted-warm">
        <span className="h-2 w-2 rounded-full bg-pink" aria-hidden />
        Revenue <strong className="ml-auto text-ink tabular-nums">{formatTk(point.revenue)}</strong>
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-muted-warm">
        <span className="h-2 w-2 rounded-[3px] border border-ink/40 bg-lime" aria-hidden />
        Orders <strong className="ml-auto text-ink tabular-nums">{point.orders}</strong>
      </p>
    </div>
  );
}

export function DashboardTab({ onSeeAllOrders }: { onSeeAllOrders: () => void }) {
  const loader = React.useCallback(
    () => api<AdminAnalytics>("/api/admin/analytics"),
    []
  );
  const { data, loading, error, reload } = useAdminData(loader);

  if (error && !data) {
    return <ErrorState message={error} onRetry={reload} />;
  }
  if (!data) {
    return (
      <div className="space-y-4">
        <TabToolbar title="Dashboard" refreshing={loading} onRefresh={reload} />
        <SkeletonCards count={6} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const s = data.stats;
  const cards = [
    { label: "Total orders", value: String(s.totalOrders), icon: ReceiptText, chip: "bg-cyan-soft text-cyan border-cyan/30" },
    { label: "Total revenue", value: formatTk(s.totalRevenue), icon: Banknote, chip: "bg-lime-soft text-ink border-lime/40" },
    { label: "Today's orders", value: String(s.todayOrders), icon: CalendarDays, chip: "bg-orange-soft text-orange border-orange/30" },
    { label: "Today's revenue", value: formatTk(s.todayRevenue), icon: TrendingUp, chip: "bg-pink-soft text-pink border-pink/30" },
    { label: "Pending orders", value: String(s.pendingOrders), icon: Hourglass, chip: "bg-purple-soft text-purple border-purple/30" },
    { label: "Active products", value: String(s.activeProducts), icon: Cookie, chip: "bg-cream text-ink border-ink/15" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <TabToolbar
        title="Dashboard"
        sub="Sales at a glance — all times are Dhaka time."
        onRefresh={reload}
        refreshing={loading}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border-2 border-ink/10 bg-surface p-3.5 sm:p-4">
            <div className="flex items-center gap-2">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2", c.chip)}>
                <c.icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-[0.68rem] font-bold uppercase leading-tight tracking-wider text-muted-warm">
                {c.label}
              </p>
            </div>
            <p className="mt-2.5 truncate font-display text-xl font-bold tabular-nums sm:text-2xl">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + top products + status breakdown */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border-2 border-ink/10 bg-surface p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold sm:text-lg">Last 14 days</h3>
            <div className="flex items-center gap-3 text-xs font-semibold text-muted-warm">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-pink" aria-hidden />
                Revenue (৳)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] border border-ink/40 bg-lime" aria-hidden />
                Orders
              </span>
            </div>
          </div>
          <div className="mt-3 h-64 sm:h-72" role="img" aria-label="Daily revenue and orders for the last 14 days">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.daily} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F24C8B" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#F24C8B" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0e7dd" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#725e63" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e9dcd8", strokeWidth: 2 }}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="revenue"
                  tickFormatter={compactTk}
                  tick={{ fontSize: 11, fill: "#725e63" }}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#725e63" }}
                  tickLine={false}
                  axisLine={false}
                  width={26}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(32,23,25,0.05)" }} />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F24C8B"
                  strokeWidth={2.5}
                  fill="url(#adminRevFill)"
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  fill="#BCE84A"
                  stroke="#201719"
                  strokeWidth={1.5}
                  radius={[5, 5, 0, 0]}
                  barSize={16}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="space-y-4">
          {/* Top products */}
          <section className="rounded-2xl border-2 border-ink/10 bg-surface p-4 sm:p-5">
            <h3 className="font-display text-base font-bold sm:text-lg">Top products</h3>
            {data.topProducts.length === 0 ? (
              <p className="mt-3 text-sm text-muted-warm">
                No sales yet — this fills in as orders arrive.
              </p>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {data.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="font-display text-xs font-bold text-muted-warm/60 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block text-xs text-muted-warm">{p.qty} sold</span>
                    </span>
                    <span className="shrink-0 font-display text-sm font-bold text-orange tabular-nums">
                      {formatTk(p.revenue)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Status breakdown */}
          <section className="rounded-2xl border-2 border-ink/10 bg-surface p-4 sm:p-5">
            <h3 className="font-display text-base font-bold sm:text-lg">Orders by status</h3>
            {data.statusBreakdown.length === 0 ? (
              <p className="mt-3 text-sm text-muted-warm">No orders yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {data.statusBreakdown.map((b) => {
                  const meta = statusMeta[asStatus(b.status)];
                  return (
                    <li
                      key={b.status}
                      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold", meta.chip)}
                    >
                      {meta.label}
                      <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[0.65rem] tabular-nums">
                        {b.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Recent orders */}
      <section className="overflow-hidden rounded-2xl border-2 border-ink/10 bg-surface">
        <div className="flex items-center justify-between gap-2 border-b-2 border-ink/10 px-4 py-3.5 sm:px-5">
          <h3 className="font-display text-base font-bold sm:text-lg">Recent orders</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onSeeAllOrders}
            className="h-8 rounded-lg border-2 border-ink/15 bg-white px-2.5 text-xs font-bold hover:border-ink"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>

        {data.recentOrders.length === 0 ? (
          <EmptyState
            className="m-4"
            title="No orders yet"
            hint="Once customers start ordering, the latest ones show up here."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Placed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="py-3 font-display text-sm font-bold">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell className="py-3">{o.customerName}</TableCell>
                      <TableCell className="py-3 text-center tabular-nums">{o.itemCount}</TableCell>
                      <TableCell className="py-3 text-right font-display font-bold text-orange tabular-nums">
                        {formatTk(o.total)}
                      </TableCell>
                      <TableCell className="py-3">
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="py-3 text-right text-xs text-muted-warm" title={formatShortDateTime(o.createdAt)}>
                        {timeAgo(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y-2 divide-ink/5 md:hidden">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold">
                      {o.orderNumber}
                      <span className="ml-2 font-sans text-xs font-semibold text-muted-warm">
                        {o.customerName}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-warm">
                      {o.itemCount} item{o.itemCount === 1 ? "" : "s"} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-display text-sm font-bold text-orange tabular-nums">
                      {formatTk(o.total)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
