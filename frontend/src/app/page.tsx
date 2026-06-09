"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Shield, Heart, Search, Eye, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { TRENDING_EMOTIONS } from "@/lib/mockData";

export default function Home() {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/explore?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      router.push("/explore");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as any;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  } as any;

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as any;

  return (
    <div className="space-y-32">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 flex flex-col items-center justify-center text-center">
        {/* Floating background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8 px-4"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 shadow-xl">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">
              The World's First Emotional Experience Engine
            </span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1 
            variants={itemVariants} 
            className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground"
          >
            Search Human Experiences, <br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Not Generic Answers
            </span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            variants={itemVariants} 
            className="text-base md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed"
          >
            Discover real stories, failures, lessons, and wisdom from people who have walked similar paths. Preserve your emotional history in a safe, AI-guided sanctuary.
          </motion.p>

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => router.push("/explore")}
            >
              Start Exploring
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/create")}
            >
              Share Your Story
            </Button>
          </motion.div>

          {/* Search bar inside Hero */}
          <motion.form 
            variants={itemVariants}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative mt-16 group w-full"
          >
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-[12px] opacity-25 group-hover:opacity-45 transition duration-1000 group-hover:duration-200" />
            <div className="relative glass-panel rounded-3xl flex items-center p-2.5 bg-slate-950/40 border-white/10">
              <Search className="w-5 h-5 text-foreground/40 ml-4 shrink-0" />
              <input 
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="I failed my exams and feel lost..."
                className="w-full bg-transparent border-none py-3 px-4 outline-none text-foreground placeholder:text-foreground/30 text-sm md:text-base"
              />
              <Button 
                type="submit"
                variant="primary"
                size="sm"
                className="shrink-0"
              >
                Search
              </Button>
            </div>
          </motion.form>
        </motion.div>

        {/* Floating Glass Cards Graphic */}
        <div className="hidden lg:block absolute w-full max-w-7xl h-[300px] -bottom-16 pointer-events-none">
          {/* Card left */}
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="absolute left-0 top-10 w-64 p-6 glass-panel rounded-[2rem] text-left border-white/10 bg-slate-950/20 rotate-[-6deg]"
          >
            <div className="flex gap-2 mb-3">
              <span className="text-[10px] uppercase font-bold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10">#heartbreak</span>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed italic">
              "We didn't fight. We just drifted. The quiet letting go was the hardest part."
            </p>
          </motion.div>

          {/* Card right */}
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="absolute right-0 top-0 w-72 p-6 glass-panel rounded-[2rem] text-left border-white/10 bg-slate-950/20 rotate-[4deg]"
            style={{ y: -30 }}
          >
            <div className="flex gap-2 mb-3">
              <span className="text-[10px] uppercase font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10">#failure</span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50/5">#startup</span>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed italic">
              "Building for 18 months without talking to customers was a $150k lesson. But I learned more sales than ever."
            </p>
          </motion.div>
        </div>
      </section>

      {/* EMOTIONAL CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold">Search by Emotional Categories</h2>
          <p className="text-foreground/50 max-w-lg mx-auto text-sm md:text-base">
            Select an emotion board to discover how others managed identical feelings.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TRENDING_EMOTIONS.map((emotion) => (
            <button
              key={emotion.tag}
              onClick={() => router.push(`/explore?q=${emotion.tag}`)}
              className={cn(
                "p-6 rounded-3xl glass-panel border flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.05] hover:bg-white/10 group cursor-pointer text-center bg-slate-950/10",
                emotion.color
              )}
            >
              <span className="text-lg font-bold capitalize">{emotion.tag}</span>
              <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                {emotion.count} stories
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* TRENDING EXPERIENCES / FEATURED STORIES */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Heart className="w-6 h-6 text-rose-400" />
              Featured Wisdom Stories
            </h2>
            <p className="text-foreground/50 text-xs md:text-sm mt-1">Real-life learnings from people who lived them.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/explore")}>
            Explore all stories
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col justify-between" glowColor="indigo">
            <div>
              <div className="flex gap-2 mb-4">
                <EmotionTag tag="startup" />
                <EmotionTag tag="failure" />
              </div>
              <Quote className="w-8 h-8 text-indigo-400/20 mb-3" />
              <h3 className="text-lg font-bold mb-3">My startup failed after 2 years of building</h3>
              <p className="text-foreground/75 text-sm leading-relaxed mb-6">
                We spent too much time perfecting code and not enough time talking to users. The day we shut down, I sat in my car and cried. Looking back, I learned more about sales and resilience...
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs font-semibold text-foreground/50">Marc Andreessen Clone</span>
              <Link href="/experiences/exp-1" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                Read Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between" glowColor="rose">
            <div>
              <div className="flex gap-2 mb-4">
                <EmotionTag tag="heartbreak" />
                <EmotionTag tag="grief" />
              </div>
              <Quote className="w-8 h-8 text-rose-400/20 mb-3" />
              <h3 className="text-lg font-bold mb-3">Grieving a relationship that just drifted away</h3>
              <p className="text-foreground/75 text-sm leading-relaxed mb-6">
                Deciding to separate was harder than if someone had made a mistake, because there was no villain. I still love her, but we are different people now. Quiet ache of letting go...
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs font-semibold text-foreground/50">Anonymous Preserver</span>
              <Link href="/experiences/exp-4" className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1">
                Read Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between" glowColor="purple">
            <div>
              <div className="flex gap-2 mb-4">
                <EmotionTag tag="career" />
                <EmotionTag tag="burnout" />
              </div>
              <Quote className="w-8 h-8 text-purple-400/20 mb-3" />
              <h3 className="text-lg font-bold mb-3">Left a high-paying FAANG job because I hated coding</h3>
              <p className="text-foreground/75 text-sm leading-relaxed mb-6">
                On paper, I had it all. Great perks, high prestige, $250k salary. But I woke up with dread. I hated sitting in front of JIRA tickets all day. My digestion and creativity returned when I quit...
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs font-semibold text-foreground/50">Sarah Chen</span>
              <Link href="/experiences/exp-3" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                Read Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* WHY VEILORY */}
      <section className="max-w-6xl mx-auto px-4 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Why Preserving Emotional Wisdom Matters</h2>
            <p className="text-foreground/60 leading-relaxed text-sm md:text-base">
              Traditional platforms incentivize clout, clicks, and highlight reels. Veilory is built to capture the hard-won insights gained during struggles, errors, and pivots.
            </p>
            <p className="text-foreground/60 leading-relaxed text-sm md:text-base">
              By logging your experiences, you help train our collective wisdom search model, making it possible for someone going through a matching crisis to receive human guidance.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="text-3xl font-extrabold text-indigo-400">12,000+</h4>
                <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider mt-1">Experiences shared</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-purple-400">98.4%</h4>
                <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider mt-1">Relational relevance</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Intelligent Reframing</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Our AI model clusters stories and suggests positive cognitive reframing parameters for emotional recovery.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Guaranteed Privacy</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Opt for Public logging, complete Anonymous encryption, or keep it strictly locked as a private reflection journal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto text-center px-4">
        <div className="glass-panel rounded-[3rem] p-8 md:p-16 border border-white/10 bg-slate-900/40 relative overflow-hidden space-y-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />
          
          <h2 className="text-3xl md:text-5xl font-extrabold">Ready to Preserve Your Chapter?</h2>
          <p className="text-foreground/60 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Your failed project, your heartbreak, your career pivot—all contain invaluable lessons. Write it down. Help someone else walk their path today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="md" variant="primary" onClick={() => router.push("/create")}>
              Write Experience
            </Button>
            <Button size="md" variant="secondary" onClick={() => router.push("/auth/signup")}>
              Create Sanctuary Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
