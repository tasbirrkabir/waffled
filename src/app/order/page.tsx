import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { OrderPageContent } from "@/components/order/order-page-content";
import { getMenu } from "@/lib/menu-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Online | Demo Waffles",
  description:
    "Order demo waffle pops and shakes online. Build your order, choose pickup or delivery, and test the checkout flow.",
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
