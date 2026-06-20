import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Build-time diagnostic log
const checkEnv = {
  buildTime: new Date().toISOString(),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
  NEXT_PUBLIC_SUPABASE_ANON_KEY_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.startsWith("NEXT_PUBLIC_")),
};

console.log("BUILD TIME CHECK:", checkEnv);

try {
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(publicDir, "env-check.json"),
    JSON.stringify(checkEnv, null, 2)
  );
} catch (err: any) {
  console.error("Failed to write build diagnostics:", err.message);
}

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
          { key: "Content-Security-Policy", value: "default-src 'self'; connect-src 'self' https://veilory-api.onrender.com https://res.cloudinary.com https://*.supabase.co wss://*.supabase.co https://accounts.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; media-src 'self' https://res.cloudinary.com;" },
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

