import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized Supabase client.
// Next.js inlines NEXT_PUBLIC_* values at BUILD TIME via static replacement.
// During SSG prerendering on the server, these may be undefined.
// The real client is only created on first access in the browser.

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("SUPABASE INIT", { url, keyExists: !!key });

  if (!url || !key) {
    throw new Error(
      `Supabase configuration missing at runtime. ` +
      `NEXT_PUBLIC_SUPABASE_URL=${url}, ` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY exists=${!!key}. ` +
      `These must be set in Vercel environment variables AND available at build time.`
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Export a proxy that lazily initializes on first property access.
// This allows the module to be imported during SSG without crashing,
// while failing fast with a clear error on actual usage in the browser.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
