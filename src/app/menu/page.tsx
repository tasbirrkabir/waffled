import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { MenuPageContent } from "@/components/order/menu-page-content";
import { siteConfig } from "@/content/site";
import { getMenu } from "@/lib/menu-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demo Menu | Waffle Pops, Shakes & Prices",
  description: `The full Demo Waffles menu with prices: Classic Waffles from ৳159, Premium Waffles, thick shakes and add-ons.`,
  alternates: { canonical: "/menu" },
};

export default async function MenuPage() {
  const menu = await getMenu();
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

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <MenuPageContent categories={menu} />
      </main>
      <SiteFooter />
      <MobileActionBar />
    </div>
  );
}
