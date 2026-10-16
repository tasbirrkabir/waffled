# 10 — AI Coding Agent Build Prompt

Copy this prompt into the coding agent you will use after adding the owner-confirmed assets and menu.

---

You are a senior product designer and frontend engineer. Build a production-quality, mobile-first official website for **Waffled Sreemangal**, a waffle/dessert shop in Sreemangal, Bangladesh.

## Read these specs first

- `01-research-and-facts.md`
- `02-product-requirements.md`
- `03-sitemap-and-user-flows.md`
- `04-visual-direction-and-design-system.md`
- `05-page-copy-en.md`
- `06-menu-content-template.md`
- `07-seo-and-local-discovery.md`
- `08-technical-implementation.md`
- `09-assets-and-content-checklist.md`
- `11-launch-and-qa-checklist.md`

## Core objective

Create a memorable but highly usable website that helps customers view the real menu, check the location, and contact the shop. The experience must be particularly strong on phones because local customers and tourists may arrive from social posts, search results, or QR codes.

## Design direction

Create an original, playful food-brand aesthetic: warm cream and deep ink foundations with controlled pink/orange/lime/cyan accents, bold modern typography, expressive real product imagery, confident spacing, clean menu cards, and subtle motion. The result should feel distinctive, contemporary, and credible—not a template clone. Do not copy Waffle Up or any other competitor's logo, visual identity, site structure, illustrations, photography, or copy. Use the shop's own assets wherever possible.

## Required sections

- Header/navigation
- Hero with short headline, supporting copy, real image, View Menu and Directions CTAs
- Signature picks using only owner-approved items
- Menu grouped by approved categories with clear BDT prices
- Short about/story section
- Authentic food/shop gallery
- Link to verified customer reviews (do not fabricate quotes or ratings)
- Visit section with exact address, approved hours, verified phone, and exact Google Maps pin
- FAQ with owner-approved answers
- Footer with official social links and business contact
- Mobile sticky action bar for Menu, Directions, Call if it does not obscure content

## Critical truthfulness constraints

A public listing has a phone number (`+880 1723-399638`) and rough opening hours, but these require owner confirmation before production. Exact address, current menu text/prices, order methods, and official social links are not fully verified. Keep all such values centralized in a typed config/content file. Do not invent missing values or present placeholders as fact. Do not make a WhatsApp order CTA unless the owner confirms the number is WhatsApp-enabled and accepts orders there. If required data is missing, render a clear development-time placeholder or omit that module in production.

## Technical constraints

- Use the project’s existing framework if one is already installed; otherwise use Next.js App Router + TypeScript + Tailwind (or an equally maintainable equivalent).
- Build reusable semantic components.
- Keep content separate from layout.
- Use responsive optimized images and explicit dimensions/aspect ratios.
- Ensure keyboard accessibility, visible focus states, reduced-motion support, and readable contrast.
- Keep JS light; do not add unnecessary authentication, database, payments, cart, or admin dashboard.
- Set title/description, canonical, Open Graph, robots, sitemap, and valid local business schema using confirmed fields only.
- Avoid blocking third-party embeds; always provide normal map/review links as fallbacks.
- Do not add fake reviews, fabricated discounts, unsupported ingredient claims, or unapproved “best in town” copy.

## Workflow

1. Inspect the existing repository before editing. Do not overwrite working configuration needlessly.
2. Summarize implementation plan and identify missing owner-approved data.
3. Implement core layout, menu, location, and contact flows.
4. Add responsive behavior and accessible interactions.
5. Run lint/type checks/build and resolve warnings/errors.
6. Test at 360px, 390px, tablet, desktop, keyboard-only, and reduced-motion settings.
7. Verify every CTA and link. Search the codebase for placeholder tokens, example phone/address, lorem ipsum, and unapproved menu data.
8. Provide a concise completion report with routes, files changed, checks run, remaining owner inputs, and deployment steps.

## Definition of done

The site is visually polished, fast, responsive, accessible, accurate, and deployable. The main user can get to the menu, directions, or phone contact in one or two taps. No unknown business fact is silently invented.

---
