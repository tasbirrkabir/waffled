import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

/** Asia/Dhaka is UTC+6 with no DST. */
const DHAKA_OFFSET_MS = 6 * 3600_000;

/** Start of the given day in Dhaka time, returned as a UTC Date. */
function dhakaDayStart(offsetDays = 0): Date {
  const now = new Date(Date.now() + DHAKA_OFFSET_MS + offsetDays * 86_400_000);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DHAKA_OFFSET_MS
  );
}

type Item = { id: string; name: string; price: number; qty: number };

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
  const activeProducts = await db.product.count({ where: { isActive: true } });

  const counted = orders.filter((o) => o.status !== "cancelled");

  const totalRevenue = counted.reduce((sum, o) => sum + o.total, 0);
  const todayStart = dhakaDayStart();
  const todayOrders = counted.filter((o) => o.createdAt >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) =>
    ["new", "confirmed", "preparing"].includes(o.status)
  ).length;

  // Last 14 days series (oldest → newest), Dhaka days
  const daily: { date: string; label: string; orders: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const start = dhakaDayStart(-i);
    const end = dhakaDayStart(-i + 1);
    const inDay = counted.filter((o) => o.createdAt >= start && o.createdAt < end);
    const label = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Dhaka",
    });
    daily.push({
      date: start.toISOString().slice(0, 10),
      label,
      orders: inDay.length,
      revenue: inDay.reduce((sum, o) => sum + o.total, 0),
    });
  }

  // Top products by quantity sold
  const byProduct = new Map<string, { qty: number; revenue: number }>();
  for (const o of counted) {
    let items: Item[] = [];
    try {
      items = JSON.parse(o.items);
    } catch {
      items = [];
    }
    for (const it of items) {
      const agg = byProduct.get(it.name) ?? { qty: 0, revenue: 0 };
      agg.qty += it.qty;
      agg.revenue += it.price * it.qty;
      byProduct.set(it.name, agg);
    }
  }
  const topProducts = [...byProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Status breakdown
  const statusOrder = ["new", "confirmed", "preparing", "ready", "completed", "cancelled"];
  const statusBreakdown = statusOrder
    .map((status) => ({ status, count: orders.filter((o) => o.status === status).length }))
    .filter((s) => s.count > 0);

  const recentOrders = orders.slice(0, 8).map((o) => {
    let items: Item[] = [];
    try {
      items = JSON.parse(o.items);
    } catch {
      items = [];
    }
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      itemCount: items.reduce((n, it) => n + it.qty, 0),
      createdAt: o.createdAt.toISOString(),
    };
  });

  return NextResponse.json({
    success: true,
    stats: {
      totalOrders: orders.length,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
      pendingOrders,
      activeProducts,
    },
    daily,
    topProducts,
    statusBreakdown,
    recentOrders,
  });
}
