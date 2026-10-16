# 04 — Visual Direction & Design System

## 1. Creative direction

**Concept:** “A little burst of waffle joy.” Build an original, bright, playful dessert brand experience that feels energetic in social feeds but polished and easy to navigate.

Use the shop's public-facing visual cues—vivid, colorful, youthful—to develop a distinct digital identity. The site should not copy another chain's logo, layout, colors in the same combinations, mascot, typography, illustration style, or promotional language.

### Desired emotional response

- Appetizing and fun.
- Friendly for friends and families.
- Local and easy to find.
- Trustworthy about prices, availability, and opening hours.
- Distinctive enough to remember and share.

## 2. Visual principles

1. **Real food leads.** Use close-up waffle texture, sauce drizzle, and fresh toppings from actual shop items.
2. **Controlled color.** Use one strong primary color with a small set of supporting colors; don't make every section compete.
3. **Bold typography, readable details.** Display type may be playful; menu names, descriptions, and prices must remain highly legible.
4. **Friendly shapes.** Rounded corners and sticker-like labels can add character, but avoid excessive blobs and novelty effects.
5. **Clear conversion path.** Directions and menu are always easy to reach.
6. **Local authenticity.** Include a real exterior/location photo if available, rather than generic cafe imagery.

## 3. Starting palette (provisional; refine from approved brand assets)

| Token | Suggested value | Use |
|---|---|---|
| `--color-ink` | `#201719` | Primary text, footer, deep contrast |
| `--color-cream` | `#FFF7EC` | Main warm background |
| `--color-pink` | `#F24C8B` | Signature accent / highlights |
| `--color-orange` | `#FF7B30` | Main CTA or warm supporting accent |
| `--color-lime` | `#BCE84A` | Small playful highlight only |
| `--color-cyan` | `#42C7D9` | Supporting color for tags/cards |
| `--color-surface` | `#FFFFFF` | Cards and menu surfaces |
| `--color-muted` | `#725E63` | Secondary text; check contrast before use |
| `--color-border` | `#E9DCD8` | Dividers and outlines |

**Accessibility note:** verify text contrast for each real pairing before implementation. Use ink on light surfaces for most body text; do not put small white text on lime or yellow.

## 4. Typography

Suggested font pairing, subject to font licensing and Bengali glyph coverage:

- **Display:** `Space Grotesk`, `Plus Jakarta Sans`, or a licensed brand display font.
- **Body/UI:** `Inter` or a similarly legible sans-serif.
- **Bangla:** use a font with dependable Bengali shaping and weights, such as `Hind Siliguri` or `Noto Sans Bengali`, after testing diacritics and line breaks.

Use self-hosted WOFF2 fonts when licensing permits. Avoid loading many weights. Do not use a display font for menu details or prices.

## 5. Layout system

- Max content width: approximately 1120–1240px.
- Desktop: 12-column grid or equivalent; hero split between copy and photography.
- Mobile: single column, minimum 20px side padding where practical.
- Spacing system: multiples of 4 or 8px.
- Buttons: minimum 44×44 CSS px interactive area.
- Corner radius: 12–20px for cards; pill style for small tags only.
- Cards: clean solid surfaces and subtle borders; avoid heavy shadows on every element.

## 6. Components

- `SiteHeader`
- `MobileNavigation`
- `HeroSection`
- `PrimaryButton` / `SecondaryButton`
- `SignatureItemCard`
- `MenuCategoryTabs`
- `MenuItemRow` or `MenuItemCard`
- `FoodGallery`
- `ReviewLink` (not fabricated review cards)
- `OpeningHoursTable`
- `LocationPanel`
- `FAQAccordion`
- `MobileActionBar`
- `SiteFooter`

Every component should support touch, keyboard, focus, and reduced motion.

## 7. Image direction

- Shoot actual waffles from a low 30–45° angle and at least one top-down composition.
- Capture texture detail, cross-section/topping detail, and a complete serving.
- Use soft directional light; preserve real food colors; avoid aggressive orange filters.
- Leave clean negative space in at least one hero image for responsive crop flexibility.
- Keep the plate, serving style, sauces, and toppings true to the actual product.
- Include real shop/interior/exterior imagery so the brand feels local and findable.

Image ratio guidelines:
- Hero: 4:5 or 5:4 responsive crop, with a high-resolution source.
- Menu cards: 4:3 or 1:1, consistent for every item.
- Gallery: mix 4:5 portrait and 4:3 landscape, organized intentionally.

## 8. Motion

Optional small interactions: subtle image reveal, button press feedback, gentle marquee for an announcement only if it does not harm readability. Avoid autoplay video with sound, flashing animation, forced loading animations, and parallax that creates mobile performance problems.

## 9. Do not do

- Do not copy a competitor's website or another waffle brand's packaging identity.
- Do not use generic stock images as real menu items.
- Do not overdo neon gradients, glassmorphism, or 3D elements.
- Do not hide menu prices behind hover interactions.
- Do not use tiny text for address, hours, or phone.
- Do not use an unconfirmed mascot/logo recreation as the official mark.
