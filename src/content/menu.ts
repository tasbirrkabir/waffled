export type MenuTag = "popular" | "new" | "must-try";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  tags?: MenuTag[];
}

export interface MenuCategory {
  id: string;
  label: string;
  blurb: string;
  items: MenuItem[];
}

/**
 * Menu synced with the shop's official Google Maps listing
 * (Basic Flavours Waffle updated by the owner, Jun 2026).
 * Nutella Flavours Waffle, Shakes and Drinks follow the shop's menu board.
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
      },
      {
        id: "blueberry",
        name: "Blueberry",
        description: "Blueberry sauce and a cloud of cream on a warm waffle.",
        price: 179,
      },
      {
        id: "choco-chip-classic",
        name: "Choco Chip Classic",
        description: "Chocolate chips folded into a classic golden waffle pop.",
        price: 179,
      },
      {
        id: "banana",
        name: "Banana",
        description: "Sliced banana on a warm, buttery waffle pop.",
        price: 179,
      },
      {
        id: "kitkat",
        name: "Kitkat",
        description: "KitKat shards over a chocolate-glazed waffle pop.",
        price: 179,
      },
      {
        id: "nutella-crunch",
        name: "Nutella Crunch",
        description: "Waffle pop dipped in Nutella-style chocolate with a crunchy finish.",
        price: 159,
        tags: ["popular"],
      },
      {
        id: "red-velvet",
        name: "Red Velvet",
        description: "Soft red-velvet flavoured waffle with a creamy glaze.",
        price: 169,
      },
      {
        id: "strawberry-swirl",
        name: "Strawberry Swirl",
        description: "Strawberry drizzle swirled over a golden waffle pop.",
        price: 169,
        tags: ["must-try"],
      },
      {
        id: "oreo-crunch",
        name: "Oreo Crunch",
        description: "Crushed Oreo cookies over a chocolate-glazed waffle pop.",
        price: 219,
        tags: ["new", "popular"],
      },
      {
        id: "biscoff-bliss",
        name: "Biscoff Bliss",
        description: "Caramelised Biscoff spread with a biscuit crumble topping.",
        price: 219,
        tags: ["new"],
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
      },
      {
        id: "nutella-crunch-nuts",
        name: "Nutella Crunch with Nuts",
        description: "The classic crunch, upgraded with crunchy nut topping.",
        price: 169,
      },
      {
        id: "strawberry-banana-nutella",
        name: "Strawberry Banana Nutella",
        description: "Strawberry and banana over a hazelnut-chocolate waffle pop.",
        price: 189,
      },
      {
        id: "double-strawberry-nutella",
        name: "Double Strawberry Nutella",
        description: "Twice the strawberry, all the Nutella. A fruity favourite.",
        price: 189,
      },
      {
        id: "kitkat-crunch",
        name: "Kitkat Crunch",
        description: "KitKat shards snapped over a chocolate-dipped waffle pop.",
        price: 189,
        tags: ["must-try"],
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
        price: 159,
        tags: ["popular"],
      },
      {
        id: "strawberry-breeze",
        name: "Strawberry Breeze",
        description: "Fresh strawberry shake, light and fruity.",
        price: 159,
      },
      {
        id: "kitkat-fusion",
        name: "Kitkat Fusion",
        description: "Chocolate wafer shake with a KitKat finish.",
        price: 159,
      },
      {
        id: "blueberry-frost",
        name: "Blueberry Frost",
        description: "Icy blueberry blend with a sweet purple swirl.",
        price: 169,
      },
      {
        id: "nutella-bliss",
        name: "Nutella Bliss",
        description: "The hazelnut classic, sippable and rich.",
        price: 179,
        tags: ["must-try"],
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
      },
      {
        id: "house-milk-coffee",
        name: "House Milk Coffee",
        description: "Hot or iced, made the house way.",
        price: 80,
      },
      {
        id: "add-on-ice-cream",
        name: "Add-on: Ice Cream",
        description: "A scoop on top of any waffle pop.",
        price: 50,
      },
      {
        id: "add-on-whipped-cream",
        name: "Add-on: Whipped Cream",
        description: "Extra cloud of cream on anything.",
        price: 50,
      },
      {
        id: "add-on-extra-nutella",
        name: "Add-on: Extra Nutella",
        description: "Because there is never enough.",
        price: 50,
      },
      {
        id: "add-on-extra-nuts",
        name: "Add-on: Extra Nuts",
        description: "Crunchy nut sprinkle, extra portion.",
        price: 50,
      },
      {
        id: "add-on-choco-chip",
        name: "Add-on: Choco Chip",
        description: "More chocolate chips, more happiness.",
        price: 50,
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
    image: "/images/sig-strawberry.webp",
    alt: "Strawberry Swirl waffle pop with cream and chocolate drizzle at Waffled Sreemangal",
    tag: "Must try",
  },
  {
    id: "oreo-crunch",
    name: "Oreo Crunch",
    description: "Crushed cookies over a glossy chocolate glaze. The new arrival everyone posts about.",
    price: 219,
    image: "/images/sig-oreo.webp",
    alt: "Oreo Crunch waffle pop coated in chocolate with cookie pieces at Waffled Sreemangal",
    tag: "New arrival",
  },
  {
    id: "nutella-crunch",
    name: "Nutella Crunch",
    description: "The one that started it all: chocolate-dipped waffle pop with a crunchy finish.",
    price: 159,
    image: "/images/sig-nutella.webp",
    alt: "Assorted waffle pops in boxes held up at Waffled Sreemangal shop",
    tag: "Crowd favourite",
  },
] as const;

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
    a: "Waffle pops start from ৳159, shakes from ৳159, and add-ons are ৳50 each. The full menu with prices is on the Menu page.",
  },
] as const;
