"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Heart, Search, Edit3, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isLanding = pathname?.endsWith("/") && pathname?.length === 1;

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 px-6 md:px-10 transition-all duration-500",
        isLanding
          ? "py-5 bg-transparent border-b border-transparent"
          : "py-3.5 bg-white/60 backdrop-blur-md border-b border-[#1a1a1a]/5"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isLanding ? "text-rose-400/70" : "text-rose-400"
            )}
          />
          <span
            className={cn(
              "text-base font-medium tracking-tight transition-colors",
              isLanding ? "text-[#1a1a1a]/70" : "text-[#1a1a1a]"
            )}
          >
            Veilory
          </span>
        </Link>

        {/* Navigation Links (Hidden on Landing Page to remove navigation clutter) */}
        {!isLanding && (
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={cn(
                  "text-[13px] font-medium transition-colors flex items-center gap-1.5",
                  pathname === "/dashboard"
                    ? "text-[#1a1a1a]"
                    : "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            )}
            <Link
              href="/create"
              className={cn(
                "text-[13px] font-medium transition-colors flex items-center gap-1.5",
                pathname === "/create"
                  ? "text-[#1a1a1a]"
                  : "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Preserve Stories
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#1a1a1a]/5 border border-[#1a1a1a]/8 hover:bg-[#1a1a1a]/10 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a]/60 flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-medium text-[#1a1a1a]/60 hidden sm:inline">
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-full text-[#1a1a1a]/30 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-[13px] font-medium text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70 transition-colors cursor-pointer hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-[13px] font-medium px-4 py-2 rounded-full bg-[#1a1a1a] text-white hover:bg-[#2d2d2d] transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
