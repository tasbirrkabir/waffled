import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waffled Sreemangal | Waffles, Shakes & Snacks in Sreemangal",
  description:
    "Waffle pops on a stick, thick shakes and snacks in Sreemangal. Check the menu, opening hours and directions to our shop on Radhanagar Road, Sreemangal, Bangladesh.",
  keywords: [
    "Waffled Sreemangal",
    "waffles Sreemangal",
    "waffle shop Sreemangal",
    "dessert Sreemangal",
    "shakes Sreemangal",
    "Radhanagar Sreemangal",
  ],
  icons: {
    icon: [
      { url: "/images/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "Waffled Sreemangal, Waffle Pops & Shakes",
    description:
      "Waffle pops on a stick, thick shakes and little moments worth sharing. Find us on Radhanagar Road, Sreemangal.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Waffled Sreemangal waffle pops" }],
    type: "website",
    locale: "en_US",
    siteName: "Waffled Sreemangal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waffled Sreemangal, Waffle Pops & Shakes",
    description:
      "Waffle pops on a stick, thick shakes and little moments worth sharing. Find us on Radhanagar Road, Sreemangal.",
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
