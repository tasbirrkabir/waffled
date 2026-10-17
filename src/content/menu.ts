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
 * Menu synced with the shop's official sources:
 * Basic Flavours Waffle from the Google Maps listing (updated by the owner,
 * Jun 2026). Nutella Flavours Waffle, Shakes, Drinks and Add-ons verified
 * against the shop's official menu poster on its Facebook page.
 * Items and prices may change; the site shows a "call to confirm" note.
 */
export const menu: MenuCategory[] = [
  {
    id: "basic-waffles",
    label: "Basic Flavours Waffle",
    blurb: "The classics from our Google Maps menu, pressed fresh on a stick.",
    items: [
      {
        id: "strawberry",
        name: "Strawberry",
        description: "Sweet strawberry glaze over a golden waffle pop.",
        price: 179,
        image: "/images/products/strawberry.webp",
        imageAlt: "Strawberry waffle pop on a stick with glossy red glaze and fresh strawberry slices",
      },
      {
        id: "blueberry",
        name: "Blueberry",
        description: "Blueberry sauce and a cloud of cream on a warm waffle.",
        price: 179,
        image: "/images/products/blueberry.webp",
        imageAlt: "Blueberry waffle pop on a stick with purple blueberry compote and fresh blueberries",
      },
      {
        id: "choco-chip-classic",
        name: "Choco Chip Classic",
        description: "Chocolate chips folded into a classic golden waffle pop.",
        price: 179,
        image: "/images/products/choco-chip-classic.webp",
        imageAlt: "Choco Chip Classic waffle pop with dark chocolate chips and chocolate drizzle",
      },
      {
        id: "banana",
        name: "Banana",
        description: "Sliced banana on a warm, buttery waffle pop.",
        price: 179,
        image: "/images/products/banana.webp",
        imageAlt: "Banana waffle pop on a stick with fresh banana slices and honey drizzle",
      },
      {
        id: "kitkat",
        name: "Kitkat",
        description: "KitKat shards over a chocolate-glazed waffle pop.",
        price: 179,
        image: "/images/products/kitkat.webp",
        imageAlt: "Kitkat waffle pop coated in milk chocolate with crunchy wafer bar pieces",
      },
      {
        id: "nutella-crunch",
        name: "Nutella Crunch",
        description: "Waffle pop dipped in Nutella-style chocolate with a crunchy finish.",
        price: 159,
        tags: ["popular"],
        image: "/images/products/nutella-crunch.webp",
        imageAlt: "Nutella Crunch waffle pop dipped in glossy hazelnut chocolate with crispy crunch topping",
      },
      {
        id: "red-velvet",
        name: "Red Velvet",
        description: "Soft red-velvet flavoured waffle with a creamy glaze.",
        price: 169,
        image: "/images/products/red-velvet.webp",
        imageAlt: "Red Velvet waffle pop with cream cheese glaze drizzle and red velvet crumbs",
      },
      {
        id: "strawberry-swirl",
        name: "Strawberry Swirl",
        description: "Strawberry drizzle swirled over a golden waffle pop.",
        price: 169,
        tags: ["must-try"],
        image: "/images/products/strawberry-swirl.webp",
        imageAlt: "Strawberry Swirl waffle pop with swirled pink glaze, whipped cream and chocolate drizzle",
      },
      {
        id: "oreo-crunch",
        name: "Oreo Crunch",
        description: "Crushed Oreo cookies over a chocolate-glazed waffle pop.",
        price: 219,
        tags: ["new", "popular"],
        image: "/images/products/oreo-crunch.webp",
        imageAlt: "Oreo Crunch waffle pop with dark chocolate glaze covered in crushed cookies",
      },
      {
        id: "biscoff-bliss",
        name: "Biscoff Bliss",
        description: "Caramelised Biscoff spread with a biscuit crumble topping.",
        price: 219,
        tags: ["new"],
        image: "/images/products/biscoff-bliss.webp",
        imageAlt: "Biscoff Bliss waffle pop with caramelised biscuit spread, crumble and caramel drizzle",
      },
    ],
  },
  {
    id: "nutella-waffles",
    label: "Nutella Flavours Waffle",
    blurb: "For the seriously chocolate-hazelnut obsessed.",
    items: [
      {
        id: "banana-nutella-nuts",
        name: "Banana Nutella with Nuts",
        description: "Sliced banana, hazelnut spread and a sprinkle of nuts.",
        price: 169,
        image: "/images/products/banana-nutella-nuts.webp",
        imageAlt: "Banana Nutella waffle pop with hazelnut chocolate, banana slices and chopped hazelnuts",
      },
      {
        id: "nutella-crunch-nuts",
        name: "Nutella Crunch with Nuts",
        description: "The classic crunch, upgraded with crunchy nut topping.",
        price: 169,
        image: "/images/products/nutella-crunch-nuts.webp",
        imageAlt: "Nutella Crunch waffle pop dipped in hazelnut chocolate with crunchy chopped nuts",
      },
      {
        id: "strawberry-banana-nutella",
        name: "Strawberry Banana Nutella",
        description: "Strawberry and banana over a hazelnut-chocolate waffle pop.",
        price: 189,
        image: "/images/products/strawberry-banana-nutella.webp",
        imageAlt: "Strawberry Banana Nutella waffle pop topped with strawberry and banana slices",
      },
      {
        id: "double-strawberry-nutella",
        name: "Double Strawberry Nutella",
        description: "Twice the strawberry, all the Nutella. A fruity favourite.",
        price: 189,
        image: "/images/products/double-strawberry-nutella.webp",
        imageAlt: "Double Strawberry Nutella waffle pop with strawberry glaze and fresh strawberries",
      },
      {
        id: "kitkat-crunch",
        name: "Kitkat Crunch",
        description: "KitKat shards snapped over a chocolate-dipped waffle pop.",
        price: 189,
        tags: ["must-try"],
        image: "/images/products/kitkat-crunch.webp",
        imageAlt: "Kitkat Crunch waffle pop with chocolate dip and broken wafer bar pieces",
      },
    ],
  },
  {
    id: "shakes",
    label: "Shakes",
    blurb: "Thick, cold and blended to order.",
    items: [
      {
        id: "oreo-crush",
        name: "Oreo Crush",
        description: "Cookies-and-cream shake blended with crushed Oreo.",
        price: 149,
        tags: ["popular"],
        image: "/images/products/oreo-crush.webp",
        imageAlt: "Oreo Crush milkshake in a tall glass with whipped cream and crushed cookies",
      },
      {
        id: "strawberry-breeze",
        name: "Strawberry Breeze",
        description: "Fresh strawberry shake, light and fruity.",
        price: 149,
        image: "/images/products/strawberry-breeze.webp",
        imageAlt: "Strawberry Breeze milkshake, thick and pink, topped with whipped cream and a strawberry",
      },
      {
        id: "kitkat-fusion",
        name: "Kitkat Fusion",
        description: "Chocolate wafer shake with a KitKat finish.",
        price: 159,
        image: "/images/products/kitkat-fusion.webp",
        imageAlt: "Kitkat Fusion chocolate wafer milkshake topped with whipped cream and wafer sticks",
      },
      {
        id: "blueberry-frost",
        name: "Blueberry Frost",
        description: "Icy blueberry blend with a sweet purple swirl.",
        price: 159,
        image: "/images/products/blueberry-frost.webp",
        imageAlt: "Blueberry Frost milkshake, thick and purple, topped with whipped cream and blueberries",
      },
      {
        id: "nutella-bliss",
        name: "Nutella Bliss",
        description: "The hazelnut classic, sippable and rich.",
        price: 169,
        tags: ["must-try"],
        image: "/images/products/nutella-bliss.webp",
        imageAlt: "Nutella Bliss hazelnut chocolate milkshake with whipped cream and chopped hazelnuts",
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks & Add-ons",
    blurb: "Something sippable, plus extras to pimp your waffle.",
    items: [
      {
        id: "mint-lemonade",
        name: "Mint Lemonade",
        description: "Cool, zesty and refreshing, the perfect waffle partner.",
        price: 49,
        image: "/images/products/mint-lemonade.webp",
        imageAlt: "Mint lemonade in a tall glass with ice cubes, lemon slices and mint leaves",
      },
      {
        id: "house-milk-coffee",
        name: "House Milk Coffee",
        description: "Hot or iced, made the house way.",
        price: 80,
        image: "/images/products/house-milk-coffee.webp",
        imageAlt: "House iced milk coffee in a tall glass with swirling milk and ice cubes",
      },
      {
        id: "add-on-ice-cream",
        name: "Add-on: Ice Cream",
        description: "A scoop on top of any waffle pop.",
        price: 50,
        image: "/images/products/add-on-ice-cream.webp",
        imageAlt: "Single scoop of vanilla ice cream in a small paper cup",
      },
      {
        id: "add-on-whipped-cream",
        name: "Add-on: Whipped Cream",
        description: "Extra cloud of cream on anything.",
        price: 50,
        image: "/images/products/add-on-whipped-cream.webp",
        imageAlt: "Swirl of whipped cream on a small plate",
      },
      {
        id: "add-on-extra-nutella",
        name: "Add-on: Extra Nutella",
        description: "Because there is never enough.",
        price: 50,
        image: "/images/products/add-on-extra-nutella.webp",
        imageAlt: "Small bowl of creamy hazelnut chocolate spread",
      },
      {
        id: "add-on-extra-nuts",
        name: "Add-on: Extra Nuts",
        description: "Crunchy nut sprinkle, extra portion.",
        price: 50,
        image: "/images/products/add-on-extra-nuts.webp",
        imageAlt: "Small bowl of chopped mixed nuts",
      },
      {
        id: "add-on-choco-chip",
        name: "Add-on: Choco Chip",
        description: "More chocolate chips, more happiness.",
        price: 50,
        image: "/images/products/add-on-choco-chip.webp",
        imageAlt: "Small bowl of dark chocolate chips",
      },
    ],
  },
];

export const signaturePicks = [
  {
    id: "strawberry-swirl",
    name: "Strawberry Swirl",
    description: "Strawberry drizzle, whipped cream and a chocolate zig-zag over a warm waffle pop.",
    price: 169,
    image: "/images/products/strawberry-swirl.webp",
    alt: "Strawberry Swirl waffle pop with cream and chocolate drizzle at Waffled Sreemangal",
    tag: "Must try",
  },
  {
    id: "oreo-crunch",
    name: "Oreo Crunch",
    description: "Crushed cookies over a glossy chocolate glaze. The new arrival everyone posts about.",
    price: 219,
    image: "/images/products/oreo-crunch.webp",
    alt: "Oreo Crunch waffle pop coated in chocolate with cookie pieces at Waffled Sreemangal",
    tag: "New arrival",
  },
  {
    id: "nutella-crunch",
    name: "Nutella Crunch",
    description: "The one that started it all: chocolate-dipped waffle pop with a crunchy finish.",
    price: 159,
    image: "/images/products/nutella-crunch.webp",
    alt: "Nutella Crunch waffle pop with hazelnut chocolate dip and crunchy topping at Waffled Sreemangal",
    tag: "Crowd favourite",
  },
] as const;

/**
 * Weekly combo offer from the shop's official Facebook poster.
 * Berry + Brew Wednesday: any berry waffle + cold coffee.
 */
export const weeklyOffer = {
  name: "Berry + Brew Wednesday",
  description:
    "Any berry waffle (Blueberry Burst or Strawberry Swirl) plus a cold coffee, every Wednesday.",
  price: 259,
  regularPrice: 310,
  savings: 51,
  day: "Wednesday",
  image: "/images/offer-berry-brew.webp",
  alt: "Waffled Berry and Brew Wednesday offer poster: any berry waffle plus cold coffee for 259 taka",
} as const;

export const faqs = [
  {
    q: "Where exactly is Waffled Sreemangal?",
    a: "We're on Radhanagar Road in Sreemangal, near Grand Sultan Tea Resort & Golf Club, right at the entrance of Radhanagar Road. Tap \"Open in Google Maps\" in the Visit section for turn-by-turn directions.",
  },
  {
    q: "What are your opening hours?",
    a: "We're open every day from 12:00 PM to 11:00 PM, and until 11:30 PM on Mondays. Hours can vary on holidays, so a quick call before a late visit saves you a trip.",
  },
  {
    q: "Can I order online?",
    a: "Yes! Build your order on our Order Online page, then send it to us on WhatsApp or over a quick call. We'll have it boxed and ready for pickup.",
  },
  {
    q: "Can I take my order away?",
    a: "Yes, every waffle pop is served in its own box, made for strolling around Radhanagar or taking home.",
  },
  {
    q: "Are all menu items available every day?",
    a: "Availability can vary, especially for new arrivals and seasonal specials. If you're coming for something specific, call ahead and we'll have it ready.",
  },
  {
    q: "How much do waffles cost?",
    a: "Waffle pops start from ৳159, shakes from ৳149, and add-ons are ৳50 each. The full menu with prices is on the Menu page.",
  },
] as const;
