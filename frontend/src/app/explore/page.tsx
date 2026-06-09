"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { simulateSearch, TRENDING_EMOTIONS } from "@/lib/mockData";
import { SearchResult, AIInsight } from "@/types";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, Sparkles, AlertCircle, RefreshCcw, HelpCircle, Lightbulb, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ExploreForm() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { experiences } = useAuth();
  
  const [query, setQuery] = useState(initialQuery);
  const [activeSearchQuery, setActiveSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Run search when query changes from URL params
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSelectedTag(initialQuery);
      performSearch(initialQuery);
    } else {
      // Load all by default if no query
      performSearch("");
    }
  }, [initialQuery, experiences]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setActiveSearchQuery(searchQuery);
    
    // Simulate network + semantic query latency
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    try {
      const { insight, results } = simulateSearch(searchQuery, experiences);
      setSearchResults(results);
      setAiInsight(searchQuery ? insight : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedTag("");
    performSearch(query);
  };

  const handleTagClick = (tag: string) => {
    const nextTag = selectedTag === tag ? "" : tag;
    setSelectedTag(nextTag);
    setQuery(nextTag);
    performSearch(nextTag);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedTag("");
    performSearch("");
  };

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-12">
      
      {/* Header Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          How are you feeling <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">today?</span>
        </h1>
        <p className="text-foreground/50 text-sm md:text-base leading-relaxed">
          Veilory processes stories semantically. Input what you are going through (failures, career blocks, heartbreaks) and discover collective human wisdom.
        </p>
      </div>

      {/* Moodboard Filter Row */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 pl-1 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Filter by Emotional Moodboard
        </label>
        <div className="flex flex-wrap gap-2.5">
          {TRENDING_EMOTIONS.map((emotion) => (
            <EmotionTag
              key={emotion.tag}
              tag={emotion.tag}
              count={emotion.count}
              size="md"
              isSelected={selectedTag === emotion.tag}
              onClick={() => handleTagClick(emotion.tag)}
            />
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative group w-full">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-[12px] opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative glass-panel rounded-3xl flex items-center p-2.5 bg-slate-950/40 border-white/10">
          <Search className="w-6 h-6 text-foreground/30 ml-4 shrink-0" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by feelings... e.g., 'I quit my job and regret it' or 'I failed my startup'"
            className="w-full bg-transparent border-none py-3.5 px-4 outline-none text-foreground placeholder:text-foreground/20 text-sm md:text-base font-semibold"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-foreground/40 hover:text-foreground mr-3 px-2 py-1 rounded bg-white/5 cursor-pointer"
            >
              Clear
            </button>
          )}
          <Button 
            type="submit"
            variant="primary"
            size="md"
            className="shrink-0"
          >
            Search
          </Button>
        </div>
      </form>

      {/* RESULTS / SKELETON DISPLAY */}
      <div className="space-y-10">
        
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {/* AI Insight Skeleton */}
            {activeSearchQuery && (
              <div className="h-44 rounded-3xl bg-white/5 border border-white/5 p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-32 h-5 bg-white/10 rounded" />
                  <div className="w-full h-4 bg-white/10 rounded" />
                  <div className="w-5/6 h-4 bg-white/10 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-white/10 rounded-full" />
                  <div className="w-16 h-6 bg-white/10 rounded-full" />
                </div>
              </div>
            )}
            
            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-56 rounded-[2rem] bg-white/5 border border-white/5" />
              <div className="h-56 rounded-[2rem] bg-white/5 border border-white/5" />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSearchQuery}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* 1. AI INSIGHT PANEL PLACEHOLDER */}
              {aiInsight && searchResults.length > 0 && (
                <div className="relative rounded-[2.5rem] p-8 md:p-10 border border-indigo-500/20 bg-indigo-500/5 shadow-[0_15px_50px_rgba(99,102,241,0.08)] overflow-hidden">
                  <div className="absolute -right-32 -top-32 w-72 h-72 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
                  
                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">AI Wisdom Insights</h2>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Synthesizing {searchResults.length} relevant experiences</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-foreground/80 leading-relaxed text-sm md:text-base font-semibold">
                      {aiInsight.summary}
                    </p>

                    {/* Themes */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider mr-2">Emergent Themes:</span>
                      {aiInsight.themes.map((theme) => (
                        <span key={theme} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
                          {theme}
                        </span>
                      ))}
                    </div>

                    {/* Reframing */}
                    <div className="p-5 rounded-2xl bg-slate-900/30 border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Cognitive Reframing Suggested
                      </h4>
                      <p className="text-xs text-foreground/75 leading-relaxed italic">
                        "{aiInsight.reframing}"
                      </p>
                    </div>

                    {/* Action steps */}
                    <div className="space-y-3 pt-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/50">Next Actionable Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-xs text-foreground/70 leading-relaxed pl-1">
                        {aiInsight.growth_steps.map((step, idx) => (
                          <li key={idx} className="font-medium">
                            <span className="text-foreground font-semibold ml-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                  </div>
                </div>
              )}

              {/* 2. SEARCH RESULTS CARD LIST / SIMILAR EXPERIENCES */}
              <div className="space-y-6">
                {activeSearchQuery && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/40 border-b border-white/5 pb-3">
                    {searchResults.length > 0 
                      ? `Matching Experiences (${searchResults.length})` 
                      : "No Direct Wisdom Match Found"}
                  </h3>
                )}

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((res) => (
                      <ExperienceCard 
                        key={res.experience.id} 
                        experience={res.experience} 
                        score={activeSearchQuery ? res.score : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-16 rounded-[2.5rem] text-center border-white/5 space-y-4 max-w-md mx-auto">
                    <AlertCircle className="w-10 h-10 text-foreground/30 mx-auto" />
                    <h4 className="font-bold text-lg">No Results Match Feeling</h4>
                    <p className="text-sm text-foreground/50 leading-relaxed">
                      We couldn't locate any public wisdom stories matching that emotional parameter yet.
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleClear}>
                      Reset search criteria
                    </Button>
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500" />
      </div>
    }>
      <ExploreForm />
    </Suspense>
  );
}
