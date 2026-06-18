"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { Experience } from "@/types";
import { experienceService } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const {
    searchLimit,
    searchesRemaining,
    attemptSearch,
    logSearchQuery
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "I failed my exams",
    "My startup failed",
    "I feel lost",
    "My heart is broken",
    "I need a fresh start"
  ];

  // Homepage stories preview data
  const previewStories: Experience[] = [
    {
      id: "preview-1",
      title: "I spent two years preparing for an exam and still failed",
      content: "I spent two years preparing for an exam and still failed. Looking back, that failure forced me to discover opportunities I never would have considered. It taught me how to study with my ADHD, not against it, and led me to a career in design where my creativity is finally valued.",
      emotion_tags: ["failure", "exams", "lessons"],
      privacy: "Anonymous",
      user_id: "user-anon-1",
      author_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "preview-2",
      title: "Grieving the loss that taught me strength",
      content: "I thought losing someone would break me forever. It didn't. It taught me how much strength I had. The quiet letting go was the hardest part — because there was no villain, just two people slowly growing apart. But the resilience I built in that quiet phase is my greatest strength now.",
      emotion_tags: ["heartbreak", "loss", "growth"],
      privacy: "Anonymous",
      user_id: "user-anon-2",
      author_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "preview-3",
      title: "My startup failed after 18 months",
      content: "My startup failed after 18 months. I lost money, confidence, and direction. We spent too much time building the product and not enough time talking to customers. But I learned more in those 18 months about resilience, sales, and iteration than in four years of college.",
      emotion_tags: ["startup", "failure", "career"],
      privacy: "Public",
      user_id: "user-named-1",
      author_name: "Aarav Sharma",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const [shuffledStories, setShuffledStories] = useState<Experience[]>([]);

  useEffect(() => {
    // Attempt to load public stories from database first, fallback to static editorial
    const loadAndShuffle = async () => {
      try {
        const data = await experienceService.listPublic(0, 15);
        if (data.experiences && data.experiences.length >= 3) {
          // Shuffle database public stories
          const shuffled = [...data.experiences].sort(() => Math.random() - 0.5);
          setShuffledStories(shuffled.slice(0, 3));
        } else {
          const shuffled = [...previewStories].sort(() => Math.random() - 0.5);
          setShuffledStories(shuffled);
        }
      } catch (err) {
        console.error("Failed to load DB stories, falling back to static editorial:", err);
        const shuffled = [...previewStories].sort(() => Math.random() - 0.5);
        setShuffledStories(shuffled);
      }
    };
    loadAndShuffle();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim() || placeholders[placeholderIndex];
    if (attemptSearch()) {
      logSearchQuery(q);
      router.push(`/explore?q=${encodeURIComponent(q)}`);
    }
  };

  const handleQuickSearch = (query: string) => {
    if (attemptSearch()) {
      logSearchQuery(query);
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  const feelings = [
    { label: "I feel lost", emoji: "\u{1F30A}", query: "lost" },
    { label: "I failed at something", emoji: "\u{1F331}", query: "failure" },
    { label: "My heart is broken", emoji: "\u{1F54A}\u{FE0F}", query: "heartbreak" },
    { label: "I’m burning out", emoji: "\u{1F305}", query: "burnout" },
    { label: "I need a fresh start", emoji: "\u{1F33F}", query: "growth" }
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
        <div className="fixed inset-0 overflow-hidden z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://res.cloudinary.com/dlhxpwnth/video/upload/v1781689612/0617_dhfg0l.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] z-10 pointer-events-none" />

        {/* ═══════════════════════════════════════════════════════
            HERO — vertically centered, immersive, floating in space
        ═══════════════════════════════════════════════════════ */}
        <section className="relative flex-grow flex items-center justify-center px-6 md:px-12 py-20 min-h-[90vh]">
          <div className="max-w-3xl mx-auto text-center space-y-10">

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
            <div className="space-y-3">
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

              {/* Remaining Searches Counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.3 }}
                className="text-[10px] text-[#1a1a1a]/45 uppercase tracking-[0.08em] font-medium"
              >
                {searchLimit === Infinity 
                  ? "Unlimited searches remaining today" 
                  : `${searchesRemaining} of ${searchLimit} searches remaining today`}
              </motion.div>
            </div>

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
            STORIES FROM PEOPLE LIKE YOU — preview feed
        ═══════════════════════════════════════════════════════ */}
        <section className="relative px-6 md:px-12 py-24 border-t border-[#1a1a1a]/5 bg-white/10">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <h2
                className="text-2xl md:text-3xl font-light text-[#0a0a0a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Stories From People Like You
              </h2>
              <p className="text-xs text-[#1a1a1a]/45 font-light max-w-sm mx-auto leading-relaxed">
                Real reflections from individuals who faced difficult moments and preserved their perspective.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shuffledStories.map((story) => (
                <ExperienceCard key={story.id} experience={story} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            TRENDING EXPERIENCES SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="relative px-6 md:px-12 py-20 border-t border-[#1a1a1a]/5">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="space-y-3">
              <h2
                className="text-xl md:text-2xl font-light text-[#0a0a0a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Trending Topics This Week
              </h2>
              <p className="text-xs text-[#1a1a1a]/45 font-light">
                Topics currently being written about and explored in the library.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Exam Failure", query: "exam" },
                { label: "Career Confusion", query: "career" },
                { label: "Burnout", query: "burnout" },
                { label: "Startup Failure", query: "startup" },
                { label: "Heartbreak", query: "heartbreak" },
                { label: "Self Doubt", query: "anxiety" }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleQuickSearch(item.query)}
                  className="px-5 py-2.5 rounded-full border border-[#1a1a1a]/8 bg-white/35 backdrop-blur-sm text-xs text-[#1a1a1a]/60 font-medium hover:bg-white/60 hover:border-[#1a1a1a]/15 hover:text-[#1a1a1a]/80 transition-all duration-400 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            EDITORIAL PHILOSOPHY SECTIONS
        ═══════════════════════════════════════════════════════ */}
        <section className="relative px-6 md:px-12 py-32 border-t border-[#1a1a1a]/5 bg-white/15">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
              
              <div className="space-y-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]/35">Philosophy</span>
                <h3
                  className="text-xl font-light text-[#0a0a0a] tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Why Preserve Experiences?
                </h3>
                <p className="text-sm text-[#1a1a1a]/60 leading-relaxed font-light">
                  People write journals for themselves. Veilory preserves experiences so lessons can help others too.
                </p>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]/35">Wisdom</span>
                <h3
                  className="text-xl font-light text-[#0a0a0a] tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Every Story Holds Wisdom
                </h3>
                <p className="text-sm text-[#1a1a1a]/60 leading-relaxed font-light">
                  The mistake you&apos;re regretting today may become someone else&apos;s guide tomorrow.
                </p>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]/35">Sanctuary</span>
                <h3
                  className="text-xl font-light text-[#0a0a0a] tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  You Are Not Alone
                </h3>
                <p className="text-sm text-[#1a1a1a]/60 leading-relaxed font-light">
                  Millions of people have faced uncertainty, failure, heartbreak, and change. Veilory helps people learn from those journeys.
                </p>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]/35">Vision</span>
                <h3
                  className="text-xl font-light text-[#0a0a0a] tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Build a Library of Human Experience
                </h3>
                <p className="text-sm text-[#1a1a1a]/60 leading-relaxed font-light">
                  A future where wisdom is searchable, discoverable, and preserved for generations.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER — minimal, blends into the atmosphere
        ═══════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#1a1a1a]/5 py-10 px-6 md:px-12">
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
