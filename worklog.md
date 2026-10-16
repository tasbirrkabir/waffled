# Worklog — Waffled Sreemangal Website

## Project Overview
Official website for **Waffled Sreemangal** — a waffle/dessert shop in Sreemangal, Sylhet, Bangladesh.
Single-page site (route `/` only) with anchor navigation, built with Next.js 16 App Router + TypeScript + Tailwind CSS 4 + shadcn/ui.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Research brand, process assets, create content config, DB schema

Work Log:
- Read all 11 spec files from `upload/waffled-kit/waffled-sreemangal-website-kit/` (research, PRD, sitemap, design system, copy, menu model, SEO, tech spec, checklists)
- Analyzed logo image (`public/images/logo.png` — colorful splash "W" with black outline, vibrant purple/cyan/pink/orange)
- Analyzed promo video (11.8s, 720x1280): shop interior (black counter + gold slats, pop-art murals, waffle mascot characters), waffle pops on sticks in white boxes, menu board with prices
- Transcribed menu from video frames (verified across multiple high-res crops):
  - Classic: Nutella Crunch 159, Red Velvet 169, Strawberry Swirl 169, Blueberry Burst 179, Choco Chip Classic 179
  - New Arrivals: Oreo Crunch 219, Biscoff Bliss 219
  - Nutella Lovers: Banana Nutella w/ Nuts 169, Nutella Crunch w/ Nuts 169, Strawberry Banana Nutella 189, Double Strawberry Nutella 189, Kitkat Crunch 189
  - Shakes: Oreo Crush 159, Strawberry Breeze 159, Kitkat Fusion 159, Blueberry Frost 169, Nutella Bliss 179
  - Drinks/Add-ons: Mint Lemonade 49, House Milk Coffee 80, add-ons 50 each (ice cream, whipped cream, extra Nutella, extra nuts, choco chip)
- Verified business data via Restaurant Guru listing: phone +880 1723-399638, hours Sun-Sat 12PM-11PM (Mon till 11:30PM), takeaway yes, desserts category
- Processed assets with `scripts/process_assets.py`:
  - `public/images/logo.png` (512px, transparent bg) + `logo-full.png` + `favicon-48.png` + `apple-touch-icon.png` + `icon-192.png`
  - `public/images/hero-waffle.webp` (waffle pops close-up — HERO)
  - `public/images/sig-strawberry.webp`, `sig-oreo.webp`, `sig-nutella.webp` (signature cards)
  - `public/images/gallery/*.webp` — 8 photos: interior-counter, counter-order, ordering-experience, mural-logo, menu-card, shop-sign, waffle-spread, waffle-closeup
  - `public/images/og-image.jpg` (1200x630)
- Created `src/content/site.ts` (siteConfig: name, phone, address, hours, socials, maps URLs, isOpenNow/getTodayHours helpers)
- Created `src/content/menu.ts` (menu categories, signaturePicks, faqs)
- Updated `prisma/schema.prisma`: Subscriber (email unique), CtaEvent (type, createdAt) — pushed to SQLite

Stage Summary:
- ALL brand data verified & centralized in src/content/. Assets in public/images/.
- Brand: vibrant Gen-Z street-pop aesthetic. Palette (from kit 04): ink #201719, cream #FFF7EC, pink #F24C8B, orange #FF7B30, lime #BCE84A, cyan #42C7D9 + purple accent from logo (#7B4FF3-ish). Fonts: Space Grotesk (display) + Inter (body) + Hind Siliguri (Bangla accent line).
- Address: Radhanagar Road, Sreemangal 3210, Sylhet. Landmark: near Grand Sultan Tea Resort, entrance of Radhanagar Road.
- Socials: FB https://www.facebook.com/waffledshopbd/ · IG https://www.instagram.com/waffled.bd/ · Email waffledshop.bd@gmail.com
- Maps URL: https://www.google.com/maps?q=Waffled+Sreemangal,+Sreemangal+3210&ftid=0x375179000670e393:0xdc3b7b95a6ea6dc4
- Embed URL: https://maps.google.com/maps?q=Waffled%20Sreemangal%2C%20Sreemangal%203210&t=&z=16&ie=UTF8&iwloc=&output=embed
- API contracts for Task 2-b:
  - POST /api/subscribe {email} → {success, message?} | 400 {success:false, error} | 409 duplicate
  - POST /api/events {type: "menu_click"|"directions_click"|"phone_click"|"social_click"} → {success:true}

