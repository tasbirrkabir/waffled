# 02 — Product Requirements Document (PRD)

## 1. Product summary

Create a fast, mobile-first official website for **Waffled Sreemangal** that turns discovery into a real-world visit or phone inquiry. The site should feel memorable and appetizing while making the menu, location, hours, and contact details effortless to find.

## 2. Goals

### Primary goals
- Make the current menu and prices easy to browse on mobile.
- Help customers get accurate directions to the shop.
- Enable one-tap calls from mobile devices.
- Present authentic food, product, and shop photos that build trust.
- Give the business an official URL to use across social media and local marketing.

### Secondary goals
- Improve branded and local search visibility.
- Let the owner update the menu/hours without redesigning the site.
- Provide a foundation for future online ordering if operationally supported.

## 3. Non-goals for release 1

Do not build these unless the owner explicitly approves the scope:
- Full ecommerce cart and online payment.
- Delivery-driver dispatch or third-party delivery API.
- User accounts, rewards, points, or membership.
- Table booking system.
- Reviews that users can submit directly to the website.
- Complex CMS/admin dashboard if an easier owner-update workflow is sufficient.

## 4. Primary user stories

1. As a visitor, I can see what Waffled sells and how much each item costs.
2. As a visitor near Sreemangal, I can open directions to the correct map pin.
3. As a visitor, I can call the shop without copying the phone number.
4. As a visitor, I can check today's opening hours and spot if hours are unconfirmed or exceptional.
5. As a social-media visitor, I can view the official menu and share the website.
6. As the owner, I can correct menu items, prices, hours, and contact links quickly.
7. As a mobile user, I can navigate the entire site one-handed without horizontal scrolling.

## 5. Functional requirements

### P0 — required
- Responsive layout for 360px mobile width and larger.
- Header with brand logo/wordmark and clear Menu / Visit / Contact navigation.
- Hero with a clear value proposition, real food photo, and primary CTA.
- Menu section/page with category filters or clearly separated categories.
- Each menu item supports name, price in BDT, optional description, image, availability, and optional tags.
- Click-to-call using the owner-confirmed phone number.
- Map/directions link based on owner-confirmed Google Maps pin.
- Hours display based on an owner-approved schedule; support exceptional closures.
- Footer with contact, location, social links, and copyright.
- Basic local SEO metadata and sitemap.
- Good keyboard navigation, readable contrast, and visible focus states.
- Privacy-conscious analytics setup only if approved.

### P1 — highly recommended
- Gallery using authentic shop/product images.
- Google review link or approved live review embed.
- FAQ covering location, hours, takeaway, and menu availability.
- Sticky mobile action bar with **Menu**, **Directions**, and **Call**.
- Bengali/English copy toggle if the owner wants bilingual content.
- Lightweight content source such as a JSON file, Markdown file, or simple CMS.

### P2 — future options
- WhatsApp ordering only after verifying the phone is WhatsApp-enabled and confirming order-handling workflow.
- Delivery service integration.
- Event/group order form.
- Offers or seasonal menu modules.
- Loyalty/rewards.

## 6. Conversion hierarchy

1. **View Menu** — primary discovery action.
2. **Get Directions** — highest-intent visit action.
3. **Call to Order / Call the Shop** — only if the owner confirms calls are accepted for orders.
4. **Follow on Social** — secondary engagement action.

Do not label a phone CTA “Order Now” until phone ordering is confirmed.

## 7. Content requirements

- Approved logo or custom text wordmark.
- 8–12 authentic product photos where possible.
- 2–4 interior/exterior photos, including a recognizable street/landmark shot.
- Current menu and exact prices.
- Exact location/pin, phone number, hours, social links.
- Approved about/brand paragraph.
- Permissions for customer images, testimonials, logos, and embedded third-party content.

## 8. Quality attributes

- **Performance:** prioritize compressed WebP/AVIF images, responsive sources, lazy-load below-the-fold imagery, and minimize JavaScript.
- **Accessibility:** target WCAG 2.2 AA as a practical objective; use semantic headings, accessible controls, keyboard navigation, and reduced-motion support.
- **Reliability:** never let a third-party map/review embed block the main page; show a standard link fallback.
- **Maintainability:** keep menu, hours, and contact details out of repeated hard-coded components.
- **Security:** validate any form input server-side; avoid collecting sensitive data unnecessarily.

## 9. Success metrics

Establish a baseline after launch and measure only with appropriate consent/privacy controls:
- Menu CTA clicks.
- Directions/map-link clicks.
- Click-to-call events.
- Social link clicks.
- Mobile page load/Core Web Vitals.
- Organic impressions/clicks for branded and local intent terms.
- Menu update turnaround time for the owner.

Do not promise a specific sales lift before data exists.

## 10. Acceptance criteria

- No placeholder copy, fabricated menu item, fake review, or stock food image remains in production.
- All menu prices are owner-approved and clearly displayed in ৳ / BDT.
- Phone, hours, location pin, and social links have been tested on a real mobile device.
- Menu and directions are reachable within one or two taps from the landing page.
- The page works at 360px, 390px, tablet, laptop, and wide-desktop breakpoints.
- Main text and controls remain readable with zoom and keyboard navigation.
- SEO title, description, canonical URL, robots, sitemap, and local structured data are validated.
