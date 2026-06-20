import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are missing (e.g. in Vercel), load dynamically from the backend at runtime
  if (!url || !key) {
    if (typeof window !== "undefined") {
      try {
        console.log("Supabase variables missing in bundle, fetching from backend config API...");
        let apiBase = process.env.NEXT_PUBLIC_API_URL || "";
        
        // Fallback calculation for host
        if (!apiBase) {
          const host = window.location.hostname;
          if (host === "localhost" || host === "127.0.0.1") {
            apiBase = "http://localhost:8000/api/v1";
          } else {
            apiBase = "https://api.veilory.online/api/v1";
          }
        }
        
        if (apiBase.endsWith("/")) {
          apiBase = apiBase.slice(0, -1);
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${apiBase}/auth/config`, false); // Synchronous request
        xhr.send(null);

        if (xhr.status === 200) {
          const config = JSON.parse(xhr.responseText);
          url = config.supabase_url || undefined;
          key = config.supabase_anon_key || undefined;
        } else {
          console.error("Supabase config API request failed with status:", xhr.status);
        }
      } catch (err) {
        console.error("Failed to dynamically fetch Supabase config:", err);
      }
    }
  }

  // Debug statement requested by the user
  console.log("SUPABASE_URL:", url);
  console.log("SUPABASE_KEY exists:", !!key);

  if (!url || !key) {
    throw new Error(
      `Supabase configuration missing. ` +
      `NEXT_PUBLIC_SUPABASE_URL=${url}, ` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY exists=${!!key}. ` +
      `Ensure environment variables are configured correctly.`
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Export a proxy that dynamically initializes the client on first access
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
