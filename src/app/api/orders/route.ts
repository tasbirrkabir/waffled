import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { menu } from "@/content/menu";
import { siteConfig } from "@/content/site";

export const runtime = "nodejs";

const pickupChoices = [
  "ASAP (about 15-25 min)",
  "In 30 minutes",
  "In 1 hour",
  "Tonight, around 7 PM",
  "Tonight, around 8 PM",
  "Tonight, around 9 PM",
] as const;

const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(60, "Name is too long."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .refine((v) => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v), {
      message: "Please enter a valid Bangladeshi phone number, e.g. 01723399638.",
    }),
  pickupTime: z.enum(pickupChoices),
  notes: z.string().trim().max(400).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        qty: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Add at least one item to your order.")
    .max(50, "Too many items in one order. Please call us for big orders."),
});

/** Flat lookup of every menu item, id -> {name, price, category} */
const menuLookup = new Map(
  menu.flatMap((cat) =>
    cat.items.map((item) => [
      item.id,
      { name: item.name, price: item.price, category: cat.label },
    ])
  )
);

function formatTk(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}

async function nextOrderNumber(): Promise<string> {
  const count = await db.order.count();
  return `WF-${String(count + 1).padStart(4, "0")}`;
}

function buildWhatsAppMessage(
  orderNumber: string,
  lines: { name: string; qty: number; price: number }[],
  total: number,
  customerName: string,
  phone: string,
  pickupTime: string,
  notes?: string
): string {
  const itemLines = lines
    .map((l) => `${l.qty}x ${l.name} (${formatTk(l.price * l.qty)})`)
    .join("\n");
  const parts = [
    `New online order ${orderNumber} from the Waffled website`,
    "",
    itemLines,
    "",
    `Total: ${formatTk(total)}`,
    "",
    `Name: ${customerName}`,
    `Phone: ${phone}`,
    `Pickup: ${pickupTime}`,
  ];
  if (notes) {
    parts.push(`Notes: ${notes}`);
  }
  return parts.join("\n");
}

export async function POST(request: Request) {
  // Rate limit: 3 orders per minute per IP
  const ip = getClientIp(request);
  if (!checkRateLimit(`orders:${ip}`, { limit: 3, windowMs: 60_000 })) {
    return NextResponse.json(
      { success: false, error: "Too many orders. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Please check your order details.";
    return NextResponse.json({ success: false, error: firstError }, { status: 400 });
  }

  const { customerName, phone, pickupTime, notes, items } = parsed.data;

  // Re-price every line from the trusted menu (client prices are ignored)
  const priced: { id: string; name: string; price: number; qty: number; category: string }[] = [];
  for (const line of items) {
    const found = menuLookup.get(line.id);
    if (!found) {
      return NextResponse.json(
        { success: false, error: `Sorry, that item is not on our menu right now.` },
        { status: 400 }
      );
    }
    const existing = priced.find((p) => p.id === line.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + line.qty, 20);
    } else {
      priced.push({ id: line.id, ...found, qty: line.qty });
    }
  }

  const total = priced.reduce((sum, l) => sum + l.price * l.qty, 0);

  try {
    let orderNumber = await nextOrderNumber();
    // Handle the rare case of a colliding order number by retrying with a suffix
    let saved = null as Awaited<ReturnType<typeof db.order.create>> | null;
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      try {
        saved = await db.order.create({
          data: {
            orderNumber,
            customerName,
            phone,
            pickupTime,
            notes: notes ?? null,
            items: JSON.stringify(priced.map(({ id, name, price, qty }) => ({ id, name, price, qty }))),
            total,
          },
        });
      } catch {
        orderNumber = `WF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      }
    }
    if (!saved) throw new Error("Could not save order");

    const message = buildWhatsAppMessage(
      saved.orderNumber,
      priced,
      total,
      customerName,
      phone,
      pickupTime,
      notes
    );
    const whatsappUrl = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      orderNumber: saved.orderNumber,
      total,
      whatsappUrl,
    });
  } catch (err) {
    console.error("[api/orders] failed to save order:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong placing your order. Please call us instead." },
      { status: 500 }
    );
  }
}
