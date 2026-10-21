import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo Waffles | Waffles, Shakes & Treats Demo",
  description:
    "Demo waffle pops on a stick, thick shakes and sweet treats showcase. Explore demo menu, online ordering and shop features at 123 Demo Street.",
  keywords: [
    "Demo Waffles",
    "demo waffles",
    "demo waffle shop",
    "demo cafe",
    "demo dessert",
    "demo shakes",
  ],
  icons: {
    icon: [
      { url: "/images/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "Demo Waffles, Waffle Pops & Shakes Demo",
    description:
      "Demo waffle pops on a stick, thick shakes and sweet treats showcase.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Demo Waffles showcase" }],
    type: "website",
    locale: "en_US",
    siteName: "Demo Waffles",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo Waffles, Waffle Pops & Shakes Demo",
    description:
      "Demo waffle pops on a stick, thick shakes and sweet treats showcase.",
    images: ["/images/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#201719",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="bottom-center" closeButton />
      </body>
    </html>
  );
}
