"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Heart } from "lucide-react";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation to connect to FastAPI search endpoint
  };

  return (
    <div className="py-12 max-w-5xl mx-auto min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          How are you feeling <span className="gradient-text">today?</span>
        </h1>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          Search by emotion, not keywords. Tell us what you're going through, and we'll find stories from people who have been exactly where you are.
        </p>
      </motion.div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-20 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative glass-panel rounded-3xl flex items-center p-2">
          <Search className="w-6 h-6 text-foreground/40 ml-4" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="I feel lost in my career right now..."
            className="w-full bg-transparent border-none py-4 px-6 text-lg outline-none text-foreground placeholder:text-foreground/40"
          />
          <button 
            type="submit"
            className="bg-foreground text-background px-8 py-3 rounded-2xl font-bold hover:bg-foreground/90 transition-colors shrink-0 shadow-xl"
          >
            Search
          </button>
        </div>
      </form>

      {/* Mock Results Area for Design */}
      <div className="space-y-12">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">AI Insight</h2>
          </div>
          <p className="text-foreground/80 leading-relaxed text-lg">
            Many people who felt this way also experienced <span className="font-semibold text-indigo-400">imposter syndrome</span> and <span className="font-semibold text-indigo-400">fear of failure</span>. You are not alone in this journey. Others have found clarity by taking small steps rather than massive leaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Result Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel p-8 rounded-3xl"
          >
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10">career</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10">lost</span>
            </div>
            <p className="text-foreground/80 leading-relaxed mb-6">
              When my startup failed, I felt like my identity was stripped away. I realized that my worth wasn't tied to my company's success, but to my resilience.
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground/40">
              <Heart className="w-4 h-4" /> Shared 2 months ago
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
