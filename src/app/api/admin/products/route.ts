import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

const tagValues = ["popular", "new", "must-try"] as const;

const productInput = {
  name: z.string().trim().min(2, "Name needs at least 2 characters.").max(80),
  description: z.string().trim().max(300).default(""),
  price: z.number().int().min(1, "Price must be at least ৳1.").max(99_999),
  categoryId: z.string().trim().min(1).max(60),
  image: z.string().trim().max(300).default(""),
  imageAlt: z.string().trim().max(300).default(""),
  tags: z.array(z.enum(tagValues)).max(3).default([]),
  isActive: z.boolean().default(true),
  isSignature: z.boolean().default(false),
  signatureTag: z.string().trim().max(30).default(""),
  signatureDescription: z.string().trim().max(300).default(""),
};

const createSchema = z.object(productInput);

const updateSchema = z.object({
  id: z.string().trim().min(1),
  name: productInput.name.optional(),
  description: productInput.description.optional(),
  price: productInput.price.optional(),
  categoryId: productInput.categoryId.optional(),
  image: productInput.image.optional(),
  imageAlt: productInput.imageAlt.optional(),
  tags: z.array(z.enum(tagValues)).max(3).optional(),
  isActive: productInput.isActive.optional(),
  isSignature: productInput.isSignature.optional(),
  signatureTag: productInput.signatureTag.optional(),
  signatureDescription: productInput.signatureDescription.optional(),
});

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

async function uniqueProductId(name: string): Promise<string> {
  const base = slugify(name);
  let id = base;
  for (let i = 2; i < 50; i++) {
    const exists = await db.product.findUnique({ where: { id } });
    if (!exists) return id;
    id = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Serialise a product row for the admin UI. */
function serialise(p: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageAlt: string;
  tags: string;
  categoryId: string;
  isActive: boolean;
  isSignature: boolean;
  signatureTag: string;
  signatureDescription: string;
  signatureSort: number;
  sortOrder: number;
  updatedAt: Date;
  category: { label: string };
}) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    imageAlt: p.imageAlt,
    tags: p.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => (tagValues as readonly string[]).includes(t)),
    categoryId: p.categoryId,
    categoryLabel: p.category.label,
    isActive: p.isActive,
    isSignature: p.isSignature,
    signatureTag: p.signatureTag,
    signatureDescription: p.signatureDescription,
    signatureSort: p.signatureSort,
    sortOrder: p.sortOrder,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const products = await db.product.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ success: true, products: products.map(serialise) });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product details." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const category = await db.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json(
      { success: false, error: "That category does not exist." },
      { status: 400 }
    );
  }

  // New products go last within their category, and last in signature order.
  const [lastInCat, lastSignature] = await Promise.all([
    db.product.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    }),
    data.isSignature
      ? db.product.findFirst({ where: { isSignature: true }, orderBy: { signatureSort: "desc" }, select: { signatureSort: true } })
      : Promise.resolve(null),
  ]);

  const created = await db.product.create({
    data: {
      id: await uniqueProductId(data.name),
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      imageAlt: data.imageAlt || `${data.name} at Waffled Sreemangal`,
      tags: data.tags.join(","),
      categoryId: data.categoryId,
      isActive: data.isActive,
      isSignature: data.isSignature,
      signatureTag: data.signatureTag,
      signatureDescription: data.signatureDescription,
      signatureSort: data.isSignature ? (lastSignature?.signatureSort ?? -1) + 1 : 0,
      sortOrder: (lastInCat?.sortOrder ?? -1) + 1,
    },
    include: { category: true },
  });

  return NextResponse.json({ success: true, product: serialise(created) });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product details." },
      { status: 400 }
    );
  }
  const { id, ...fields } = parsed.data;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
  }

  if (fields.categoryId && fields.categoryId !== existing.categoryId) {
    const category = await db.category.findUnique({ where: { id: fields.categoryId } });
    if (!category) {
      return NextResponse.json(
        { success: false, error: "That category does not exist." },
        { status: 400 }
      );
    }
  }

  // When a product becomes a signature pick for the first time, put it last.
  let signatureSort: number | undefined;
  if (fields.isSignature === true && !existing.isSignature) {
    const last = await db.product.findFirst({
      where: { isSignature: true },
      orderBy: { signatureSort: "desc" },
      select: { signatureSort: true },
    });
    signatureSort = (last?.signatureSort ?? -1) + 1;
  }
  if (fields.isSignature === false) signatureSort = 0;

  const updated = await db.product.update({
    where: { id },
    data: {
      ...fields,
      ...(fields.tags ? { tags: fields.tags.join(",") } : {}),
      ...(signatureSort !== undefined ? { signatureSort } : {}),
    },
    include: { category: true },
  });

  return NextResponse.json({ success: true, product: serialise(updated) });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing product id." }, { status: 400 });
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
