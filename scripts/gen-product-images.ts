/**
 * Batch-generate consistent product photos for every Waffled menu item.
 * Output: raw PNGs in scripts/gen-out/ (converted to webp separately).
 * Run: bun scripts/gen-product-images.ts
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const STYLE =
  "professional food photography for a dessert shop menu, bright soft studio lighting, plain warm cream background, vibrant appetizing colors, centered composition, high quality, no text, no watermark";

interface Product {
  id: string;
  subject: string;
}

const products: Product[] = [
  // Basic Flavours Waffle (waffle pops on a stick)
  { id: "strawberry", subject: "Golden rectangular waffle pop on a wooden stick, glazed with glossy red strawberry sauce and topped with fresh strawberry slices" },
  { id: "blueberry", subject: "Golden rectangular waffle pop on a wooden stick, topped with purple blueberry compote and fresh blueberries" },
  { id: "choco-chip-classic", subject: "Golden rectangular waffle pop on a wooden stick studded with dark chocolate chips and a light chocolate drizzle" },
  { id: "banana", subject: "Golden rectangular waffle pop on a wooden stick, topped with fresh banana slices and a honey drizzle" },
  { id: "kitkat", subject: "Golden rectangular waffle pop on a wooden stick, coated in milk chocolate and covered with crunchy chocolate wafer bar pieces" },
  { id: "nutella-crunch", subject: "Golden rectangular waffle pop on a wooden stick, dipped in glossy hazelnut chocolate spread with a crispy crunch topping" },
  { id: "red-velvet", subject: "Deep red red-velvet waffle pop on a wooden stick with white cream cheese glaze drizzle and red velvet crumbs" },
  { id: "strawberry-swirl", subject: "Golden rectangular waffle pop on a wooden stick with swirled pink strawberry glaze, a swirl of whipped cream and chocolate drizzle zig-zag" },
  { id: "oreo-crunch", subject: "Golden rectangular waffle pop on a wooden stick, coated in dark chocolate glaze and covered with crushed chocolate sandwich cookies" },
  { id: "biscoff-bliss", subject: "Golden rectangular waffle pop on a wooden stick, spread with caramelised biscuit spread, topped with crumbled caramelised biscuits and caramel drizzle" },
  // Nutella Flavours Waffle
  { id: "banana-nutella-nuts", subject: "Waffle pop on a wooden stick spread with hazelnut chocolate, topped with banana slices and chopped hazelnuts" },
  { id: "nutella-crunch-nuts", subject: "Waffle pop on a wooden stick dipped in glossy hazelnut chocolate, coated with crunchy chopped nuts" },
  { id: "strawberry-banana-nutella", subject: "Waffle pop on a wooden stick with hazelnut chocolate spread, topped with strawberry slices and banana slices" },
  { id: "double-strawberry-nutella", subject: "Waffle pop on a wooden stick with hazelnut chocolate spread, glossy strawberry glaze and halved fresh strawberries" },
  { id: "kitkat-crunch", subject: "Chocolate-dipped waffle pop on a wooden stick covered with broken chocolate wafer bar pieces" },
  // Shakes
  { id: "oreo-crush", subject: "Thick cookies and cream milkshake in a tall clear glass, topped with whipped cream, crushed chocolate sandwich cookies and one whole cookie" },
  { id: "strawberry-breeze", subject: "Thick pink strawberry milkshake in a tall clear glass, topped with whipped cream and a fresh strawberry" },
  { id: "kitkat-fusion", subject: "Thick chocolate wafer milkshake in a tall clear glass, topped with whipped cream and chocolate wafer sticks" },
  { id: "blueberry-frost", subject: "Thick purple blueberry milkshake in a tall clear glass, topped with whipped cream and fresh blueberries" },
  { id: "nutella-bliss", subject: "Thick hazelnut chocolate milkshake in a tall clear glass, topped with whipped cream, chocolate drizzle and chopped hazelnuts" },
  // Drinks
  { id: "mint-lemonade", subject: "Refreshing mint lemonade in a tall glass with ice cubes, lemon slices and fresh mint leaves" },
  { id: "house-milk-coffee", subject: "Iced milk coffee in a tall glass with swirling milk and ice cubes" },
  // Add-ons
  { id: "add-on-ice-cream", subject: "Single scoop of vanilla ice cream in a small paper cup" },
  { id: "add-on-whipped-cream", subject: "Elegant swirl of whipped cream on a small white plate" },
  { id: "add-on-extra-nutella", subject: "Small white bowl of creamy hazelnut chocolate spread" },
  { id: "add-on-extra-nuts", subject: "Small white bowl of chopped mixed nuts" },
  { id: "add-on-choco-chip", subject: "Small white bowl of dark chocolate chips" },
];

const OUT_DIR = path.join(process.cwd(), "scripts", "gen-out");

async function generateOne(zai: Awaited<ReturnType<typeof ZAI.create>>, p: Product, retries = 5): Promise<boolean> {
  const outPath = path.join(OUT_DIR, `${p.id}.png`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`↷ skip ${p.id} (exists)`);
    return true;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await zai.images.generations.create({
        prompt: `${p.subject}, ${STYLE}`,
        size: "1024x1024",
      });
      const b64 = res.data?.[0]?.base64;
      if (!b64) throw new Error("no base64 in response");
      const buf = Buffer.from(b64, "base64");
      if (buf.length < 10000) throw new Error(`suspiciously small (${buf.length}b)`);
      fs.writeFileSync(outPath, buf);
      console.log(`✓ ${p.id} (${(buf.length / 1024).toFixed(0)} KB)`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = msg.includes("429") || msg.toLowerCase().includes("too many");
      console.error(`✗ ${p.id} attempt ${attempt}: ${msg.slice(0, 120)}`);
      if (attempt < retries) {
        const wait = isRateLimit ? 20000 + attempt * 10000 : 3000;
        console.log(`  waiting ${(wait / 1000).toFixed(0)}s before retry...`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  return false;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();
  // Sequential with a small gap: the image API rate-limits concurrent requests (429).
  let ok = 0;
  const failed: string[] = [];

  for (const p of products) {
    const success = await generateOne(zai, p);
    if (success) ok++;
    else failed.push(p.id);
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(`\nDone: ${ok}/${products.length} generated.`);
  if (failed.length) {
    console.log(`FAILED: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main();
