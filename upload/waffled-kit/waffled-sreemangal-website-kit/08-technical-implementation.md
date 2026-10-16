# 08 — Technical Implementation Specification

## 1. Recommended stack

Choose the stack that matches the builder's existing workflow. For a straightforward brochure/menu site:

- **Framework:** Next.js (App Router) or Astro; prefer Next.js if the project already uses it and future features are likely.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS or CSS Modules with design tokens.
- **Hosting:** Vercel, Cloudflare Pages, or another reliable static/SSR host.
- **Content:** typed local data files initially; use a CMS only if the owner needs self-service editing.
- **Images:** optimized local assets with responsive `srcset`, or a trusted image CDN.
- **Forms:** avoid forms for release 1 unless required; if adding one, use server-side validation and spam protection.

Do not over-engineer this project with authentication, a database, or an admin dashboard unless a concrete requirement demands it.

## 2. Suggested project structure

```text
app/
  layout.tsx
  page.tsx
  menu/page.tsx              # only if separate menu route is justified
  globals.css
components/
  SiteHeader.tsx
  HeroSection.tsx
  MenuPreview.tsx
  MenuCategoryTabs.tsx
  MenuItemCard.tsx
  FoodGallery.tsx
  OpeningHours.tsx
  LocationPanel.tsx
  FAQAccordion.tsx
  MobileActionBar.tsx
  SiteFooter.tsx
content/
  menu.ts                    # typed, owner-approved menu data
  site.ts                    # phone, address, hours, URLs
public/
  images/
    hero/
    menu/
    gallery/
```

## 3. Centralize business configuration

Store contact, hours, map URL, social profiles, and brand details in a single typed configuration file. Components should read these values rather than repeating literal strings.

Example shape (values are placeholders until confirmed):

```ts
export const siteConfig = {
  name: "Waffled Sreemangal",
  phoneDisplay: "+880 1723-399638",
  phoneE164: "+8801723399638",
  address: "[OWNER-CONFIRMED ADDRESS]",
  mapsUrl: "[OWNER-CONFIRMED GOOGLE MAPS URL]",
  hours: [],
  socials: {
    facebook: "[OFFICIAL URL]",
    instagram: "[OFFICIAL URL]"
  }
};
```

Use runtime-safe rendering for optional fields. Do not render empty anchors or unconfirmed links.

## 4. Functional details

- Phone CTA: `href="tel:+8801723399638"` after number confirmation.
- Directions CTA: direct link to the exact map pin, open in a new tab only when appropriate, with safe `rel` attributes when using `target="_blank"`.
- Menu filtering: client-side only if necessary; do not ship a large JavaScript bundle for simple categories.
- FAQ: semantic buttons, `aria-expanded`, correct focus behavior.
- Gallery: click-to-expand only if accessible; avoid inaccessible custom lightboxes.
- Hours: handle days spanning midnight or special closures if the business schedule requires it.
- Contact links: show the actual phone and address as selectable text, not image-only text.

## 5. Performance

- Use `next/image` or equivalent responsive image optimization.
- Prefer WebP/AVIF; retain suitable fallbacks.
- Set width/height or aspect ratio to prevent layout shift.
- Preload only the true hero/LCP image; lazy-load below-the-fold images.
- Avoid video backgrounds on mobile.
- Use system fallbacks and only necessary font weights.
- Minimize third-party embeds, trackers, and animation libraries.
- Target Core Web Vitals in the “good” range, but validate on real devices and network conditions rather than assuming success.

## 6. Accessibility

- Semantic landmark elements: `header`, `nav`, `main`, `section`, `footer`.
- Logical H1–H3 structure.
- Skip-to-content link.
- Visible focus indicator on every interactive element.
- Keyboard-operable menu/FAQ/filter components.
- Contrast test for all brand color combinations.
- Informative image alt text; use empty alt for decorative imagery.
- Touch targets at least 44×44 CSS px where practical.
- Respect `prefers-reduced-motion`.
- Never rely on color alone to communicate price, availability, or category.

## 7. Analytics and privacy

Analytics are optional. If used, document what is tracked and comply with applicable requirements. At minimum, events can be:
- `menu_view`
- `directions_click`
- `phone_click`
- `social_click`

Do not send personal information in analytics events. Avoid invasive tracking scripts; use a privacy-appropriate solution that the owner approves.

## 8. Security / reliability

- Escape and validate content if it ever comes from an external CMS.
- Add spam protection and server-side validation if a form exists.
- Keep secrets out of client code and public repositories.
- Do not depend on a Google Maps/review iframe to render primary business information.
- Provide clickable links as fallbacks if third-party embeds fail.
- Ensure social/map URLs are validated and owner-approved.

## 9. Deployment

- Use a production domain controlled by the business or owner-approved maintainer.
- Enable HTTPS and redirect HTTP to HTTPS.
- Configure canonical host consistently.
- Add sitemap/robots and search console verification.
- Confirm page title and share image on Facebook/Messenger/WhatsApp previews.
- Use a preview deployment for owner acceptance before production.
