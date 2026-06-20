"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    console.log(`[CALLBACK_PAGE_STATE] Pathname: ${pathname}, isLoading: ${isLoading}, user exists: ${!!user}, User ID: ${user?.id || "none"}`);
    if (!isLoading) {
      if (user) {
        console.log(`[REDIRECT_DECISION] Pathname: ${pathname} -> Redirecting to /dashboard (user exists)`);
        router.push("/dashboard");
      } else {
        console.log(`[REDIRECT_DECISION] Pathname: ${pathname} -> Redirecting to /auth/login (user is null)`);
        router.push("/auth/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1a1a1a] mx-auto"></div>
        <p className="text-sm font-light text-[#1a1a1a]/60">Authenticating with Google...</p>
      </div>
    </div>
  );
}
