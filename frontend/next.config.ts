import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Build-time diagnostic log
const vercelEnv: Record<string, string> = {};
Object.keys(process.env).forEach(key => {
  if (key.startsWith("NEXT_PUBLIC_VERCEL_") || key === "NEXT_PUBLIC_API_URL") {
    vercelEnv[key] = process.env[key] || "";
  }
});

// Identify custom user-defined env keys by filtering out boilerplate system keys
const systemPrefixes = ["npm_", "NODE_", "AWS_", "YARN_", "PNPM_", "COREPACK_", "VSCODE_", "BASH_", "NEXT_PUBLIC_VERCEL_", "VERCEL_"];
const systemKeys = ["PATH", "PWD", "HOME", "USER", "SHELL", "SHLVL", "LANG", "LC_ALL", "MAIL", "LOGNAME", "HOSTNAME", "TERM", "PAGER", "EDITOR", "INIT_CWD", "CI", "LESS", "LS_COLORS", "MANPATH", "INFOPATH", "PKG_CONFIG_PATH", "LD_LIBRARY_PATH"];
const customEnvKeys = Object.keys(process.env).filter(key => {
  if (systemKeys.includes(key)) return false;
  if (systemPrefixes.some(prefix => key.startsWith(prefix))) return false;
  return true;
});

const checkEnv = {
  buildTime: new Date().toISOString(),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
  NEXT_PUBLIC_SUPABASE_ANON_KEY_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.startsWith("NEXT_PUBLIC_")),
  SUPABASE_KEYS_FOUND: Object.keys(process.env).filter(k => k.toLowerCase().includes("supabase")),
  CUSTOM_ENV_KEYS: customEnvKeys,
  ALL_ENV_KEYS_COUNT: Object.keys(process.env).length,
  VERCEL_ENV: vercelEnv,
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

