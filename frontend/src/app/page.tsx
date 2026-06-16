"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "I failed my exams",
    "My startup failed",
    "I feel lost",
    "My heart is broken",
    "I need a fresh start",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim() || placeholders[placeholderIndex];
    router.push(`/explore?q=${encodeURIComponent(q)}`);
  };

  const handleQuickSearch = (query: string) => {
    router.push(`/explore?q=${encodeURIComponent(query)}`);
  };



  const feelings = [
    { label: "I feel lost", emoji: "\u{1F30A}", query: "lost" },
    { label: "I failed at something", emoji: "\u{1F331}", query: "failure" },
    { label: "My heart is broken", emoji: "\u{1F54A}\u{FE0F}", query: "heartbreak" },
    { label: "I\u2019m burning out", emoji: "\u{1F305}", query: "burnout" },
    { label: "I need a fresh start", emoji: "\u{1F33F}", query: "growth" },
  ];

  return (
    <>
      {/* Inject keyframe animations */}
      <style jsx global>{`
        @keyframes gentle-breathe {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 0.8; }
        }
      `}</style>

      <div className="relative w-screen min-h-screen flex flex-col justify-between overflow-x-hidden text-[#1a1a1a] selection:bg-amber-100/60"
           style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", marginTop: "-7rem", marginBottom: "-2.5rem" }}>

        {/* ═══════════════════════════════════════════════════════
            FULL VIEWPORT BACKGROUND VIDEO
        ═══════════════════════════════════════════════════════ */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          >
            <source src="/videos/videoplayback.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Soft white readability overlay above the video (further reduced opacity & blur) */}
        <div className="fixed inset-0 w-screen h-screen bg-white/30 backdrop-blur-[0.5px] -z-10 pointer-events-none" />


        {/* ═══════════════════════════════════════════════════════
            HERO — vertically centered, immersive, floating in space
        ═══════════════════════════════════════════════════════ */}
        <section className="relative flex-grow flex items-center justify-center px-6 md:px-12 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-10 -mt-12">

            {/* Gentle entrance marker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-[#1a1a1a]/45"
              style={{ animation: "gentle-breathe 6s ease-in-out infinite" }}
            >
              <Heart className="w-3 h-3 text-rose-300/80" />
              <span>A sanctuary for human experiences</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.2rem] font-light leading-[1.12] tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Someone has been{" "}
              <br className="hidden sm:inline" />
              where you are.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="text-[15px] md:text-base text-[#1a1a1a]/65 max-w-xl mx-auto leading-[1.8] font-light"
            >
              Millions of people have faced failure, heartbreak, uncertainty, and change.
              Their stories might help you find your next step.
            </motion.p>

            {/* Search */}
            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
              onSubmit={handleSearch}
              className="max-w-md mx-auto"
            >
              <div className="relative border border-[#1a1a1a]/12 rounded-2xl bg-white/55 backdrop-blur-sm hover:bg-white/70 focus-within:bg-white/80 focus-within:border-[#1a1a1a]/20 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-12 pr-24 py-4 outline-none text-[15px] text-[#1a1a1a] font-normal placeholder:text-transparent"
                    placeholder="Search..."
                  />

                  {!searchQuery && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-12 pointer-events-none overflow-hidden h-5">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={placeholderIndex}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="absolute text-[15px] text-[#1a1a1a]/40 font-normal whitespace-nowrap"
                        >
                          {placeholders[placeholderIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[#1a1a1a]/85 text-white text-xs font-medium hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>
            </motion.form>

            {/* Feeling pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.5 }}
              className="flex flex-wrap justify-center gap-2.5 pt-2"
            >
              {feelings.map((feeling) => (
                <button
                  key={feeling.query}
                  onClick={() => handleQuickSearch(feeling.query)}
                  className="px-4 py-2 rounded-full border border-[#1a1a1a]/10 bg-white/45 backdrop-blur-sm text-[13px] text-[#1a1a1a]/65 font-normal hover:bg-white/70 hover:border-[#1a1a1a]/18 hover:text-[#1a1a1a]/85 transition-all duration-400 cursor-pointer"
                >
                  <span className="mr-1.5 opacity-80">{feeling.emoji}</span>
                  {feeling.label}
                </button>
              ))}
            </motion.div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER — minimal, blends into the atmosphere
        ═══════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#1a1a1a]/5 py-8 px-6 md:px-12">
          <div className="max-w-3xl mx-auto flex items-center justify-center text-[11px] text-[#1a1a1a]/35 font-medium">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-rose-300/60" />
              <span>Veilory &middot; {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
