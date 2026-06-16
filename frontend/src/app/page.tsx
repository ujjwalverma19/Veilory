"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Heart } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "I feel lost in my career",
    "I failed my exams",
    "I'm going through a breakup",
    "My startup didn't work out",
    "I feel burned out",
    "I lost someone close to me",
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

  const stories = [
    {
      excerpt: "When my startup shut down after two years, I sat in my car and cried for an hour. But those two years taught me more about resilience than a decade of comfortable employment ever could.",
      tag: "startup failure",
      author: "Someone who rebuilt",
    },
    {
      excerpt: "We didn't have a dramatic breakup. We just slowly drifted into strangers. The quiet letting go was the hardest part \u2014 because there was no villain, just two people growing apart.",
      tag: "heartbreak",
      author: "Anonymous",
    },
    {
      excerpt: "I failed my second-year exams and thought my life was over. My friends moved forward while I stood still. But that pause taught me how to study with my ADHD, not against it.",
      tag: "academic failure",
      author: "A student who returned",
    },
    {
      excerpt: "I had a $250k salary and woke up every morning with dread. Quitting felt irresponsible. But my sleep, my creativity, my sense of self \u2014 they all came back the moment I walked away.",
      tag: "career change",
      author: "Someone who chose differently",
    },
  ];

  const feelings = [
    { label: "I feel lost", emoji: "\u{1F30A}", query: "lost" },
    { label: "I failed at something", emoji: "\u{1F331}", query: "failure" },
    { label: "My heart is broken", emoji: "\u{1F54A}\u{FE0F}", query: "heartbreak" },
    { label: "I\u2019m burning out", emoji: "\u{1F305}", query: "burnout" },
    { label: "I need a fresh start", emoji: "\u{1F33F}", query: "growth" },
  ];

  return (
    <>
      {/* Inject keyframe animations for the cloud drifting effect */}
      <style jsx global>{`
        @keyframes cloud-drift-1 {
          0%   { transform: translate(0, 0)    scale(1);    opacity: 0.45; }
          25%  { transform: translate(40px, -20px) scale(1.05); opacity: 0.5;  }
          50%  { transform: translate(20px, 10px) scale(1.02);  opacity: 0.4;  }
          75%  { transform: translate(-20px, -10px) scale(1.07); opacity: 0.48; }
          100% { transform: translate(0, 0)    scale(1);    opacity: 0.45; }
        }
        @keyframes cloud-drift-2 {
          0%   { transform: translate(0, 0)    scale(1);    opacity: 0.35; }
          33%  { transform: translate(-50px, 20px) scale(1.08); opacity: 0.4;  }
          66%  { transform: translate(30px, -15px) scale(1.03); opacity: 0.32; }
          100% { transform: translate(0, 0)    scale(1);    opacity: 0.35; }
        }
        @keyframes cloud-drift-3 {
          0%   { transform: translate(0, 0)    scale(1);    opacity: 0.25; }
          50%  { transform: translate(60px, 30px) scale(1.1);  opacity: 0.3;  }
          100% { transform: translate(0, 0)    scale(1);    opacity: 0.25; }
        }
        @keyframes gentle-breathe {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 0.8; }
        }
      `}</style>

      <div className="relative w-screen min-h-screen overflow-x-hidden text-[#1a1a1a] selection:bg-amber-100/60"
           style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", marginTop: "-7rem", marginBottom: "-2.5rem" }}>

        {/* ═══════════════════════════════════════════════════════
            FULL VIEWPORT ANIMATED CLOUD BACKGROUND
            Multiple layered gradient orbs with slow drift animation
        ═══════════════════════════════════════════════════════ */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-20">
          {/* Base warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0ea] via-[#faf7f2] to-[#f0ebe4]" />

          {/* Cloud layer 1 — warm amber, top-right, 30s drift */}
          <div
            className="absolute w-[700px] h-[700px] rounded-full bg-amber-200/45 blur-[130px]"
            style={{
              top: "-15%", right: "-10%",
              animation: "cloud-drift-1 30s ease-in-out infinite",
            }}
          />

          {/* Cloud layer 2 — soft rose, bottom-left, 35s drift */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full bg-rose-200/35 blur-[120px]"
            style={{
              bottom: "-10%", left: "-8%",
              animation: "cloud-drift-2 35s ease-in-out infinite",
            }}
          />

          {/* Cloud layer 3 — pale sky, center, 40s drift */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-sky-200/20 blur-[100px]"
            style={{
              top: "35%", left: "25%",
              animation: "cloud-drift-3 40s ease-in-out infinite",
            }}
          />

          {/* Cloud layer 4 — lavender whisper, top-left, 28s drift */}
          <div
            className="absolute w-[400px] h-[400px] rounded-full bg-violet-200/15 blur-[100px]"
            style={{
              top: "10%", left: "5%",
              animation: "cloud-drift-1 28s ease-in-out infinite reverse",
            }}
          />

          {/* Cloud layer 5 — warm peach, bottom-right */}
          <div
            className="absolute w-[450px] h-[450px] rounded-full bg-orange-100/25 blur-[110px]"
            style={{
              bottom: "5%", right: "5%",
              animation: "cloud-drift-2 32s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* Soft readability overlay — barely visible, just enough to lift text */}
        <div className="fixed inset-0 w-screen h-screen bg-white/20 backdrop-blur-[0.5px] -z-10 pointer-events-none" />


        {/* ═══════════════════════════════════════════════════════
            HERO — vertically centered, immersive, floating in space
        ═══════════════════════════════════════════════════════ */}
        <section className="relative flex items-center justify-center min-h-screen px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center space-y-10 -mt-12">

            {/* Gentle entrance marker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-[#1a1a1a]/35"
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
              className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.2rem] font-light leading-[1.12] tracking-[-0.025em] text-[#1a1a1a]/90"
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
              className="text-[15px] md:text-base text-[#1a1a1a]/50 max-w-md mx-auto leading-[1.8] font-light"
            >
              Explore real experiences from people who faced
              similar moments and discovered their way forward.
            </motion.p>

            {/* Search */}
            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
              onSubmit={handleSearch}
              className="max-w-md mx-auto"
            >
              <div className="relative border border-[#1a1a1a]/8 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/65 focus-within:bg-white/75 focus-within:border-[#1a1a1a]/15 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/25" />

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
                          className="absolute text-[15px] text-[#1a1a1a]/25 font-normal whitespace-nowrap"
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
                  className="px-4 py-2 rounded-full border border-[#1a1a1a]/6 bg-white/35 backdrop-blur-sm text-[13px] text-[#1a1a1a]/50 font-normal hover:bg-white/60 hover:border-[#1a1a1a]/12 hover:text-[#1a1a1a]/70 transition-all duration-400 cursor-pointer"
                >
                  <span className="mr-1.5 opacity-70">{feeling.emoji}</span>
                  {feeling.label}
                </button>
              ))}
            </motion.div>

          </div>

          {/* Scroll hint at bottom of viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#1a1a1a]/25 font-medium">
              Scroll to read stories
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[#1a1a1a]/15 to-transparent" />
          </motion.div>
        </section>


        {/* ═══════════════════════════════════════════════════════
            STORIES — journal entries floating on the atmospheric bg
        ═══════════════════════════════════════════════════════ */}
        <section className="relative px-6 md:px-12 py-24 md:py-32">
          <div className="max-w-3xl mx-auto space-y-20">

            <div className="text-center space-y-4">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="text-2xl md:text-3xl font-light text-[#1a1a1a]/85 tracking-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Every struggle leaves a lesson
              </motion.h2>
              <p className="text-sm text-[#1a1a1a]/40 font-normal max-w-sm mx-auto leading-relaxed">
                Real stories from people who chose to preserve their
                hard-won wisdom so others wouldn&apos;t walk alone.
              </p>
            </div>

            {/* Stories as quiet journal entries with generous spacing */}
            <div className="space-y-6">
              {stories.map((story, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.9, delay: i * 0.08 }}
                  className="p-8 md:p-10 rounded-3xl bg-white/35 backdrop-blur-sm border border-[#1a1a1a]/4 hover:bg-white/50 hover:border-[#1a1a1a]/8 transition-all duration-700 cursor-pointer"
                  onClick={() => handleQuickSearch(story.tag)}
                >
                  <p
                    className="text-[15px] md:text-base text-[#1a1a1a]/70 leading-[1.85] font-light"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    &ldquo;{story.excerpt}&rdquo;
                  </p>

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#1a1a1a]/5">
                    <span className="text-xs text-[#1a1a1a]/30 font-medium">
                      &mdash; {story.author}
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#1a1a1a]/20 border border-[#1a1a1a]/6 rounded-full px-3 py-1 bg-white/30">
                      {story.tag}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════
            INVITATION — gentle, human, not marketing
        ═══════════════════════════════════════════════════════ */}
        <section className="relative px-6 md:px-12 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="max-w-xl mx-auto text-center space-y-8"
          >
            <div className="w-px h-16 bg-[#1a1a1a]/8 mx-auto" />

            <h3
              className="text-xl md:text-2xl font-light text-[#1a1a1a]/80 tracking-tight leading-relaxed"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Your chapter matters too.
            </h3>

            <p className="text-sm text-[#1a1a1a]/40 font-normal max-w-sm mx-auto leading-[1.8]">
              The failure you&apos;re carrying, the lesson you learned the hard way,
              the growth that came from pain &mdash; someone out there needs to hear it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/create"
                className="px-7 py-3 rounded-full bg-[#1a1a1a]/85 text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                Preserve your experience
              </Link>
              <Link
                href="/explore"
                className="px-7 py-3 rounded-full border border-[#1a1a1a]/10 text-sm text-[#1a1a1a]/50 font-medium hover:border-[#1a1a1a]/20 hover:text-[#1a1a1a]/70 transition-all cursor-pointer flex items-center gap-2"
              >
                Explore the library <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-6">
              <p className="text-[11px] text-[#1a1a1a]/25 font-medium tracking-wide">
                12,000+ experiences preserved &middot; Completely anonymous &middot; Always free
              </p>
            </div>
          </motion.div>
        </section>


        {/* ═══════════════════════════════════════════════════════
            FOOTER — minimal, blends into the atmosphere
        ═══════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#1a1a1a]/5 py-10 px-6 md:px-12">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#1a1a1a]/25 font-medium">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-rose-300/60" />
              <span>Veilory &mdash; Preserving the emotional library of humanity.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/explore" className="hover:text-[#1a1a1a]/45 transition-colors">Explore</Link>
              <Link href="/create" className="hover:text-[#1a1a1a]/45 transition-colors">Preserve</Link>
              <Link href="/auth/signup" className="hover:text-[#1a1a1a]/45 transition-colors">Join</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
