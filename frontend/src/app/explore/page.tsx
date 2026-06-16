"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { simulateSearch, TRENDING_EMOTIONS } from "@/lib/mockData";
import { SearchResult, AIInsight } from "@/types";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { Button } from "@/components/ui/Button";
import { Search, BookOpen, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
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

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSelectedTag(initialQuery);
      performSearch(initialQuery);
    } else {
      performSearch("");
    }
  }, [initialQuery, experiences]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setActiveSearchQuery(searchQuery);

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

      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1
          className="text-3xl md:text-4xl font-light tracking-tight leading-tight text-[#1a1a1a]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          What are you going through?
        </h1>
        <p className="text-[#1a1a1a]/45 text-sm md:text-base leading-relaxed font-light">
          Search by what you&apos;re feeling. Discover stories from people
          who walked a similar path and found their way forward.
        </p>
      </div>

      {/* Emotion Filter */}
      <div className="space-y-3">
        <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#1a1a1a]/35 pl-1 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Browse by feeling
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

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl flex items-center p-2.5 border border-[#1a1a1a]/8 hover:border-[#1a1a1a]/15 focus-within:border-[#1a1a1a]/20 transition-all shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
          <Search className="w-5 h-5 text-[#1a1a1a]/25 ml-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by feelings... e.g., 'I quit my job and regret it'"
            className="w-full bg-transparent border-none py-3 px-4 outline-none text-[#1a1a1a] placeholder:text-[#1a1a1a]/25 text-sm md:text-base font-normal"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-[#1a1a1a]/35 hover:text-[#1a1a1a]/60 mr-3 px-2 py-1 rounded bg-[#1a1a1a]/5 cursor-pointer"
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

      {/* Results */}
      <div className="space-y-10">

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {activeSearchQuery && (
              <div className="h-44 rounded-2xl bg-[#1a1a1a]/4 border border-[#1a1a1a]/5 p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-32 h-5 bg-[#1a1a1a]/8 rounded" />
                  <div className="w-full h-4 bg-[#1a1a1a]/6 rounded" />
                  <div className="w-5/6 h-4 bg-[#1a1a1a]/6 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-[#1a1a1a]/6 rounded-full" />
                  <div className="w-16 h-6 bg-[#1a1a1a]/6 rounded-full" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-56 rounded-2xl bg-[#1a1a1a]/4 border border-[#1a1a1a]/5" />
              <div className="h-56 rounded-2xl bg-[#1a1a1a]/4 border border-[#1a1a1a]/5" />
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
              {/* Insight Panel */}
              {aiInsight && searchResults.length > 0 && (
                <div className="relative rounded-2xl p-8 md:p-10 border border-[#1a1a1a]/6 bg-white/50 backdrop-blur-sm overflow-hidden">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#1a1a1a]/5 text-[#1a1a1a]/50">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h2
                          className="text-lg font-medium text-[#1a1a1a]"
                          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                          Reflections from similar experiences
                        </h2>
                        <p className="text-[10px] text-[#1a1a1a]/35 font-medium uppercase tracking-wider mt-0.5">
                          Drawing from {searchResults.length} stories
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-[#1a1a1a]/65 leading-relaxed text-sm md:text-base font-light">
                      {aiInsight.summary}
                    </p>

                    {/* Themes */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-[11px] font-medium text-[#1a1a1a]/35 uppercase tracking-wider mr-2">Common themes:</span>
                      {aiInsight.themes.map((theme) => (
                        <span key={theme} className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a1a]/5 border border-[#1a1a1a]/8 text-[#1a1a1a]/55">
                          {theme}
                        </span>
                      ))}
                    </div>

                    {/* Reframing */}
                    <div className="p-5 rounded-xl bg-[#1a1a1a]/3 border border-[#1a1a1a]/5 space-y-2">
                      <h4 className="text-xs font-medium text-[#1a1a1a]/50 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> A different perspective
                      </h4>
                      <p className="text-xs text-[#1a1a1a]/60 leading-relaxed italic"
                         style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        &ldquo;{aiInsight.reframing}&rdquo;
                      </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3 pt-3">
                      <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#1a1a1a]/40">Steps others found helpful:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-xs text-[#1a1a1a]/55 leading-relaxed pl-1">
                        {aiInsight.growth_steps.map((step, idx) => (
                          <li key={idx} className="font-normal">
                            <span className="text-[#1a1a1a]/70 ml-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="space-y-6">
                {activeSearchQuery && (
                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-[#1a1a1a]/35 border-b border-[#1a1a1a]/6 pb-3">
                    {searchResults.length > 0
                      ? `Related experiences (${searchResults.length})`
                      : "No matching experiences found"}
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
                  <div className="bg-white/50 p-16 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4 max-w-md mx-auto">
                    <AlertCircle className="w-10 h-10 text-[#1a1a1a]/20 mx-auto" />
                    <h4 className="font-medium text-lg text-[#1a1a1a]/80" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>No stories found</h4>
                    <p className="text-sm text-[#1a1a1a]/40 leading-relaxed">
                      We couldn&apos;t find experiences matching that feeling yet.
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleClear}>
                      Reset search
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a1a]/15 border-t-[#1a1a1a]/60" />
      </div>
    }>
      <ExploreForm />
    </Suspense>
  );
}
