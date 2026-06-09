import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-24 border-t border-white/5 py-12 px-4 md:px-8 bg-slate-950/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-foreground/40 font-medium">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-indigo-400" />
          <span>© {new Date().getFullYear()} Veilory. Preserving the emotional library of humanity.</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/explore" className="hover:text-foreground transition-colors">Search Engine</Link>
          <span className="opacity-20">•</span>
          <Link href="/create" className="hover:text-foreground transition-colors">Share Experience</Link>
          <span className="opacity-20">•</span>
          <a href="#" className="hover:text-foreground transition-colors">Privacy sanctuary</a>
          <span className="opacity-20">•</span>
          <a href="#" className="hover:text-foreground transition-colors">AI Wisdom Rules</a>
        </div>
      </div>
    </footer>
  );
}
