"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Heart, Search, Edit3, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // On the landing page, the navbar should be transparent and blend in
  const isLanding = pathname?.endsWith("/") && pathname?.length === 1;

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 px-6 md:px-10 transition-all duration-500",
        isLanding
          ? "py-5 bg-transparent border-b border-transparent"
          : "py-3.5 glass-panel border-b border-white/10 backdrop-blur-md"
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
              isLanding ? "text-[#1a1a1a]/70" : "text-foreground"
            )}
          >
            Veilory
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/explore"
            className={cn(
              "text-[13px] font-medium transition-colors flex items-center gap-1.5",
              isLanding
                ? pathname === "/explore"
                  ? "text-[#1a1a1a]/80"
                  : "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
                : pathname === "/explore"
                  ? "text-indigo-400"
                  : "text-foreground/60 hover:text-foreground"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            Explore
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-[13px] font-medium transition-colors flex items-center gap-1.5",
                  isLanding
                    ? "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
                    : pathname === "/dashboard"
                      ? "text-indigo-400"
                      : "text-foreground/60 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                href="/create"
                className={cn(
                  "text-[13px] font-medium transition-colors flex items-center gap-1.5",
                  isLanding
                    ? "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
                    : pathname === "/create"
                      ? "text-indigo-400"
                      : "text-foreground/60 hover:text-foreground"
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Preserve
              </Link>
            </>
          )}
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all cursor-pointer",
                  isLanding
                    ? "bg-[#1a1a1a]/5 border border-[#1a1a1a]/8 hover:bg-[#1a1a1a]/10"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                    isLanding
                      ? "bg-[#1a1a1a]/60"
                      : "bg-gradient-to-tr from-indigo-500 to-purple-500"
                  )}
                >
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline",
                    isLanding ? "text-[#1a1a1a]/60" : "text-foreground/80"
                  )}
                >
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className={cn(
                  "p-2 rounded-full transition-colors cursor-pointer",
                  isLanding
                    ? "text-[#1a1a1a]/30 hover:text-rose-500"
                    : "text-foreground/50 hover:text-rose-400 hover:bg-rose-500/5"
                )}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(
                  "text-[13px] font-medium transition-colors cursor-pointer hidden sm:block",
                  isLanding
                    ? "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className={cn(
                  "text-[13px] font-medium px-4 py-2 rounded-full cursor-pointer transition-all",
                  isLanding
                    ? "bg-[#1a1a1a]/80 text-white hover:bg-[#1a1a1a]"
                    : "bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                )}
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
