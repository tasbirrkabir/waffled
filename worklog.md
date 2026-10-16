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

---
Task ID: 3
Agent: main (Z.ai Code)
Task: Google Maps data integration (pictures/menu/business info), remove em dashes + hero badge, add /menu + /order routes with online ordering

Work Log:
- Scraped live Google Maps listing via agent-browser (desktop limited view + mobile emulation):
  - Business info: rating 4.9 (32 reviews), category "Dessert restaurant", address Sreemangal 3210, phone +880 1723-399638, plus code 8Q27+4P, coords 24.3003415/91.7642588, owner post "New items added" Jun 2 2026
  - Menu (from user's screenshot of the Menu tab, VLM-verified 3x): Basic Flavours Waffle = Strawberry 179, Blueberry 179, Choco Chip Classic 179, Banana 179, Kitkat 179, Nutella Crunch 159, Red Velvet 169, Swirl (Strawberry Swirl) 169, Oreo Crunch 219, Biscoff Bliss 219; second category "Nutella Flavours Wa..." (truncated)
  - Photos: extracted 8 googleusercontent URLs from DOM, downloaded at w=1600 (7 unique after md5 dedup), VLM-identified each
  - Review: full English review from Tawfiq Rahman (Local Guide, 5 stars, Food 5/Service 5/Atmosphere 4, takeout, live music) via "See original" toggle
- Processed photos to public/images/gmaps/*.webp (1400px, 82q) + hero-waffle-gmaps.webp (900x1125 4:5 crop of waffle pops photo)
- src/content/menu.ts: restructured to Google Maps categories (Basic Flavours Waffle with exact 10 items/prices; Nutella Flavours Waffle/Shakes/Drinks from video transcription), FAQ updated (order online answer, prices from 159), removed all em dashes
- src/content/site.ts: added rating {4.9, 32}, plusCode, coordinates, whatsappUrl, real place reviewsUrl; hours labels "12:00 PM to 11:00 PM" (no en dash); isOpenNow label "Open now, till X"
- hero-section.tsx: REMOVED "Waffle time · Sreemangal" pill badge; em dash removed; hero image now hero-waffle-gmaps.webp (real Google photo); price sticker 149->159; CTAs now Link to /order (primary) + /menu; added clickable Google rating chip (4.9, 32 reviews); rotating badge separator · -> ✦; marquee "RADHANAGAR · SREEMANGAL" -> "RADHANAGAR ROAD, SREEMANGAL"
- Removed ALL em/en dashes site-wide: site-header (aria-labels/alt), menu-section, signature-section, gallery-section, faq-section, about-section, reviews-section, site-footer, layout.tsx titles, api/subscribe message, lib/track comment
- site-header.tsx: nav now routes Menu->/menu, Order Online->/order, Our Story->/#story, Gallery->/#gallery, Visit Us->/#visit; desktop CTA "Order Online"->/order; brand link ->/
- mobile-action-bar.tsx: Menu->/menu, Order->/order, Call (tel:)
- site-footer.tsx: quickLinks use routes via Link; added plus code line
- NEW src/lib/cart-store.ts: Zustand cart (persist localStorage, max 20/item) + cartCount/cartSubtotal/formatTk helpers
- NEW src/components/order/add-to-cart-button.tsx: Add button morphs into qty stepper with toast
- NEW src/app/menu/page.tsx + menu-page-content.tsx: full menu route, sticky category chips (IntersectionObserver active state), item cards with tags + Add buttons, Google sync + 4.9 rating badges, Menu JSON-LD, CTAs
- NEW src/app/order/page.tsx + order-page-content.tsx: order flow (steps indicator, category tabs, sticky cart aside with qty steppers/remove, checkout form: name/BD phone validation/pickup select/notes, success view with order number + WhatsApp send + call + restart)
- NEW src/app/api/orders/route.ts: zod validation (BD phone regex, pickup enum, items 1-50 x qty 1-20), server re-prices from menu.ts (anti-tampering), WF-#### order numbers, WhatsApp message builder + wa.me URL, 3/min/IP rate limit
- prisma: added Order model (orderNumber unique, customerName, phone, pickupTime, notes, items JSON string, total, status), pushed + regenerated; dev server restarted (old client was cached on globalThis)
- Dev server restart procedure: double-fork setsid with ./node_modules/.bin/next (plain "next" not on PATH in detached bash)
- Verification (agent-browser + curl):
  - / /menu /order all 200; titles correct
  - Homepage DOM: no "Waffle time" badge, zero em/en dashes, 4.9+32 reviews shown, CTAs correct, hero image loads
  - 22 images 0 broken; all 7 gmaps photos load (gallery + hero polaroid)
  - /menu: 4 categories, all Google items, 27 add buttons, CTAs
  - Order flow E2E: added items on /menu, cart persisted to /order (localStorage), filled form, placed order WF-0001 total 537, WhatsApp URL decodes to formatted message, DB row saved correctly; validation errors (bad phone/bad item/empty) friendly; 429 rate limit works
  - Mobile 390px: action bar (Menu/Order/Call), no horizontal scroll possible, footer at bottom; VLM visual checks pass on home/order/menu
  - lint clean, tsc clean (src), dev.log clean; test orders + test subscriber cleaned from DB

Stage Summary:
- Real Google Maps data fully integrated: 7 real photos, Google menu (Basic Flavours Waffle 10 items), 4.9/32 rating shown + JSON-LD aggregateRating, plus code, coords, real review (Tawfiq Rahman)
- Em dashes + "Waffle time · Sreemangal" badge removed everywhere (verified zero in rendered DOM)
- Multi-route site: / (home) + /menu (full menu) + /order (online ordering); cart persists across pages via Zustand localStorage
- Online ordering complete: server-validated, DB-persisted orders with WF-#### numbers, WhatsApp handoff (wa.me/8801723399638 pre-filled message) + call fallback, pay-at-pickup model
- APIs: /api/subscribe + /api/events (unchanged) + /api/orders (new)

---
Task ID: 4
Agent: main (Z.ai Code)
Task: Fix mobile hero/sidebar glitch, remove Bangla text from home, redesign checkout as proper multi-step flow, add product images to every product

Work Log:
- Analyzed user screenshot (VLM): "THE SHOP" polaroid card + price sticker overlapping hero image on mobile = the "sidebar glitch"; also confirmed via agent-browser iPhone 14 emulation + bounding-box measurements
- hero-section.tsx: removed Bangla tagline paragraph (siteConfig.taglineBn) entirely; hid polaroid card on mobile/tablet (hidden lg:block, was overlapping hero image + price sticker + mobile action bar); rotated badge offset reduced on mobile (-right-3 -top-5) to prevent viewport clipping
- site.ts: removed taglineBn; layout.tsx: removed Hind_Siliguri font import (no Bangla text anywhere now); globals.css: removed --font-bangla + .font-bangla
- ROOT CAUSE of horizontal "sidebar wiggle" found: visit-section map card animates from x:24 (framer-motion whileInView initial), extending 8px past viewport before animation triggers -> scrollWidth 398 vs 390. Fixed globally with `overflow-x: clip` on html in globals.css (clip preserves position:sticky, unlike hidden); verified scrollX locked to 0, sticky chips + sticky cart sidebar still work
- Generated 27 consistent product photos via z-ai-web-dev-sdk image generation (1024x1024, sequential with 429 backoff - API rate-limits concurrency):
  10 basic waffles, 5 nutella waffles, 5 shakes, 2 drinks, 5 add-ons; converted to 800px webp q80 (scripts/gen-product-images.ts + scripts/convert_products.py) -> public/images/products/*.webp (1.1MB total)
- menu.ts: added image + imageAlt to every MenuItem; signaturePicks now use product images
- NEW src/components/order/product-card.tsx: shared image card (square image, tag badges over image, name/price/desc/category, Add-to-cart) used on home menu section, /menu, /order
- REWROTE order-page-content.tsx as proper multi-step checkout (was single-page landing-style):
  Step 1 "Build your order": compact header + CheckoutSteps progress (Items -> Checkout -> Confirmed), trust chips, category tabs, 2-col mobile product grid, desktop sticky cart sidebar, mobile floating checkout bar above action bar
  Step 2 "Checkout": back link, Your details (name/phone) + Pickup (time/notes) numbered sections, pickup-only/pay-at-counter info card, order summary with editable line items; desktop 2-col sticky summary, mobile single col summary + form; sticky Place-order
  Step 3 Success: order number, itemized recap, WhatsApp/call CTAs, new-order restart
- menu-page-content.tsx: product image grid (4-col desktop), floating cart pill when cart non-empty -> /order
- menu-section.tsx (home): image ProductCards in 2-col mobile grid
- Toast overlap fix: [data-sonner-toaster] bottom raised to 12rem+safe-area on <768px (above action bar + floating cart pill); floating bars offset 3.75rem (clears action bar 3px border)
- Dev server Turbopack served stale CSS after edits (toast rule stayed 7rem) -> restarted dev server (kill next/next-server/postcss pids, setsid nohup ./node_modules/.bin/next dev -p 3000); CSS then served fresh
- E2E verified with agent-browser:
  Desktop: /order add 3 items -> Go to checkout -> form -> Place order WF-0002 ৳557 correct; WhatsApp message decodes with items/total/name/pickup; DB row saved; success view + item recap
  Mobile (iPhone 14): 2-col product grid, floating checkout bar above action bar (2 items ৳318), validation errors show (name/phone), order WF-0003 ৳318 placed; menu page floating pill works; toast clears pill (toastBottomEdge 652 < pillTop 710)
  Home: no Bangla text in DOM (only ৳ symbol), polaroid hidden on mobile/badge geometry verified via getBoundingClientRect, desktop polaroid reads as intentional collage
  All 27 product images load (0 broken) on /menu; lint clean; tsc clean for src/
- Cleaned test orders WF-0002/WF-0003 from DB (kept WF-0001, a real customer order from Tasbir Kabir)

Stage Summary:
- All 4 user requests done: hero glitch fixed (polaroid hidden on mobile + global overflow-x clip kills the wiggle), Bangla text removed from home, checkout redesigned into a real 3-step e-commerce flow (browse -> checkout -> confirmed) with VLM grade A-, every product now has a unique appetizing product image
- New shared component: ProductCard (image + tags + add-to-cart) used across home/menu/order
- Assets: 27 AI product photos in public/images/products/ (800px webp), generation + conversion scripts kept in scripts/
- Note for future agents: Turbopack CSS may serve stale after globals.css edits -> restart dev server if CSS changes don't appear; keep dev server running via setsid nohup

---
Task ID: 5
Agent: main (Z.ai Code)
Task: Fix build error "Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'"

Work Log:
- Diagnosed: Turbopack's next/font/google pipeline fails to resolve its own internal font module for Space Grotesk in layout.tsx (GET / 500; network to fonts.googleapis.com fine, so it is a Turbopack pipeline bug, not connectivity)
- Fix strategy: remove next/font/google entirely; self-host fonts with plain @font-face to bypass the Turbopack font pipeline
- Downloaded latin variable fonts from Google Fonts CSS2 API (script parsed /* latin */ subset blocks; woff2 magic-byte verified):
  public/fonts/space-grotesk-var.woff2 (22KB, wght 300-700, md5 87c506d8)
  public/fonts/inter-var.woff2 (48KB, wght 100-900, md5 260c81a4)
  (CSS2 API returns one variable file per family; deduped 6 downloads to 2 files)
