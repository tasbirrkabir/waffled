import { db } from "@/lib/db";
import { menu, signaturePicks } from "@/content/menu";
import type { MenuCategory, MenuTag, SignaturePick } from "@/content/menu";

/**
 * Server-side helpers that read the live menu from the database (managed via
 * the admin panel). Every helper falls back to the static content in
 * src/content/menu.ts when the database is empty or unreachable, so the
 * public site keeps working even if the DB has a hiccup.
 */

function parseTags(raw: string): MenuTag[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is MenuTag => t === "popular" || t === "new" || t === "must-try");
}

/** Full menu grouped by category, active products only. */
export async function getMenu(): Promise<MenuCategory[]> {
  try {
    const [categories, products] = await Promise.all([
      db.category.findMany({ orderBy: { sortOrder: "asc" } }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    if (categories.length === 0) return menu;

    return categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      blurb: cat.blurb,
      items: products
        .filter((p) => p.categoryId === cat.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          tags: parseTags(p.tags),
          image: p.image,
          imageAlt: p.imageAlt,
        })),
    }));
  } catch (err) {
    console.error("[menu-data] falling back to static menu:", err);
    return menu;
  }
}

/** Products flagged as signature picks for the home page section. */
export async function getSignaturePicks(): Promise<SignaturePick[]> {
  try {
    const rows = await db.product.findMany({
      where: { isActive: true, isSignature: true },
      orderBy: [{ signatureSort: "asc" }, { sortOrder: "asc" }],
    });
    if (rows.length === 0) return signaturePicks.map((s) => ({ ...s }));

    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.signatureDescription || p.description,
      price: p.price,
      image: p.image,
      alt: p.imageAlt || `${p.name} at Demo Waffles`,
      tag: p.signatureTag || "Must try",
    }));
  } catch (err) {
    console.error("[menu-data] falling back to static signature picks:", err);
    return signaturePicks.map((s) => ({ ...s }));
  }
}

/** Hero image shown at the top of the home page. */
export async function getHeroImage(): Promise<{ src: string; alt: string }> {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: ["hero_image", "hero_image_alt"] } },
    });
    const map = new Map<string, string>(rows.map((r) => [r.key, r.value]));
    const src = map.get("hero_image");
    if (!src) {
      return {
        src: "/images/hero-waffle-gmaps.webp",
        alt: "Demo waffle pops on sticks served fresh in boxes",
      };
    }
    return {
      src,
      alt: map.get("hero_image_alt") || "Fresh demo waffle pops at Demo Waffles",
    };
  } catch (err) {
    console.error("[menu-data] falling back to static hero image:", err);
    return {
      src: "/images/hero-waffle-gmaps.webp",
      alt: "Demo waffle pops on sticks served fresh in boxes",
    };
  }
}
