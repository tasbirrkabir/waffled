import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { SignatureSection } from "@/components/signature-section";
import { MenuSection } from "@/components/menu-section";
import { AboutSection } from "@/components/about-section";
import { GallerySection } from "@/components/gallery-section";
import { ReviewsSection } from "@/components/reviews-section";
import { VisitSection } from "@/components/visit-section";
import { FaqSection } from "@/components/faq-section";
import { SiteFooter } from "@/components/site-footer";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { FloatingCartPill } from "@/components/order/floating-cart-pill";
import { siteConfig } from "@/content/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: siteConfig.legalName,
  telephone: siteConfig.phoneE164,
  email: siteConfig.email,
  servesCuisine: ["Desserts", "Waffles", "Snacks"],
  priceRange: "৳49 - ৳219",
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.countryCode,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.coordinates.lat,
    longitude: siteConfig.coordinates.lng,
  },
  // Rating verified directly from the shop's Google Maps listing
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: siteConfig.rating.value,
    reviewCount: siteConfig.rating.count,
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [siteConfig.socials.facebook, siteConfig.socials.instagram],
  hasMap: siteConfig.mapsUrl,
  openingHoursSpecification: siteConfig.hours.days.map((d) => {
    const [oh, om] = d.open.split(":");
    const [ch, cm] = d.close.split(":");
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: d.day,
      opens: `${oh}:${om}`,
      closes: `${ch}:${cm}`,
    };
  }),
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <HeroSection />
        <SignatureSection />
        <MenuSection />
        <AboutSection />
        <GallerySection />
        <ReviewsSection />
        <VisitSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <MobileActionBar />
      {/* Checkout popup: appears at the bottom as soon as someone adds an
          item from the home page menu */}
      <FloatingCartPill />
    </div>
  );
}