- layout.tsx: removed Space_Grotesk/Inter imports + variable classes; body now "font-sans antialiased"
- globals.css: added two @font-face rules (font-display swap, /fonts/*.woff2) after imports; :root now defines --font-space-grotesk and --font-inter (replacing vars next/font used to inject via body class)
- First attempt served PARTIAL CSS: @font-face present but :root block missing (Turbopack caught file between the two sequential edits of one MultiEdit) -> fonts registered but "unloaded", computed styles fell back to Tailwind default stack; confirmed via served chunk diff (167247 vs 167425 bytes)
- Killed dev server, cleared .next, restarted: first single-fork setsid attempt died silently mid cold-compile; second attempt with double-fork subshell "( setsid nohup ... & )" came up clean (pattern per Task 4 note)
- Full verification after restart:
  CSS chunk contains @font-face + :root font vars; document.fonts.check: Space Grotesk 600 + Inter 400 both "loaded"; computed body font = Inter stack, h1 = Space Grotesk stack
  / 200, /menu 200 (27 product images, 0 broken), /order 200 (3-step indicator, ৳ prices render)
  Golden path: /order -> add Strawberry -> Go to checkout -> step 2 form (name/phone/pickup/notes) + order summary + Place order button all present (no DB test order placed; WF-0001 real customer order untouched)
  Mobile 390px: horizontal scroll LOCKED (scrollX stays 0 after forced scrollTo(120,0); overflow-x: clip holds, no sidebar wiggle), fonts apply on mobile too
  Footer: pushed down naturally by long content (no overlap); VLM QA of desktop screenshots: typography correct + polished, zero broken images, no rendering glitches (polaroid/price-badge overlap on desktop hero = intentional collage, hidden on mobile per Task 4)
- lint clean; dev.log clean (only pre-existing harmless metadataBase dev warning)

Stage Summary:
- Build error fixed by eliminating next/font/google: fonts now self-hosted at /public/fonts (2 variable woff2, latin), loaded via plain @font-face in globals.css, variables --font-space-grotesk/--font-inter defined in :root
- Zero visual change vs before (same Space Grotesk + Inter families and weights); site fully functional again on /, /menu, /order
- Ops lessons (again): Turbopack can serve PARTIAL stale CSS after rapid sequential edits -> clear .next + restart; dev server must be launched with double-fork setsid "( setsid nohup ./node_modules/.bin/next dev -p 3000 >> dev.log 2>&1 < /dev/null & )"