---
Task ID: 2-b
Agent: full-stack-developer
Task: Build API routes /api/subscribe and /api/events

Work Log:
- Read worklog.md for context; confirmed prisma/schema.prisma already has Subscriber + CtaEvent pushed to SQLite, and src/lib/db.ts already exists with the Prisma singleton pattern (used as-is)
- Created src/lib/rate-limit.ts: shared fixed-window in-memory rate limiter (Map stored on globalThis to survive dev hot-reload, same pattern as db singleton) + getClientIp() helper reading x-forwarded-for → x-real-ip → "unknown"; opportunistic cleanup at 10k buckets
- Created src/app/api/subscribe/route.ts (POST):
  - zod v4 schema: string → trim → toLowerCase → max(254) → pipe(z.email()) so emails are normalized before unique check
  - 400 {"success":false,"error":"Please enter a valid email address."} on invalid/malformed body (request.json() failure caught → null → fails validation)
  - P2002 Prisma error caught → 200 {"success":true,"message":"You're already on the list!"}
  - Success → 200 {"success":true,"message":"You're on the list — we'll ping you when new flavours drop."}
  - Other errors → 500 {"success":false,"error":"Something went wrong. Please try again."} (logged to console)
  - Rate limit 5 req/min/IP → 429 {"success":false,"error":"Too many requests. Please try again shortly."}
- Created src/app/api/events/route.ts (POST): z.enum whitelist ["menu_click","directions_click","phone_click","social_click"], 400 {"success":false} on invalid type/body, inserts CtaEvent, 200 {"success":true}, rate limit 60/min/IP → 429, errors → 500 {"success":false}
- Created src/lib/track.ts: trackEvent(type) fire-and-forget client helper (fetch + .catch, wrapped in try/catch, never throws/blocks navigation)
- Ran `bun run lint` — clean; `bunx tsc --noEmit` — clean for src/ (only pre-existing errors in examples/ + skills/ folders)
- curl-tested against dev server (all verified in dev.log too):
  - valid email → 200 success message; repeat → 200 "You're already on the list!"; "not-an-email" → 400
  - "  Normalize.Test@Example.COM  " → 200, stored as normalize.test@example.com; lowercase variant → duplicate message (normalization proven)
  - menu_click → 200 {"success":true}; bad_type → 400; all 4 whitelisted types → 200; malformed JSON → 400
  - burst of 6 subscribe calls after quota exhausted → all 429 with friendly error; after window reset → 200 again
- Verified DB via bun -e script: subscribers=3 (test@, normalize.test@, recovery@example.com — all lowercase), ctaEvents=5 (menu_click×2, directions_click×1, phone_click×1, social_click×1); rate-limited/invalid requests inserted nothing

