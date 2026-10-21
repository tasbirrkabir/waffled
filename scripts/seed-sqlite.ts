import { Database } from "bun:sqlite";
import { menu, signaturePicks } from "../src/content/menu";

const db = new Database("db/custom.db");

console.log("Seeding SQLite database directly with demo content...");

// 1. Update categories
const upsertCategory = db.prepare(`
  INSERT INTO Category (id, label, blurb, sortOrder)
  VALUES ($id, $label, $blurb, $sortOrder)
  ON CONFLICT(id) DO UPDATE SET
    label = excluded.label,
    blurb = excluded.blurb,
    sortOrder = excluded.sortOrder
`);

// 2. Update products
const upsertProduct = db.prepare(`
  INSERT INTO Product (
    id, name, description, price, image, imageAlt, tags,
    categoryId, isActive, isSignature, signatureTag, signatureDescription,
    signatureSort, sortOrder, createdAt, updatedAt
  ) VALUES (
    $id, $name, $description, $price, $image, $imageAlt, $tags,
    $categoryId, $isActive, $isSignature, $signatureTag, $signatureDescription,
    $signatureSort, $sortOrder, $createdAt, $updatedAt
  )
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    image = excluded.image,
    imageAlt = excluded.imageAlt,
    tags = excluded.tags,
    categoryId = excluded.categoryId,
    isActive = excluded.isActive,
    isSignature = excluded.isSignature,
    signatureTag = excluded.signatureTag,
    signatureDescription = excluded.signatureDescription,
    signatureSort = excluded.signatureSort,
    sortOrder = excluded.sortOrder,
    updatedAt = excluded.updatedAt
`);

// 3. Update settings
const upsertSetting = db.prepare(`
  INSERT INTO SiteSetting (key, value)
  VALUES ($key, $value)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

const now = new Date().toISOString();

db.transaction(() => {
  for (let ci = 0; ci < menu.length; ci++) {
    const cat = menu[ci];
    upsertCategory.run({
      $id: cat.id,
      $label: cat.label,
      $blurb: cat.blurb,
      $sortOrder: ci,
    });

    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii];
      const sig = signaturePicks.find((s) => s.id === item.id);

      upsertProduct.run({
        $id: item.id,
        $name: item.name,
        $description: item.description,
        $price: item.price,
        $image: item.image,
        $imageAlt: item.imageAlt,
        $tags: (item.tags ?? []).join(","),
        $categoryId: cat.id,
        $isActive: 1,
        $isSignature: sig ? 1 : 0,
        $signatureTag: sig?.tag ?? "",
        $signatureDescription: sig?.description ?? "",
        $signatureSort: sig ? signaturePicks.indexOf(sig) : 0,
        $sortOrder: ii,
        $createdAt: now,
        $updatedAt: now,
      });
    }
  }

  upsertSetting.run({
    $key: "hero_image",
    $value: "/images/hero-waffle-gmaps.webp",
  });
  upsertSetting.run({
    $key: "hero_image_alt",
    $value: "Demo waffle pops on sticks served fresh in boxes",
  });
})();

const catCount = db.query("SELECT COUNT(*) as c FROM Category").get() as { c: number };
const prodCount = db.query("SELECT COUNT(*) as c FROM Product").get() as { c: number };
const sigCount = db.query("SELECT COUNT(*) as c FROM Product WHERE isSignature = 1").get() as { c: number };
const settings = db.query("SELECT * FROM SiteSetting").all();

console.log(`Successfully seeded SQLite!`);
console.log(`- Categories: ${catCount.c}`);
console.log(`- Products: ${prodCount.c} (${sigCount.c} signature)`);
console.log("- Settings:", settings);

db.close();
