"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        console.log("[REDIRECT_DASHBOARD] Redirecting to /dashboard from callback page");
        router.push("/dashboard");
      } else {
        console.log("[REDIRECT_LOGIN] Redirecting to /auth/login from callback page");
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
