import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!url || !key) {
    throw new Error(
      `Supabase configuration missing at runtime. ` +
      `NEXT_PUBLIC_SUPABASE_URL=${url}, ` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY exists=${!!key}. ` +
      `These must be set in Vercel environment variables.`
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Return a proxy that handles property access safely.
// If the environment variables are set, we delegate everything to the real Supabase client.
// If they are missing, we allow non-crashing methods to be called during page load,
// but throw a clear runtime exception for actual database/auth operations.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (url && key) {
      return getSupabaseClient()[prop as keyof SupabaseClient];
    }

    // Safely handle auth methods called during page load/hydration to prevent page crash
    if (prop === "auth") {
      return {
        getSession: async () => {
          console.warn("Supabase.auth.getSession called but configuration is missing.");
          return { data: { session: null }, error: null };
        },
        onAuthStateChange: (callback: any) => {
          console.warn("Supabase.auth.onAuthStateChange called but configuration is missing.");
          // Trigger initial event but do nothing else
          setTimeout(() => {
            try {
              callback("SIGNED_OUT", null);
            } catch (e) {}
          }, 0);
          return { data: { subscription: { unsubscribe: () => {} } }, error: null };
        },
        signInWithOAuth: async () => {
          throw new Error(
            `Cannot sign in with Google: Supabase configuration is missing in Vercel. ` +
            `NEXT_PUBLIC_SUPABASE_URL is undefined, NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined.`
          );
        },
        signInWithPassword: async () => {
          throw new Error("Supabase configuration is missing in Vercel.");
        },
        signUp: async () => {
          throw new Error("Supabase configuration is missing in Vercel.");
        },
        signOut: async () => {},
      } as any;
    }

    // Throw on any other property access (databases, storage, etc.)
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
