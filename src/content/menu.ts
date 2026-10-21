export type MenuTag = "popular" | "new" | "must-try";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  tags?: MenuTag[];
  image: string;
  imageAlt: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  blurb: string;
  items: MenuItem[];
}

/** Shape used by the home page "Signature picks" section */
export interface SignaturePick {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  alt: string;
  tag: string;
}

/**
 * Demo menu catalog:
 * All items, categories and descriptions are configured for demo presentation.
 */
export const menu: MenuCategory[] = [
  {
    id: "basic-waffles",
    label: "Demo Classic Waffles",
    blurb: "Handcrafted golden waffle pops on a stick, pressed fresh.",
    items: [
      {
        id: "strawberry",
        name: "Demo Strawberry",
        description: "Sweet strawberry glaze over a warm golden waffle pop.",
        price: 179,
        image: "/images/products/strawberry.webp",
        imageAlt: "Demo Strawberry waffle pop with glaze",
      },
      {
        id: "blueberry",
        name: "Demo Blueberry",
        description: "Blueberry compote and a cloud of cream on a warm waffle pop.",
        price: 179,
        image: "/images/products/blueberry.webp",
        imageAlt: "Demo Blueberry waffle pop",
      },
      {
        id: "choco-chip-classic",
        name: "Demo Choco Chip",
        description: "Dark chocolate chips folded into a classic golden waffle pop.",
        price: 179,
        image: "/images/products/choco-chip-classic.webp",
        imageAlt: "Demo Choco Chip waffle pop",
      },
      {
        id: "banana",
        name: "Demo Banana",
        description: "Sliced banana and honey drizzle on a warm buttery waffle pop.",
        price: 179,
        image: "/images/products/banana.webp",
        imageAlt: "Demo Banana waffle pop",
      },
      {
        id: "kitkat",
        name: "Demo Kitkat",
        description: "Crisp chocolate wafer shards over a chocolate-glazed waffle pop.",
        price: 179,
        image: "/images/products/kitkat.webp",
        imageAlt: "Demo Kitkat waffle pop",
      },
      {
        id: "nutella-crunch",
        name: "Demo Nutella Crunch",
        description: "Waffle pop dipped in hazelnut chocolate with a crunchy finish.",
        price: 159,
        tags: ["popular"],
        image: "/images/products/nutella-crunch.webp",
        imageAlt: "Demo Nutella Crunch waffle pop",
      },
      {
        id: "red-velvet",
        name: "Demo Red Velvet",
        description: "Soft red velvet waffle with cream cheese drizzle.",
        price: 169,
        image: "/images/products/red-velvet.webp",
        imageAlt: "Demo Red Velvet waffle pop",
      },
      {
        id: "strawberry-swirl",
        name: "Demo Strawberry Swirl",
        description: "Swirled strawberry glaze, whipped cream, and chocolate zig-zag.",
        price: 169,
        tags: ["must-try"],
        image: "/images/products/strawberry-swirl.webp",
        imageAlt: "Demo Strawberry Swirl waffle pop",
      },
      {
        id: "oreo-crunch",
        name: "Demo Oreo Crunch",
        description: "Dark chocolate coating topped with crushed chocolate cookies.",
        price: 219,
        tags: ["new"],
        image: "/images/products/oreo-crunch.webp",
        imageAlt: "Demo Oreo Crunch waffle pop",
      },
      {
        id: "biscoff-bliss",
        name: "Demo Biscoff Bliss",
        description: "Caramelized biscuit spread topped with biscuit crumble.",
        price: 219,
        tags: ["new"],
        image: "/images/products/biscoff-bliss.webp",
        imageAlt: "Demo Biscoff Bliss waffle pop",
      },
    ],
  },
  {
    id: "nutella-waffles",
    label: "Demo Premium Waffles",
    blurb: "Loaded spreads, fresh fruit and crushed nut toppings.",
    items: [
      {
        id: "banana-nutella-nuts",
        name: "Demo Banana Nutella",
        description: "Hazelnut spread with fresh banana and chopped hazelnuts.",
        price: 169,
        image: "/images/products/banana-nutella-nuts.webp",
        imageAlt: "Demo Banana Nutella waffle pop",
      },
      {
        id: "nutella-crunch-nuts",
        name: "Demo Nutella & Nuts",
        description: "Hazelnut spread with extra roasted crunchy nuts.",
        price: 169,
        image: "/images/products/nutella-crunch-nuts.webp",
        imageAlt: "Demo Nutella & Nuts waffle pop",
      },
      {
        id: "strawberry-banana-nutella",
        name: "Demo Strawberry Banana",
        description: "Fresh strawberries, bananas and rich hazelnut spread.",
        price: 189,
        image: "/images/products/strawberry-banana-nutella.webp",
        imageAlt: "Demo Strawberry Banana waffle pop",
      },
      {
        id: "double-strawberry-nutella",
        name: "Demo Double Berry",
        description: "Double strawberry glaze and rich hazelnut chocolate spread.",
        price: 189,
        image: "/images/products/double-strawberry-nutella.webp",
        imageAlt: "Demo Double Berry waffle pop",
      },
      {
        id: "kitkat-crunch",
        name: "Demo Kitkat Crisp",
        description: "Waffle pop coated with crushed crispy chocolate wafers.",
        price: 189,
        tags: ["popular"],
        image: "/images/products/kitkat-crunch.webp",
        imageAlt: "Demo Kitkat Crisp waffle pop",
      },
    ],
  },
  {
    id: "shakes",
    label: "Demo Shakes",
    blurb: "Thick ice-cream shakes topped with whipped cream.",
    items: [
      {
        id: "oreo-crush",
        name: "Demo Oreo Shake",
        description: "Thick cookies and cream shake with cookie crumbles.",
        price: 159,
        tags: ["popular"],
        image: "/images/products/oreo-crush.webp",
        imageAlt: "Demo Oreo Shake",
      },
      {
        id: "strawberry-breeze",
        name: "Demo Strawberry Shake",
        description: "Fresh strawberry milkshake with whipped cream.",
        price: 159,
        image: "/images/products/strawberry-breeze.webp",
        imageAlt: "Demo Strawberry Shake",
      },
      {
        id: "kitkat-fusion",
        name: "Demo Kitkat Shake",
        description: "Chocolate wafer shake topped with wafer crunch.",
        price: 159,
        image: "/images/products/kitkat-fusion.webp",
        imageAlt: "Demo Kitkat Shake",
      },
      {
        id: "blueberry-frost",
        name: "Demo Blueberry Shake",
        description: "Blueberry shake with whipped cream.",
        price: 169,
        image: "/images/products/blueberry-frost.webp",
        imageAlt: "Demo Blueberry Shake",
      },
      {
        id: "nutella-bliss",
        name: "Demo Nutella Shake",
        description: "Hazelnut chocolate shake with crushed nuts.",
        price: 179,
        tags: ["must-try"],
        image: "/images/products/nutella-bliss.webp",
        imageAlt: "Demo Nutella Shake",
      },
    ],
  },
  {
    id: "drinks-addons",
    label: "Demo Drinks & Add-ons",
    blurb: "Refreshing beverages and extra toppings to customize your waffle.",
    items: [
      {
        id: "mint-lemonade",
        name: "Demo Mint Lemonade",
        description: "Zesty lemon and fresh mint cooler over ice.",
        price: 49,
        tags: ["popular"],
        image: "/images/products/mint-lemonade.webp",
        imageAlt: "Demo Mint Lemonade",
      },
      {
        id: "house-milk-coffee",
        name: "Demo Milk Coffee",
        description: "Chilled sweet milk coffee brewed fresh.",
        price: 80,
        image: "/images/products/house-milk-coffee.webp",
        imageAlt: "Demo Milk Coffee",
      },
      {
        id: "add-on-ice-cream",
        name: "Demo Ice Cream Scoop",
        description: "Vanilla ice cream scoop served on the side.",
        price: 50,
        image: "/images/products/add-on-ice-cream.webp",
        imageAlt: "Demo Ice Cream Scoop",
      },
      {
        id: "add-on-whipped-cream",
        name: "Demo Whipped Cream",
        description: "Light and fluffy whipped cream.",
        price: 50,
        image: "/images/products/add-on-whipped-cream.webp",
        imageAlt: "Demo Whipped Cream",
      },
      {
        id: "add-on-extra-nutella",
        name: "Demo Extra Nutella",
        description: "Side serving of rich hazelnut spread.",
        price: 50,
        image: "/images/products/add-on-extra-nutella.webp",
        imageAlt: "Demo Extra Nutella",
      },
      {
        id: "add-on-extra-nuts",
        name: "Demo Roasted Nuts",
        description: "Side of toasted crunchy hazelnuts.",
        price: 50,
        image: "/images/products/add-on-extra-nuts.webp",
        imageAlt: "Demo Roasted Nuts",
      },
      {
        id: "add-on-choco-chip",
        name: "Demo Chocolate Chips",
        description: "Dark chocolate chips topping.",
        price: 50,
        image: "/images/products/add-on-choco-chip.webp",
        imageAlt: "Demo Chocolate Chips",
      },
    ],
  },
];

