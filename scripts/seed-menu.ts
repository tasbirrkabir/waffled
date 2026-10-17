/**
 * Seeds the Category / Product / SiteSetting tables from the static menu
 * content in src/content/menu.ts. Idempotent: existing rows are updated,
 * missing rows are created. Run with: bun scripts/seed-menu.ts
 */
import { PrismaClient } from "@prisma/client";
import { menu, signaturePicks } from "../src/content/menu";

const db = new PrismaClient();

/** Current hero image hardcoded in the hero section (first seed only) */
const DEFAULT_HERO = {
  key: "hero_image",
  value: "/images/hero-waffle-gmaps.webp",
};
const DEFAULT_HERO_ALT = {
  key: "hero_image_alt",
  value:
    "Chocolate-glazed waffle pops on sticks served in purple boxes at Waffled Sreemangal",
};

async function main() {
  console.log("Seeding categories & products…");

  for (let ci = 0; ci < menu.length; ci++) {
    const cat = menu[ci];

    await db.category.upsert({
      where: { id: cat.id },
      create: { id: cat.id, label: cat.label, blurb: cat.blurb, sortOrder: ci },
      update: { label: cat.label, blurb: cat.blurb, sortOrder: ci },
    });

    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii];
      const sig = signaturePicks.find((s) => s.id === item.id);

      await db.product.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          imageAlt: item.imageAlt,
          tags: (item.tags ?? []).join(","),
          categoryId: cat.id,
          isActive: true,
          isSignature: !!sig,
          signatureTag: sig?.tag ?? "",
          signatureDescription: sig?.description ?? "",
          signatureSort: sig ? signaturePicks.indexOf(sig) : 0,
          sortOrder: ii,
        },
        update: {
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          imageAlt: item.imageAlt,
          tags: (item.tags ?? []).join(","),
          categoryId: cat.id,
          isSignature: !!sig,
          signatureTag: sig?.tag ?? "",
          signatureDescription: sig?.description ?? "",
          signatureSort: sig ? signaturePicks.indexOf(sig) : 0,
          sortOrder: ii,
        },
      });
    }
  }

  for (const setting of [DEFAULT_HERO, DEFAULT_HERO_ALT]) {
    const existing = await db.siteSetting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await db.siteSetting.create({ data: setting });
    }
  }

  const categories = await db.category.count();
  const products = await db.product.count();
  const settings = await db.siteSetting.count();
  const signature = await db.product.count({ where: { isSignature: true } });
  console.log(
    `Done. ${categories} categories, ${products} products (${signature} signature picks), ${settings} settings.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
