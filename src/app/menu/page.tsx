import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { MenuPageContent } from "@/components/order/menu-page-content";
import { siteConfig } from "@/content/site";
import { menu } from "@/content/menu";

export const metadata: Metadata = {
  title: "Menu, Waffle Pops, Shakes & Prices",
  description: `The full Waffled Sreemangal menu with prices: Basic Flavours Waffle from ৳159, Nutella waffles, thick shakes and add-ons. Synced with our Google Maps listing.`,
  alternates: { canonical: "/menu" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Menu",
  name: `${siteConfig.legalName} Menu`,
  hasMenuSection: menu.map((cat) => ({
    "@type": "MenuSection",
    name: cat.label,
    description: cat.blurb,
    hasMenuItem: cat.items.map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      description: item.description,
      offers: {
        "@type": "Offer",
        price: item.price,
        priceCurrency: "BDT",
      },
    })),
  })),
};

export default function MenuPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <MenuPageContent />
      </main>
      <SiteFooter />
      <MobileActionBar />
    </div>
  );
}