Stage Summary:
- Routes created: POST /api/subscribe (email capture w/ zod validation, normalization, friendly P2002 dedup, 5/min/IP rate limit), POST /api/events (whitelisted CTA event tracking, 60/min/IP rate limit)
- Libs created: src/lib/rate-limit.ts (shared), src/lib/track.ts (client-safe helper for frontend agent to import)
- All curl tests passed with exact contract response shapes; lint + tsc clean; data verified in SQLite
- Decisions: duplicate subscribe returns 200 (not 409) per task spec — supersedes the 409 noted in worklog Task 1 contract; rate limit checked BEFORE validation (brute-force resistant); 429 on /api/events returns {"success":false}; left src/lib/db.ts untouched; did NOT touch page.tsx/components/content/globals.css (frontend agent's scope)
- Frontend integration notes: import { trackEvent } from "@/lib/track" (typed TrackEventType union); subscribe form should POST {"email"} to /api/subscribe and can render `message` directly from response on success, `error` on failure (400/429/500)

---
Task ID: 2-a (retry by main agent after subagent timeout) + 3 (verification)
Agent: main (Z.ai Code)
Task: Build complete frontend UI, verify with agent-browser, fix issues

Work Log:
- Frontend subagent timed out without producing files; built all components directly:
  - src/app/globals.css — Waffled design tokens (ink/cream/pink/orange/lime/cyan/purple), Tailwind 4 @theme mapping, marquee + spin-slow keyframes, reduced-motion support, marker-underline utility
  - src/app/layout.tsx — Space Grotesk + Inter + Hind Siliguri fonts, full SEO metadata, OG/Twitter cards, Toaster (sonner)
  - src/components/site-header.tsx — sticky header, logo tile, desktop nav + open-now pill, custom accessible mobile drawer (replaced Radix Sheet to fix hydration mismatch), skip-link
  - src/components/hero-section.tsx — split hero with sprinkle pattern, highlight underline, Bangla tagline, sticker price badge, rotating "WAFFLE LOVE" badge, polaroid card, ink marquee strip
  - src/components/signature-section.tsx — 3 staggered cards from signaturePicks
  - src/components/menu-section.tsx — category tabs (role=tablist) + animated item grid + call-to-confirm note
  - src/components/about-section.tsx — photo collage + features + social CTA
  - src/components/gallery-section.tsx — masonry grid + accessible Dialog lightbox
  - src/components/reviews-section.tsx — dark ink section, 3 real Google review quotes, review/social CTAs
  - src/components/visit-section.tsx — info card (address/hours table with Today highlight + open-now badge/contact) + Google Maps iframe embed + directions overlay
  - src/components/faq-section.tsx — sticky heading + shadcn Accordion
  - src/components/site-footer.tsx — 4-col footer with newsletter form → /api/subscribe with sonner toasts
  - src/components/mobile-action-bar.tsx — fixed bottom Menu/Directions/Call with safe-area padding
  - src/app/page.tsx — section assembly + Restaurant JSON-LD schema (no aggregateRating per truthfulness rules)
- Browser verification (agent-browser, 1440px + 390px):
  - All 11 sections render correctly when scrolled (initial full-page screenshot showed opacity-0 whileInView states — confirmed false alarm)
  - Menu tabs switch categories ✓ (Shakes→Oreo Crush, Nutella Lovers→Kitkat Crunch)
  - Gallery lightbox opens/closes ✓; FAQ accordion expands with content ✓
  - Newsletter subscribe: success toast + duplicate "already on the list" toast ✓
  - Mobile: no horizontal overflow at 390px, action bar present, footer visible, drawer opens/navigates/closes ✓
  - Desktop anchor nav lands correctly below sticky header (scroll-mt-24) ✓
  - 8 tel: links, 6 maps links, FB/IG links all present; 18 images, 0 broken ✓
- Fixed: Radix Sheet hydration mismatch (aria-controls ID) by replacing with deterministic custom drawer; fixed Missing DialogDescription warning
- Cleaned test data from DB (subscribers + ctaEvents)
- Final lint clean; dev.log clean (only harmless metadataBase dev warning — no confirmed domain yet, per spec do not invent one)

Stage Summary:
- Website complete and browser-verified: single-page landing with header/hero/marquee/signature/menu/about/gallery/reviews/visit/FAQ/footer/mobile-action-bar
- All business data from verified sources (video menu transcription, Restaurant Guru, socials from user); menu carries "may change, call to confirm" note
- APIs live: /api/subscribe + /api/events with rate limiting; event tracking wired to all CTAs
- Remaining owner inputs before production launch: confirm exact menu prices, domain for canonical/metadataBase, official review link, approve photos
