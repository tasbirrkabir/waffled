export const siteConfig = {
  name: "Waffled",
  legalName: "Waffled Sreemangal",
  tagline: "Waffles, shakes & little moments worth sharing",
  taglineBn: "মিষ্টি কিছু খাওয়ার সময় হয়েছে",
  description:
    "Waffle pops, shakes and snacks in Sreemangal. Check the menu, opening hours and directions to our shop in Radhanagar, Sreemangal, Bangladesh.",
  phoneDisplay: "+880 1723-399638",
  phoneE164: "+8801723399638",
  email: "waffledshop.bd@gmail.com",
  address: {
    street: "Radhanagar Road",
    locality: "Sreemangal",
    postalCode: "3210",
    region: "Sylhet",
    country: "Bangladesh",
    countryCode: "BD",
    landmark: "Near Grand Sultan Tea Resort & Golf Club, at the entrance of Radhanagar Road",
  },
  mapsUrl:
    "https://www.google.com/maps?q=Waffled+Sreemangal,+Sreemangal+3210&ftid=0x375179000670e393:0xdc3b7b95a6ea6dc4",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Waffled%20Sreemangal%2C%20Sreemangal%203210&t=&z=16&ie=UTF8&iwloc=&output=embed",
  reviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Waffled%20Sreemangal%2C%20Sreemangal%203210",
  socials: {
    facebook: "https://www.facebook.com/waffledshopbd/",
    instagram: "https://www.instagram.com/waffled.bd/",
  },
  hours: {
    note: "Hours may vary on holidays — call ahead to confirm.",
    days: [
      { day: "Sunday", open: "12:00", close: "23:00", label: "12:00 PM – 11:00 PM" },
      { day: "Monday", open: "12:00", close: "23:30", label: "12:00 PM – 11:30 PM" },
      { day: "Tuesday", open: "12:00", close: "23:00", label: "12:00 PM – 11:00 PM" },
      { day: "Wednesday", open: "12:00", close: "23:00", label: "12:00 PM – 11:00 PM" },
      { day: "Thursday", open: "12:00", close: "23:00", label: "12:00 PM – 11:00 PM" },
      { day: "Friday", open: "12:00", close: "23:00", label: "12:00 PM – 11:00 PM" },
      { day: "Saturday", open: "12:00", close: "23:00", label: "12:00 PM – 11:00 PM" },
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
  const closeLabel = today.label.split("–")[1]?.trim() ?? "11:00 PM";
  if (minutes >= openM && minutes < closeM) {
    return { open: true, label: `Open now · till ${closeLabel}` };
  }
  return {
    open: false,
    label: minutes < openM ? "Opens at 12:00 PM today" : "Opens at 12:00 PM tomorrow",
  };
}
