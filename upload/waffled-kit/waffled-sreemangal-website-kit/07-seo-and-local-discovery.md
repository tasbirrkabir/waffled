# 07 — SEO & Local Discovery

## 1. Search intent

Prioritize branded/local queries and high-intent discovery. Use natural language; do not repeat keywords unnaturally.

Potential keyword themes:
- Waffled Sreemangal
- Waffles in Sreemangal
- Dessert shop in Sreemangal
- Waffle shop near Grand Sultan Sreemangal (only if location description is confirmed)
- Snacks and waffles in Sreemangal

Keyword suggestions are hypotheses. Confirm actual query data in Google Search Console after launch.

## 2. Metadata draft

**Title:** `Waffled Sreemangal | Waffles, Desserts & Snacks`

**Description:** `Explore the menu, opening hours, and directions for Waffled Sreemangal in Sreemangal, Bangladesh. View the current menu and plan your visit.`

**Canonical:** `https://[confirmed-domain]/`

Use the actual registered domain; do not publish a made-up canonical URL.

## 3. On-page requirements

- One clear H1 on the homepage.
- Descriptive H2 headings for Menu, About, Gallery, Visit Us, and FAQs.
- Accurate NAP information: Name, Address, Phone—matching the Google Business Profile.
- Human-readable URLs if using separate pages: `/menu`, `/visit`.
- Unique title/description for each indexable route.
- Real image alt text, e.g. `Chocolate-topped waffle served at Waffled Sreemangal` only when the image depicts that real item.
- Open Graph title, description, and image for social previews.
- `og:image` should be an approved brand/product photo, ideally at a 1200×630 crop.
- `sitemap.xml` and correct `robots.txt`.
- Use one canonical URL consistently with HTTPS.

## 4. Local business structured data

Use `Restaurant` or the more specific `FoodEstablishment` type supported by Schema.org. Only include verified values.

Example template (replace placeholders and validate before release):

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Waffled Sreemangal",
  "url": "https://[confirmed-domain]/",
  "telephone": "+8801723399638",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[owner-confirmed street address]",
    "addressLocality": "Sreemangal",
    "addressRegion": "Sylhet",
    "addressCountry": "BD"
  },
  "servesCuisine": ["Desserts", "Waffles"],
  "sameAs": [
    "[official social profile URL]"
  ]
}
```

Add `openingHoursSpecification`, `geo`, `priceRange`, menu URL, and aggregate rating only after those values are confirmed and meet the search engine's rules. Do not add a fake `aggregateRating` based on a scraped third-party summary.

## 5. Google Business Profile

- Verify ownership/access of the Google Business Profile.
- Ensure name, address, phone, hours, category, website, and map pin match the website.
- Set the website URL once the domain is live.
- Add current menu photos and real exterior/storefront photos.
- Use the official review link in the site.
- Ask real customers for honest feedback; never offer deceptive incentives or publish fake reviews.
- Keep holiday/special hours updated.

## 6. Local trust signals

- Show recognizable nearby landmark information only when confirmed.
- Include accurate directions and a one-tap map link.
- Publish current prices and clear service details.
- Link to official social profiles.
- Show the real storefront exterior where possible.
- Avoid fake “featured in” logos, made-up awards, or fabricated testimonials.

## 7. Technical SEO validation

- Test with Google Rich Results Test and Schema Markup Validator.
- Check indexing and coverage in Search Console.
- Verify canonical and redirects, especially `www` vs non-`www`.
- Avoid duplicate indexable homepages.
- Ensure menu content exists as crawlable HTML, not only as an image or embedded social post.
- Check image size, alt text, and social share previews.
