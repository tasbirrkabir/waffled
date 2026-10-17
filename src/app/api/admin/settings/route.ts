import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

const patchSchema = z.object({
  heroImage: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || v.startsWith("/"), "Image path must start with /")
    .optional(),
  heroImageAlt: z.string().trim().max(300).optional(),
});

async function currentSettings() {
  const rows = await db.siteSetting.findMany({
    where: { key: { in: ["hero_image", "hero_image_alt"] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    heroImage: map.get("hero_image") ?? "",
    heroImageAlt: map.get("hero_image_alt") ?? "",
  };
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, settings: await currentSettings() });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid settings." },
      { status: 400 }
    );
  }

  const { heroImage, heroImageAlt } = parsed.data;

  if (heroImage !== undefined) {
    await db.siteSetting.upsert({
      where: { key: "hero_image" },
      create: { key: "hero_image", value: heroImage },
      update: { value: heroImage },
    });
  }
  if (heroImageAlt !== undefined) {
    await db.siteSetting.upsert({
      where: { key: "hero_image_alt" },
      create: { key: "hero_image_alt", value: heroImageAlt },
      update: { value: heroImageAlt },
    });
  }

  return NextResponse.json({ success: true, settings: await currentSettings() });
}
