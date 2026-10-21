export const siteConfig = {
  name: "Demo Waffles",
  legalName: "Demo Waffles",
  tagline: "Demo waffles, shakes & sweet moments worth sharing",
  description:
    "Demo waffle pops, shakes and treats showcase. Explore the menu, opening hours and directions to our demo shop at 123 Demo Street.",
  phoneDisplay: "+1 (555) 000-DEMO",
  phoneE164: "+15550003366",
  whatsappUrl: "https://wa.me/15550003366",
  email: "demo@example.com",
  /**
   * Demo numbers shown at checkout for payments.
   */
  payments: {
    bkashNumber: "01700-000000 (Demo)",
    nagadNumber: "01700-000000 (Demo)",
  },
  address: {
    street: "123 Demo Street",
    locality: "Demo District",
    postalCode: "1000",
    region: "Demo City",
    country: "Demo Land",
    countryCode: "DM",
    landmark: "Near Demo Central Park, entrance of Demo Plaza",
  },
  /** Demo rating score */
  rating: {
    value: "5.0",
    count: 120,
    source: "Demo Reviews",
  },
  plusCode: "DEMO+123 Demo City",
  coordinates: {
    lat: 40.7128,
    lng: -74.006,
  },
  mapsUrl:
    "https://maps.google.com/?q=Demo+Waffles",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Demo%20Store&t=&z=15&ie=UTF8&iwloc=&output=embed",
  reviewsUrl:
    "https://maps.google.com/?q=Demo+Waffles+Reviews",
  socials: {
    facebook: "https://www.facebook.com/demo",
    instagram: "https://www.instagram.com/demo",
  },
  hours: {
    note: "Demo store hours for demonstration purposes.",
    days: [
      { day: "Sunday", open: "12:00", close: "23:00", label: "12:00 PM to 11:00 PM" },
      { day: "Monday", open: "12:00", close: "23:30", label: "12:00 PM to 11:30 PM" },
      { day: "Tuesday", open: "12:00", close: "23:00", label: "12:00 PM to 11:00 PM" },
      { day: "Wednesday", open: "12:00", close: "23:00", label: "12:00 PM to 11:00 PM" },
      { day: "Thursday", open: "12:00", close: "23:00", label: "12:00 PM to 11:00 PM" },
      { day: "Friday", open: "12:00", close: "23:00", label: "12:00 PM to 11:00 PM" },
      { day: "Saturday", open: "12:00", close: "23:00", label: "12:00 PM to 11:00 PM" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Day index used by JS Date.getDay(): 0 = Sunday */
export function getTodayHours() {
  const idx = new Date().getDay();
  return siteConfig.hours.days[idx];
}

export function isOpenNow(): { open: boolean; label: string } {
  const today = getTodayHours();
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const openM = oh * 60 + om;
  const closeM = ch * 60 + cm;
  const closeLabel = today.label.split("to")[1]?.trim() ?? "11:00 PM";
  if (minutes >= openM && minutes < closeM) {
    return { open: true, label: `Open now, till ${closeLabel}` };
  }
  return {
    open: false,
    label: minutes < openM ? "Opens at 12:00 PM today" : "Opens at 12:00 PM tomorrow",
  };
}
