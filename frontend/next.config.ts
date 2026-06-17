import type { NextConfig } from "next";

/**
 * Production Next.js configuration for Veilory.
 * - Standalone output enables easy Docker deployment.
 * - React strict mode and SWC minification improve performance.
 * - Image domains whitelist is empty because we rely on Vercel Image Optimization.
 * - Security headers ensure CSP, Referrer‑Policy, etc.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Vercel will handle remote image optimization; no external domains needed now.
    remotePatterns: [],
  },
  // Global HTTP security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'none';" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;

