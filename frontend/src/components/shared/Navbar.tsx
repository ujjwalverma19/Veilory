"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Heart, Search, Edit3, User, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-4 md:px-8 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Veilory
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/explore"
            className={cn(
              "text-sm font-semibold transition-colors flex items-center gap-2",
              pathname === "/explore" ? "text-indigo-400" : "text-foreground/75 hover:text-foreground"
            )}
          >
            <Search className="w-4 h-4" />
            Explore Wisdom
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-semibold transition-colors flex items-center gap-2",
                  pathname === "/dashboard" ? "text-indigo-400" : "text-foreground/75 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/create"
                className={cn(
                  "text-sm font-semibold transition-colors flex items-center gap-2",
                  pathname === "/create" ? "text-indigo-400" : "text-foreground/75 hover:text-foreground"
                )}
              >
                <Edit3 className="w-4 h-4" />
                Share Story
              </Link>
            </>
          )}
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5">
              {/* User Avatar linking to Dashboard */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold text-foreground/80 hidden sm:inline">
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-full text-foreground/50 hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(
                  "text-sm font-semibold transition-colors cursor-pointer",
                  pathname === "/auth/login" ? "text-indigo-400" : "text-foreground/75 hover:text-foreground"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className={cn(
                  "text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer",
                  "bg-foreground text-background hover:bg-foreground/90 transition-all",
                  "shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
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
