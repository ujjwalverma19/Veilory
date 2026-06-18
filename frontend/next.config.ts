import type { NextConfig } from "next";

/**
 * Production Next.js configuration for Veilory.
 * - Standalone output enables easy Docker deployment.
 * - React strict mode improves performance.
 * - Image domains whitelist is empty because we rely on Vercel Image Optimization.
 * - Security headers ensure CSP, Referrer‑Policy, etc.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

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
          { key: "Content-Security-Policy", value: "default-src 'self'; connect-src 'self' https://api.veilory.online https://res.cloudinary.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; media-src 'self' https://res.cloudinary.com;" },
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

