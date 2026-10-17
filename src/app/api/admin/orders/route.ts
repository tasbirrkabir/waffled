import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ORDER_STATUSES = ["new", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;

const patchSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(ORDER_STATUSES),
});

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  fulfillment: string;
  address: string | null;
  pickupTime: string;
  paymentMethod: string;
  trxId: string | null;
  notes: string | null;
  items: string;
  total: number;
  status: string;
  createdAt: Date;
};

/** Serialise an order for the admin UI (parses the JSON items column). */
function serialise(o: OrderRow) {
  let items: { id: string; name: string; price: number; qty: number }[] = [];
  try {
    items = JSON.parse(o.items);
  } catch {
    items = [];
  }
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    fulfillment: o.fulfillment,
    address: o.address,
    pickupTime: o.pickupTime,
    paymentMethod: o.paymentMethod,
    trxId: o.trxId,
    notes: o.notes,
    items,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const params = new URL(request.url).searchParams;
  const status = params.get("status")?.trim();
  const q = params.get("q")?.trim().toLowerCase();
  const limit = Math.min(Number(params.get("limit") ?? 100) || 100, 300);

  const where: Record<string, unknown> = {};
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    where.status = status;
  }

  let orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  if (q) {
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    orders: orders.slice(0, limit).map(serialise),
  });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid status update." },
      { status: 400 }
    );
  }

  const existing = await db.order.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }

  const updated = await db.order.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ success: true, order: serialise(updated) });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing order id." }, { status: 400 });
  }

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }

  await db.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
