import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    // Nieuwe service worker activeert meteen na een deployment
    // zodat gecachte bestanden altijd up-to-date zijn
    skipWaiting: true,
    clientsClaim: true,
    // Verwijder oude cache automatisch bij nieuwe deployment
    cleanupOutdatedCaches: true,
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
