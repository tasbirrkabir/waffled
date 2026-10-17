"use client";

/**
 * /admin — Waffled Sreemangal admin panel.
 * Single client page: login screen ⇄ panel (Dashboard / Products / Orders /
 * Content tabs). All API calls use relative "/api/admin/..." URLs.
 */

import * as React from "react";
import { toast } from "sonner";
import { Cookie, LayoutDashboard, Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/components/admin/admin-header";
import { api, clearAdminSession, registerUnauthorizedHandler } from "@/components/admin/api";
import { ContentTab } from "@/components/admin/content-tab";
import { DashboardTab } from "@/components/admin/dashboard-tab";
import { LoginScreen } from "@/components/admin/login-screen";
import { OrdersTab } from "@/components/admin/orders-tab";
import { ProductsTab } from "@/components/admin/products-tab";

type TabKey = "dashboard" | "products" | "orders" | "content";

export default function AdminPage() {
  const [checking, setChecking] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [tab, setTab] = React.useState<TabKey>("dashboard");
  const last401Ref = React.useRef(0);

  // Any admin API call returning 401 flips us back to the login screen.
  React.useEffect(() => {
    registerUnauthorizedHandler(() => {
      const now = Date.now();
      clearAdminSession(); // stored token is stale — drop it
      setAuthed(false);
      if (now - last401Ref.current > 2000) {
        last401Ref.current = now;
        toast.error("Session expired", { description: "Please sign in again." });
      }
    });
    return () => registerUnauthorizedHandler(null);
  }, []);

  // Initial session probe.
  React.useEffect(() => {
    let cancelled = false;
    api<{ authenticated: boolean }>("/api/admin/session")
      .then((d) => {
        if (!cancelled) setAuthed(Boolean(d?.authenticated));
      })
      .catch(() => {
        // network error → show login; the form surfaces further errors
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    clearAdminSession();
    try {
      await api("/api/admin/logout", { method: "POST" });
    } catch {
      // clear locally regardless
    } finally {
      setLoggingOut(false);
      setAuthed(false);
      setTab("dashboard");
      toast.success("Logged out — see you soon!");
    }
  }

  if (checking) {
    return (
      <div
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream"
      >
        <Loader2 className="h-8 w-8 animate-spin text-pink" aria-hidden />
        <p className="text-sm font-semibold text-muted-warm">Checking your session…</p>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLoggedIn={() => setAuthed(true)} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AdminHeader onLogout={handleLogout} loggingOut={loggingOut} />

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="w-full gap-4"
        >
          <div className="nice-scrollbar -mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl border-2 border-ink/10 bg-surface p-1.5 sm:w-fit">
              <TabsTrigger
                value="dashboard"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-warm data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0_0_var(--color-pink)] sm:px-4 sm:text-sm"
              >
                <LayoutDashboard className="hidden h-4 w-4 sm:inline" aria-hidden />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-warm data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0_0_var(--color-pink)] sm:px-4 sm:text-sm"
              >
                <Cookie className="hidden h-4 w-4 sm:inline" aria-hidden />
                Products
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-warm data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0_0_var(--color-pink)] sm:px-4 sm:text-sm"
              >
                <ShoppingBag className="hidden h-4 w-4 sm:inline" aria-hidden />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-warm data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-[2px_2px_0_0_var(--color-pink)] sm:px-4 sm:text-sm"
              >
                <Sparkles className="hidden h-4 w-4 sm:inline" aria-hidden />
                Content
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab onSeeAllOrders={() => setTab("orders")} />
          </TabsContent>
          <TabsContent value="products" className="mt-0">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="orders" className="mt-0">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="content" className="mt-0">
            <ContentTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto border-t-2 border-ink/10 bg-cream pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-3 py-4 text-xs text-muted-warm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Waffled Sreemangal · Admin panel</p>
          <p>Prices in Bangladeshi Taka (৳) · all times Dhaka time</p>
        </div>
      </footer>
    </div>
  );
}
