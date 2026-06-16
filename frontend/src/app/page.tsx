"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Heart } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      excerpt: "We didn't have a dramatic breakup. We just slowly drifted into strangers. The quiet letting go was the hardest part — because there was no villain, just two people growing apart.",
      tag: "heartbreak",
      author: "Anonymous",
    },
    {
      excerpt: "I failed my second-year exams and thought my life was over. My friends moved forward while I stood still. But that pause taught me how to study with my ADHD, not against it.",
      tag: "academic failure",
      author: "A student who returned",
    },
    {
      excerpt: "I had a $250k salary and woke up every morning with dread. Quitting felt irresponsible. But my sleep, my creativity, my sense of self — they all came back the moment I walked away.",
      tag: "career change",
      author: "Someone who chose differently",
    },
  ];

  const feelings = [
    { label: "I feel lost", emoji: "\u{1F30A}", query: "lost" },
    { label: "I failed at something", emoji: "\u{1F331}", query: "failure" },
    { label: "My heart is broken", emoji: "\u{1F54A}\u{FE0F}", query: "heartbreak" },
    { label: "I'm burning out", emoji: "\u{1F305}", query: "burnout" },
    { label: "I need a fresh start", emoji: "\u{1F33F}", query: "growth" },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] selection:bg-amber-100 overflow-x-hidden -mx-4 md:-mx-8 -mt-28 -mb-10">

      {/* Atmospheric background — soft warm light */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-amber-100/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-rose-100/30 blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-sky-100/20 blur-[100px]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-36 md:pt-48 pb-24 md:pb-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-10">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-[#1a1a1a]/40"
          >
            <Heart className="w-3 h-3 text-rose-300" />
            <span>A sanctuary for human experiences</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-[2.5rem] md:text-[4rem] lg:text-[4.5rem] font-light leading-[1.1] tracking-[-0.02em] text-[#1a1a1a]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Someone has been{" "}
            <br className="hidden sm:inline" />
            where you are.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
            className="text-base md:text-lg text-[#1a1a1a]/55 max-w-xl mx-auto leading-relaxed font-light"
          >
            Explore real experiences from people who faced similar moments
            and discovered their way forward.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
            onSubmit={handleSearch}
            className="max-w-lg mx-auto"
          >
            <div className="relative border border-[#1a1a1a]/10 rounded-2xl bg-white/60 backdrop-blur-sm hover:border-[#1a1a1a]/20 focus-within:border-[#1a1a1a]/25 focus-within:bg-white/80 transition-all duration-500 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" />

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-24 py-4.5 outline-none text-[15px] text-[#1a1a1a] font-normal placeholder:text-transparent"
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
                        className="absolute text-[15px] text-[#1a1a1a]/30 font-normal whitespace-nowrap"
                      >
                        {placeholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#2d2d2d] transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </motion.form>

        </div>
      </section>

      {/* FEELINGS ROW */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-center text-[11px] font-medium tracking-[0.15em] uppercase text-[#1a1a1a]/35 mb-8">
            What are you going through?
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {feelings.map((feeling) => (
              <button
                key={feeling.query}
                onClick={() => handleQuickSearch(feeling.query)}
                className="px-5 py-2.5 rounded-full border border-[#1a1a1a]/8 bg-white/50 backdrop-blur-sm text-sm text-[#1a1a1a]/65 font-normal hover:bg-white/80 hover:border-[#1a1a1a]/15 hover:text-[#1a1a1a]/85 transition-all duration-300 cursor-pointer"
              >
                <span className="mr-2">{feeling.emoji}</span>
                {feeling.label}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* STORIES */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-16 space-y-3">
            <h2
              className="text-2xl md:text-3xl font-light text-[#1a1a1a] tracking-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Every struggle leaves a lesson
            </h2>
            <p className="text-sm text-[#1a1a1a]/45 font-normal max-w-md mx-auto leading-relaxed">
              These are real stories from people who chose to preserve their
              hard-won wisdom so others wouldn&apos;t walk alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]/5 rounded-2xl overflow-hidden">
            {stories.map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="bg-[#faf8f5] p-8 md:p-10 space-y-5 hover:bg-white/60 transition-colors duration-500 cursor-pointer"
                onClick={() => handleQuickSearch(story.tag)}
              >
                <p
                  className="text-[15px] md:text-base text-[#1a1a1a]/75 leading-[1.8] font-light"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  &ldquo;{story.excerpt}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#1a1a1a]/35 font-medium">
                    &mdash; {story.author}
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#1a1a1a]/25 border border-[#1a1a1a]/8 rounded-full px-3 py-1">
                    {story.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* GENTLE CTA */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="w-px h-16 bg-[#1a1a1a]/10 mx-auto" />

          <h3
            className="text-xl md:text-2xl font-light text-[#1a1a1a] tracking-tight leading-relaxed"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Your chapter matters too.
          </h3>

          <p className="text-sm text-[#1a1a1a]/45 font-normal max-w-sm mx-auto leading-relaxed">
            The failure you&apos;re carrying, the lesson you learned the hard way,
            the growth that came from pain &mdash; someone out there needs to hear it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/create"
              className="px-7 py-3 rounded-full bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#2d2d2d] transition-colors cursor-pointer"
            >
              Preserve your experience
            </Link>
            <Link
              href="/explore"
              className="px-7 py-3 rounded-full border border-[#1a1a1a]/12 text-sm text-[#1a1a1a]/60 font-medium hover:border-[#1a1a1a]/25 hover:text-[#1a1a1a]/80 transition-all cursor-pointer flex items-center gap-2"
            >
              Explore the library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-8">
            <p className="text-[11px] text-[#1a1a1a]/30 font-medium tracking-wide">
              12,000+ experiences preserved &middot; Completely anonymous &middot; Always free
            </p>
          </div>

        </motion.div>
      </section>

      {/* FOOTER */}
      <section className="border-t border-[#1a1a1a]/5 py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#1a1a1a]/30 font-medium">
          <div className="flex items-center gap-2">
            <Heart className="w-3 h-3 text-rose-300" />
            <span>Veilory &mdash; Preserving the emotional library of humanity.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-[#1a1a1a]/55 transition-colors">Explore</Link>
            <Link href="/create" className="hover:text-[#1a1a1a]/55 transition-colors">Preserve</Link>
            <Link href="/auth/signup" className="hover:text-[#1a1a1a]/55 transition-colors">Join</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
