# 06 — Menu Content Model & Owner Approval Sheet

## 1. Why this matters

A public directory contains a menu photo, but the image is not sufficiently reliable to transcribe every waffle name, variant, price, or current availability. Build the site around an owner-approved menu rather than guessing from the photo.

## 2. Owner submission template

Copy and complete this table for every item. Duplicate rows as needed.

| Category | Exact item name | Description | Price (BDT) | Available? | Photo filename | Tags | Notes |
|---|---|---|---:|---|---|---|---|
| Waffles | `[exact name]` | `[ingredients/toppings, concise]` | `[৳]` | Yes/No | `[file]` | `[popular/new/etc.]` | `[variants, add-ons]` |
| Chicken & Bites | `[exact name]` | `[description]` | `[৳]` | Yes/No | `[file]` | `[optional]` | `[portion/variant]` |
| Fries & Sides | `[exact name]` | `[description]` | `[৳]` | Yes/No | `[file]` | `[optional]` | `[portion]` |
| Dips | `[exact name]` | `[description]` | `[৳]` | Yes/No | `[file]` | `[optional]` | `[price per serving?]` |
| Drinks | `[exact name]` | `[description]` | `[৳]` | Yes/No | `[file]` | `[optional]` | `[size]` |

## 3. Draft category taxonomy

These are suggested categories based on a public menu photograph and must be confirmed:

- Waffles
- Chicken & Bites
- Fries & Sides
- Dips & Sauces
- Drinks

The photo appears to show categories resembling crispy chicken, crispy wings, chicken bites, sea-salt fries, dips/sauces, and basic drinks. Exact item names, spelling, prices, and ingredients are **not approved** until confirmed directly by the owner.

## 4. Recommended data shape

Example only; replace with owner-approved data:

```json
{
  "categories": [
    { "id": "waffles", "label": "Waffles", "sortOrder": 1 },
    { "id": "chicken-bites", "label": "Chicken & Bites", "sortOrder": 2 },
    { "id": "sides", "label": "Fries & Sides", "sortOrder": 3 },
    { "id": "dips", "label": "Dips & Sauces", "sortOrder": 4 },
    { "id": "drinks", "label": "Drinks", "sortOrder": 5 }
  ],
  "items": [
    {
      "id": "replace-with-stable-id",
      "categoryId": "waffles",
      "name": "OWNER-APPROVED NAME",
      "description": "OWNER-APPROVED DESCRIPTION",
      "priceBdt": 0,
      "image": "/images/menu/replace-me.webp",
      "available": true,
      "tags": []
    }
  ]
}
```

Do not use `0` as a real displayed price. The value above is a schema placeholder.

## 5. Menu UI rules

- Always show price as `৳250` or `BDT 250` consistently.
- Do not show a product card as orderable when it is out of stock; either hide it or display a clearly approved “Unavailable today” state.
- Keep variants explicit: size, topping, add-on, and portion prices must not be ambiguous.
- Distinguish price-per-item from combo price.
- Use descriptive alt text; do not place all ingredient information only inside an image.
- Make category navigation work on touch and keyboard.
- Consider a text-only downloadable menu PDF only if the owner can keep both formats updated.

## 6. Owner must confirm

- [ ] Spelling of every item.
- [ ] Price and serving size of every item.
- [ ] Ingredients and allergen-sensitive details if displayed.
- [ ] Current availability and seasonal items.
- [ ] Approved product photo for each item.
- [ ] Whether add-ons, combos, or customizations are available.
- [ ] Whether prices are dine-in, takeaway, or delivery-specific.
- [ ] Tax/packaging/service charges, if applicable, and how they are communicated.

## 7. Update policy

Assign one person who has permission to approve price changes. Date-stamp menu data internally (not necessarily on the page) and re-check it whenever a new print menu or promotion is issued. The website and any QR-linked menu must match the menu customers receive in-store.