export const signaturePicks: SignaturePick[] = [
  {
    id: "strawberry-swirl",
    name: "Demo Strawberry Swirl",
    description: "Swirled strawberry glaze and chocolate zig-zag.",
    price: 169,
    image: "/images/products/strawberry-swirl.webp",
    alt: "Demo Strawberry Swirl waffle pop",
    tag: "Must try",
  },
  {
    id: "oreo-crunch",
    name: "Demo Oreo Crunch",
    description: "Crushed cookies over glossy chocolate glaze. A top demo favourite.",
    price: 219,
    image: "/images/products/oreo-crunch.webp",
    alt: "Demo Oreo Crunch waffle pop",
    tag: "New arrival",
  },
  {
    id: "nutella-crunch",
    name: "Demo Nutella Crunch",
    description: "Signature chocolate-dipped waffle pop with a crunchy finish.",
    price: 159,
    image: "/images/products/nutella-crunch.webp",
    alt: "Demo Nutella Crunch waffle pop",
    tag: "Crowd favourite",
  },
];

export const weeklyOffer = {
  name: "Demo Berry + Brew Combo",
  description:
    "Any demo berry waffle plus a demo cold coffee.",
  price: 259,
  regularPrice: 310,
  savings: 51,
  day: "Wednesday",
  image: "/images/offer-berry-brew.webp",
  alt: "Demo Berry and Brew Combo offer poster",
} as const;

export const faqs = [
  {
    q: "Where is Demo Waffles located?",
    a: "We are located at 123 Demo Street, Demo District. Tap \"Open in Google Maps\" in the Visit section for demo location details.",
  },
  {
    q: "What are your demo opening hours?",
    a: "We're open every day from 12:00 PM to 11:00 PM for demo showcase. Hours can be configured in the admin settings.",
  },
  {
    q: "Can I try placing a demo order?",
    a: "Yes! Build your order on our Order Online page, enter demo customer details, and submit a test order to test the workflow.",
  },
  {
    q: "Is takeaway packaging supported in demo?",
    a: "Yes, every demo waffle pop is packaged ready for takeaway or pickup.",
  },
  {
    q: "Can menu items be edited in this demo?",
    a: "Yes! All demo items, prices, and categories can be modified directly from the /admin control room.",
  },
  {
    q: "What are the demo price ranges?",
    a: "Demo waffle pops start from ৳159, shakes from ৳149, and add-ons are ৳50 each. The full menu with prices is on the Menu page.",
  },
] as const;
