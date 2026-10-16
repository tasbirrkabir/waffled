# 03 — Sitemap, Page Structure & User Flows

## 1. Recommended information architecture

For version 1, use a polished home page with strong anchor navigation. If the final menu is large, split the menu into its own route.

```text
/
├── #menu                 Menu section or /menu
├── #about                Short brand story
├── #gallery              Real food/shop photography
├── #visit                Location, opening hours, directions
├── #faq                  Frequently asked questions
└── /privacy               Only if analytics/forms require it
```

Optional later routes:

```text
/menu
/our-story
/contact
/offers
```

Do not create thin pages just to increase page count. A single well-made landing page is better than several empty pages.

## 2. Homepage section order

1. **Utility strip (optional):** “Find us in Sreemangal” only after the address is confirmed.
2. **Header:** wordmark, Menu, Our Story, Visit Us; visible CTA.
3. **Hero:** headline, concise supporting text, product image, View Menu + Directions.
4. **Signature picks:** 3–4 owner-confirmed high-margin/popular items.
5. **Menu preview:** categories, representative items, prices, Full Menu action.
6. **Brand/experience section:** short factual story and shop atmosphere.
7. **Food gallery:** real product close-ups and shop photos.
8. **Social proof:** link to verified Google reviews or approved quotes.
9. **Visit section:** confirmed map pin, address, hours, phone, directional landmark.
10. **FAQ:** 4–6 practical customer questions with verified answers.
11. **Footer:** all key information, social links, map and phone actions.
12. **Mobile action bar:** Menu / Directions / Call; ensure it does not cover important content.

## 3. User flows

### Flow A — discover the food

`Social post / search result → Homepage → Menu → Item detail/price → Call or visit`

Requirements: menu action visible in hero; menu categories scannable; prices visible without opening separate popups.

### Flow B — find the shop

`Search / shared link → Homepage → Visit Us → Open Directions → Google Maps`

Requirements: owner-confirmed pin, address, local landmark cue, and tap target large enough for mobile.

### Flow C — quick phone inquiry

`Homepage → Call CTA → Native phone dialer`

Requirements: `tel:` URL; correct country code; clear CTA wording; no click-to-call if the number has not been confirmed.

### Flow D — owner updates menu

`Owner sends revised data → Developer/CMS updates menu source → Preview → Owner approves → Publish`

For a lightweight implementation, store menu data centrally in a JSON/TS file. If the owner needs to update it personally, choose an accessible CMS or simple managed content workflow.

## 4. Navigation behavior

- Desktop: compact sticky header, no oversized mega menu.
- Mobile: simple menu drawer or anchor links; ensure keyboard and screen-reader support.
- CTA buttons should navigate to the menu, open Google Maps, or invoke the phone dialer. No decorative controls that appear functional but do nothing.
- Respect reduced-motion preferences and avoid scroll-jacking.

## 5. Map action

Use the owner-confirmed Google Business Profile/Maps URL when supplied. Temporary fallback search URL:

`https://www.google.com/maps/search/?api=1&query=Waffled%20Sreemangal%2C%20Sreemangal%203210`

This query link is only a fallback and should be replaced with the exact pin before launch.

## 6. FAQ topics to confirm

- Where exactly is Waffled Sreemangal?
- What are today's opening hours?
- Can customers take away their order?
- Can customers call ahead?
- Are all menu items available every day?
- Is delivery available?
- Which payment methods are accepted?

Only publish answers that the owner has confirmed.
