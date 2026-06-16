import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-24 border-t border-[#1a1a1a]/5 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-[#1a1a1a]/30 font-medium">
        <div className="flex items-center gap-2">
          <Heart className="w-3 h-3 text-rose-300" />
          <span>&copy; {new Date().getFullYear()} Veilory. Preserving the emotional library of humanity.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/explore" className="hover:text-[#1a1a1a]/55 transition-colors">Explore</Link>
          <Link href="/create" className="hover:text-[#1a1a1a]/55 transition-colors">Preserve</Link>
          <a href="#" className="hover:text-[#1a1a1a]/55 transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#1a1a1a]/55 transition-colors">About</a>
        </div>
      </div>
    </footer>
  );
}
