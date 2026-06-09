"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Quote, Sparkles, Heart, Ghost, Globe, Lock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { TRENDING_EMOTIONS } from "@/lib/mockData";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const searchPlaceholders = [
    "I failed my exams",
    "Heartbreak",
    "Career confusion",
    "Startup failure",
    "Burnout"
  ];

  // Rotate placeholders every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryToSubmit = searchQuery.trim() || searchPlaceholders[placeholderIndex];
    router.push(`/explore?q=${encodeURIComponent(queryToSubmit)}`);
  };

  const handleQuickSearch = (queryText: string) => {
    router.push(`/explore?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-foreground font-sans selection:bg-white/10 selection:text-white antialiased">
      {/* Subtle, soft lighting backdrops - No neon glowing gradients, only quiet luxury reflections */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#0b0f19]/25 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-indigo-900/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HERO SPLIT-SCREEN LAYOUT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center pt-8 md:pt-16 pb-24">
        
        {/* LEFT COLUMN: Editorial copy and integrated search (5 cols or 6 cols) */}
        <div className="lg:col-span-6 space-y-10 pr-0 lg:pr-8 text-left">
          
          {/* Tagline / Indicator */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/45 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
            <span>The Library of Human Experience</span>
          </div>

          {/* Main Headline - Set in Georgia / Serif font */}
          <h1 className="text-4xl md:text-6xl font-normal leading-[1.15] text-white tracking-tight font-serif">
            What are you <br className="hidden md:inline" />
            going through today?
          </h1>

          {/* Supporting Description */}
          <p className="text-sm md:text-base text-foreground/60 max-w-lg leading-relaxed font-normal">
            Explore experiences from people who have faced similar moments in life. A quiet, anonymous sanctuary built to preserve and search human lessons, mistakes, failures, and growth.
          </p>

          {/* Integrated Premium Search Experience */}
          <form onSubmit={handleSearchSubmit} className="max-w-md relative group">
            <div className="relative border border-white/10 rounded-2xl flex items-center p-1.5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300">
              <Search className="w-4 h-4 text-foreground/40 ml-4 shrink-0" />
              
              <div className="relative w-full h-10 flex items-center">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-2 px-3 outline-none text-foreground text-sm font-medium z-10"
                />
                
                {/* Rotating search placeholder when input is empty */}
                {!searchQuery && (
                  <div className="absolute left-3 pointer-events-none text-foreground/30 text-sm font-medium overflow-hidden h-5 w-full">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="absolute block"
                      >
                        {searchPlaceholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <Button 
                type="submit"
                variant="primary"
                size="sm"
                className="shrink-0 rounded-xl px-5 text-xs py-2 bg-white text-black hover:bg-white/90"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Social Proof & Primary CTA Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4 border-t border-white/5">
            <Button
              size="md"
              variant="secondary"
              className="rounded-xl bg-white/[0.03] border-white/10 hover:bg-white/[0.08]"
              onClick={() => router.push("/explore")}
            >
              Explore the Registry
            </Button>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">12,000+ Chapters</div>
              <div className="text-[10px] text-foreground/40 mt-0.5 uppercase tracking-wider font-semibold">Of shared wisdom preserved</div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Layered Editorial Collage of Real Excerpts (6 cols) */}
        <div className="lg:col-span-6 relative h-[420px] md:h-[480px] w-full flex items-center justify-center pointer-events-none mt-10 lg:mt-0 select-none">
          
          {/* Card 1: Experience Excerpt (Center) */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute z-20 w-[290px] md:w-[340px] p-6 rounded-2xl bg-[#0e0f14] border border-white/10 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between text-[10px] text-foreground/45 font-semibold">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-emerald-500/80" /> Public Entry</span>
              <span>Apr 2026</span>
            </div>
            <Quote className="w-6 h-6 text-indigo-500/20" />
            <h4 className="text-sm font-bold text-white font-serif leading-snug">
              My startup failed after 2 years of building
            </h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              "...We spent too much time perfecting code and not enough talking to users. The day we shut down, I sat in my car and cried. But looking back, I learned more about sales and resilience in those 2 years than..."
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[10px] text-foreground/45 font-medium">Marc Andreessen Clone</span>
              <span className="text-[10px] font-bold text-indigo-400">#startup</span>
            </div>
          </motion.div>

          {/* Card 2: Emotional Category Snippet (Top-Left) */}
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: 6 }}
            animate={{ opacity: 1, x: 0, rotate: 5 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute z-10 left-4 md:left-12 top-4 w-[200px] md:w-[220px] p-5 rounded-2xl bg-[#0e0f14]/80 border border-white/5 shadow-xl space-y-2.5 backdrop-blur-sm"
            style={{ y: -20 }}
          >
            <div className="text-[9px] uppercase font-bold tracking-widest text-rose-400/80 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 w-fit">
              #heartbreak
            </div>
            <p className="text-xs text-foreground/75 leading-relaxed font-serif">
              "Grieving a relationship that just drifted away. Deciding to separate was harder than a fight, because there was no villain."
            </p>
            <p className="text-[9px] text-foreground/40 italic">— Anonymous Story</p>
          </motion.div>

          {/* Card 3: Wisdom Snippet (Bottom-Right) */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: -8 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute z-10 right-4 md:right-8 bottom-6 w-[210px] md:w-[230px] p-5 rounded-2xl bg-[#0e0f14]/80 border border-white/5 shadow-xl space-y-3 backdrop-blur-sm"
          >
            <div className="text-[9px] uppercase font-bold tracking-widest text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 w-fit">
              #lessons
            </div>
            <h5 className="text-xs font-bold text-white">Temporary Setbacks</h5>
            <p className="text-[11px] text-foreground/60 leading-relaxed">
              "Failing an exam is a localized metric of study strategy, not a global metric of intellectual capacity."
            </p>
            <div className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" /> Wisdom Match
            </div>
          </motion.div>

        </div>

      </section>

      {/* BOTTOM SECTION: HORIZONTAL SCROLLING FEED */}
      <section className="space-y-8 border-t border-white/5 pt-16 pb-24">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight font-serif text-white">
              Explore the archives
            </h2>
            <p className="text-xs text-foreground/45 font-medium">
              Browse by emotional category or discover trending previews from our digital preservation files.
            </p>
          </div>
          
          <Link 
            href="/explore" 
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 self-start md:self-end cursor-pointer"
          >
            Open Full Library <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll wrapper */}
        <div className="relative w-full">
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#08080a] to-transparent pointer-events-none z-10 hidden md:block" />
          
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 md:-mx-0 md:px-0">
            
            {/* Category 1: Lost */}
            <div 
              onClick={() => handleQuickSearch("lost")}
              className="snap-start shrink-0 w-[240px] p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44"
            >
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 w-fit block">#lost</span>
                <h4 className="text-base font-bold text-white font-serif mt-4 leading-snug">Career Confusion</h4>
                <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">
                  Find stories of career pivots, FAANG departures, and finding purpose.
                </p>
              </div>
              <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">42 Chapters preserved</span>
            </div>

            {/* Category 2: Failure */}
            <div 
              onClick={() => handleQuickSearch("failure")}
              className="snap-start shrink-0 w-[240px] p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44"
            >
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10 w-fit block">#failure</span>
                <h4 className="text-base font-bold text-white font-serif mt-4 leading-snug">Startup Lessons</h4>
                <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">
                  Read post-mortems of failed projects and lessons learned the hard way.
                </p>
              </div>
              <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">31 Chapters preserved</span>
            </div>

            {/* Category 3: Heartbreak */}
            <div 
              onClick={() => handleQuickSearch("heartbreak")}
              className="snap-start shrink-0 w-[240px] p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44"
            >
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 w-fit block">#heartbreak</span>
                <h4 className="text-base font-bold text-white font-serif mt-4 leading-snug">Heartbreak Recovery</h4>
                <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">
                  Stories of separation, loss, drifting relationships, and self healing.
                </p>
              </div>
              <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">28 Chapters preserved</span>
            </div>

            {/* Category 4: Burnout */}
            <div 
              onClick={() => handleQuickSearch("burnout")}
              className="snap-start shrink-0 w-[240px] p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44"
            >
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 w-fit block">#burnout</span>
                <h4 className="text-base font-bold text-white font-serif mt-4 leading-snug">Burnout Recovery</h4>
                <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">
                  Reclaiming boundaries, escaping toxic corporate workloads, and mental recovery.
                </p>
              </div>
              <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">25 Chapters preserved</span>
            </div>

            {/* Story Preview Card 1 */}
            <Link 
              href="/experiences/exp-3"
              className="snap-start shrink-0 w-[300px] p-6 rounded-2xl bg-[#0e0f14] border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-44"
            >
              <div>
                <div className="flex items-center justify-between text-[9px] text-foreground/40 font-semibold">
                  <span>Sarah Chen</span>
                  <span>Mar 2026</span>
                </div>
                <h4 className="text-sm font-bold text-white font-serif mt-3 leading-snug line-clamp-2">
                  Left a high-paying FAANG job because I hated coding
                </h4>
                <p className="text-xs text-foreground/50 mt-1.5 leading-relaxed line-clamp-2">
                  "On paper, I had it all. $250k salary, great perks, working on a famous team. But every single morning, I woke up with dread..."
                </p>
              </div>
              <div className="text-[9px] font-bold text-indigo-400">#burnout #career</div>
            </Link>

            {/* Story Preview Card 2 */}
            <Link 
              href="/experiences/exp-2"
              className="snap-start shrink-0 w-[300px] p-6 rounded-2xl bg-[#0e0f14] border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-44"
            >
              <div>
                <div className="flex items-center justify-between text-[9px] text-foreground/40 font-semibold">
                  <span>A. Student</span>
                  <span>May 2026</span>
                </div>
                <h4 className="text-sm font-bold text-white font-serif mt-3 leading-snug line-clamp-2">
                  I failed my university exams and thought my life was over
                </h4>
                <p className="text-xs text-foreground/50 mt-1.5 leading-relaxed line-clamp-2">
                  "I failed my second-year algorithms and systems exams. I was placed on academic probation. I saw my friends moving forward..."
                </p>
              </div>
              <div className="text-[9px] font-bold text-purple-400">#failure #academic</div>
            </Link>

          </div>
        </div>
      </section>

      {/* WHY PRESERVE - Storytelling Trust Banner */}
      <section className="max-w-4xl mx-auto text-center py-16 border-t border-white/5">
        <div className="space-y-6 max-w-2xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">A Preservation Sanctuary</h3>
          <h2 className="text-2xl md:text-3xl font-normal tracking-tight font-serif text-white leading-snug">
            We are losing the hard-won lessons of everyday lives to highlight reels.
          </h2>
          <p className="text-xs md:text-sm text-foreground/50 leading-relaxed font-normal">
            Veilory is designed to capture the wisdom found during struggles, errors, and pivots. By preserving your experiences, you allow others in similar distress to discover a guiding light.
          </p>
          <div className="pt-4">
            <Link
              href="/auth/signup"
              className="text-xs font-bold px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 transition-colors inline-block cursor-pointer"
            >
              Create Your Sanctuary Journal
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
