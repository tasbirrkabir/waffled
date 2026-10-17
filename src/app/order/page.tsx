import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { OrderPageContent } from "@/components/order/order-page-content";
import { getMenu } from "@/lib/menu-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Online, Pickup in Sreemangal",
  description:
    "Order waffle pops and shakes online from Waffled Sreemangal. Build your order, add your details, and send it to the shop on WhatsApp or by phone. Pay at pickup.",
  alternates: { canonical: "/order" },
};

export default async function OrderPage() {
  const menu = await getMenu();

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />
      <main id="main" className="flex-1">
        <OrderPageContent categories={menu} />
      </main>
      <SiteFooter />
      <MobileActionBar />
    </div>
  );
}
