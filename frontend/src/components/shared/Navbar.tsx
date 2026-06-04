import Link from "next/link";
import { cn } from "@/lib/utils";
import { Heart, Search, Edit3, UserCircle2 } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Veilory
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            Explore
          </Link>
          <Link href="/create" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Share Experience
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hidden md:block">
            Sign in
          </Link>
          <Link href="/auth/signup" className={cn(
            "text-sm font-medium px-4 py-2 rounded-full",
            "bg-foreground text-background hover:bg-foreground/90 transition-all",
            "shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          )}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
