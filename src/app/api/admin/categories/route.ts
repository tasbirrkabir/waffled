import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

const createSchema = z.object({
  label: z.string().trim().min(2, "Category name needs at least 2 characters.").max(60),
  blurb: z.string().trim().max(200).default(""),
});

const updateSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(2).max(60).optional(),
  blurb: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "category"
  );
}

async function uniqueCategoryId(label: string): Promise<string> {
  const base = slugify(label);
  let id = base;
  for (let i = 2; i < 50; i++) {
    const exists = await db.category.findUnique({ where: { id } });
    if (!exists) return id;
    id = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({
    success: true,
    categories: categories.map((c) => ({
      id: c.id,
      label: c.label,
      blurb: c.blurb,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
    })),
  });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category name." },
      { status: 400 }
    );
  }

  const last = await db.category.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  const created = await db.category.create({
    data: {
      id: await uniqueCategoryId(parsed.data.label),
      label: parsed.data.label,
      blurb: parsed.data.blurb,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  return NextResponse.json({
    success: true,
    category: { id: created.id, label: created.label, blurb: created.blurb, sortOrder: created.sortOrder, productCount: 0 },
  });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category details." },
      { status: 400 }
    );
  }
  const { id, ...fields } = parsed.data;

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
  }

  const updated = await db.category.update({ where: { id }, data: fields });
  return NextResponse.json({ success: true, category: { id: updated.id, label: updated.label, blurb: updated.blurb, sortOrder: updated.sortOrder } });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing category id." }, { status: 400 });
  }

  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { success: false, error: `Move or delete the ${count} product(s) in this category first.` },
      { status: 409 }
    );
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
