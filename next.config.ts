import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    /**
     * All image assets are pre-optimized by hand (webp at the exact display
     * sizes: products 800px, gmaps photos 1400px, logo 176px). Serving them
     * through the /_next/image optimizer only added a CPU-bound transform
     * queue that stalled bulk loading on phones, so we serve them directly.
     */
    unoptimized: true,
  },
};

export default nextConfig;
