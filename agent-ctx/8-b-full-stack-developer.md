# Task 8-b — Admin Panel UI (Waffled Sreemangal)

Task: Build /admin panel UI (login + Dashboard/Products/Orders/Content tabs)
Agent: full-stack-developer (subagent)
Task ID: 8-b
Date: 2026 worklog append — see /home/z/my-project/worklog.md "Task ID: 8-b" entry for the canonical record.

## What was built

Single route `src/app/admin/page.tsx` (client component) + `src/components/admin/**`:

- **api.ts** — fetch wrapper (relative URLs only). 401 → fires registered handler
  (page flips to login + "Session expired" toast, deduped 2s) and throws
  UnauthorizedError so callers stay quiet. `uploadImage(file, "product"|"site")`.
- **use-admin-data.ts** — loader hook; effect deps `[loader, nonce]` so filter
  changes refetch; stale responses discarded via `cancelled` flag; loading flip
  runs on a microtask (react-hooks/set-state-in-effect compliance).
- **login-screen.tsx** — plain fetch on purpose (401 = wrong password, not
  session expiry). Wrong password → inline error + sonner toast + select().
  Dev hint comment only (test password waffled-admin-2026, never rendered).
- **page.tsx** — session probe on mount → login ⇄ panel; controlled Tabs
  (Dashboard "View all" jumps to Orders); sticky footer via flex column +
  mt-auto; logout POSTs /api/admin/logout then shows login.
- **dashboard-tab.tsx** — 6 stat cards; recharts ComposedChart (pink #F24C8B
  revenue area w/ gradient + lime #BCE84A order bars w/ ink stroke, dual Y
  axes, X = `label`); top products; status breakdown chips; recent orders
  (table md+ / cards mobile, date-fns timeAgo).
- **products-tab.tsx** — table md+ / cards mobile; quick eye/star toggles
  (optimistic, revert on error); edit + AlertDialog delete; product count.
- **product-dialog.tsx** — name/category/price/description, 3 tag checkboxes
  (pink/orange/cyan), image upload (FormData → /api/admin/upload type=product)
  with preview + remove + alt text, active/signature switches; signature
  reveals badge-label input + card-copy textarea. Client validation mirrors
  zod (int price ≥ ৳1, name ≥ 2 chars).
- **category-manager.tsx** — dialog: add (label + optional blurb), inline
  rename, delete (button disabled while non-empty, API 409 also surfaced).
- **orders-tab.tsx** — status chips + debounced search (q → order #/name/phone);
  table md+ with expandable second <tr> / mobile cards with expand; details
  show items, address/pickup time, payment (+TrxId chip), notes; status Select
  → PATCH + toast + reload; AlertDialog delete.
- **content-tab.tsx** — hero: preview (Custom/Default badge), upload
  (type=site), alt text, "Use default" resets to "", Save → PATCH settings;
  signature picks: checkboxes over ALL active products grouped by category,
  optimistic PATCH {id, isSignature}, helper text points to Products tab for
  badge label + copy.
- **status-badge.tsx** — status colors: new=orange, confirmed=cyan,
  preparing=amber, ready=lime, completed=emerald, cancelled=warm-grey (no
  blue/indigo anywhere).

## Design language

Cream page, white surface cards `border-2 border-ink/10 rounded-2xl`,
font-display headings, hard offset shadows on primary actions
(`shadow-[3px_3px_0_0_var(--color-ink)]`), pink #F24C8B / orange #FF7B30 /
lime #BCE84A / cyan #42C7D9 accents. Money via formatTk (৳ + en-IN).
Dates via date-fns. next/image everywhere (unoptimized per next.config).

## Verification

- `bun run lint` — clean.
- `bunx tsc --noEmit` — zero errors in admin files (6 pre-existing errors
  elsewhere: examples/, skills/, Task 8-a route spread-typing; ignoreBuildErrors
  is on and those routes are runtime-verified).
- curl: wrong password 401 + message; correct password sets cookie; session
  with/without cookie; analytics + orders search 200.
- GET /admin 200, dev.log shows no compile errors for these files (only the
  pre-existing root-layout metadataBase warning).

## Caveats for main agent (browser verification)

1. Verify login → panel, wrong-password toast, logout, and session-expiry
   (login, delete the waffled_admin cookie via devtools, then interact).
2. Products: add/edit dialog incl. image upload + preview; eye/star quick
   toggles; delete confirm.
3. Categories: add / rename / delete (delete disabled while non-empty).
4. Orders: filter chips, search, expand row, status update, delete.
5. Content: hero upload/save ("Use default" → PATCH heroImage:"" restores the
   site default photo); signature checkboxes move products in/out of the home
   "Signature picks" section.
6. Chart renders on mobile width (X labels auto-skip) — check 390px viewport.
