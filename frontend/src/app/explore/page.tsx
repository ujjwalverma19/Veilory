"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TRENDING_EMOTIONS } from "@/lib/mockData";
import { Experience, AIInsight } from "@/types";
import { searchService, SearchResultItem } from "@/lib/api";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { Button } from "@/components/ui/Button";
import { Search, BookOpen, AlertCircle, Lightbulb, TrendingUp, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function ExploreForm() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const {
    experiences,
    searchesRemaining,
    searchLimit,
    attemptSearch,
    incrementSearchCount,
    logSearchQuery
  } = useAuth();

  const [query, setQuery] = useState(initialQuery);
  const [activeSearchQuery, setActiveSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Advanced Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEmotion, setFilterEmotion] = useState<string>("all");

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSelectedTag(initialQuery);
      performSearch(initialQuery);
    } else {
      performSearch("");
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setActiveSearchQuery(searchQuery);

    try {
      const data = await searchService.search(searchQuery);
      setSearchResults(data.results);
      setAiInsight(searchQuery ? data.insight : null);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attemptSearch()) {
      incrementSearchCount();
      logSearchQuery(query);
      setSelectedTag("");
      performSearch(query);
    }
  };

  const handleTagClick = (tag: string) => {
    const nextTag = selectedTag === tag ? "" : tag;
    setSelectedTag(nextTag);
    setQuery(nextTag);
    if (nextTag) {
      if (attemptSearch()) {
        incrementSearchCount();
        logSearchQuery(nextTag);
        performSearch(nextTag);
      }
    } else {
      performSearch("");
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelectedTag("");
    performSearch("");
  };

  // Filter and sort results based on user preferences
  const filteredAndSortedResults = useMemo(() => {
    let list = [...searchResults];

    // 1. Filter by Type
    if (filterType !== "all") {
      const typeLower = filterType.toLowerCase();
      list = list.filter((res) =>
        res.experience.emotion_tags.some(
          (t) => t.toLowerCase() === typeLower || t.toLowerCase().includes(typeLower)
        )
      );
    }

    // 2. Filter by Emotion Tag
    if (filterEmotion !== "all") {
      const emotionLower = filterEmotion.toLowerCase();
      list = list.filter((res) =>
        res.experience.emotion_tags.some(
          (t) => t.toLowerCase() === emotionLower || t.toLowerCase().includes(emotionLower)
        )
      );
    }

    // 3. Sort by Time
    list.sort((a, b) => {
      const dateA = new Date(a.experience.created_at).getTime();
      const dateB = new Date(b.experience.created_at).getTime();
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [searchResults, sortBy, filterType, filterEmotion]);

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-8">

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

      {/* Search Input and Daily Limit */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl flex items-center p-2.5 border border-[#1a1a1a]/8 hover:border-[#1a1a1a]/15 focus-within:border-[#1a1a1a]/20 transition-all shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            <Search className="w-5 h-5 text-[#1a1a1a]/25 ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by feelings... e.g., 'I failed my exams'"
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

        <div className="flex items-center justify-between px-2 text-[10px] text-[#1a1a1a]/45 font-medium tracking-wide uppercase">
          <span>
            {searchLimit === Infinity 
              ? "Unlimited searches remaining today" 
              : `${searchesRemaining} of ${searchLimit} searches remaining today`}
          </span>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-[10px] text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors font-medium tracking-wider uppercase cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showFilters ? "Hide Filters" : "Filter & Sort"}
          </button>
        </div>
      </div>

      {/* Advanced Filtering controls */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/40 p-5 rounded-2xl border border-[#1a1a1a]/6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              
              {/* Sort controls */}
              <div className="space-y-2.5">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#1a1a1a]/40">Order by Time</span>
                <div className="flex bg-[#1a1a1a]/5 p-0.5 rounded-lg border border-[#1a1a1a]/6 w-fit">
                  {[
                    { label: "Latest", value: "latest" },
                    { label: "Oldest", value: "oldest" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSortBy(item.value as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                        sortBy === item.value
                          ? "bg-white text-[#1a1a1a] shadow-sm"
                          : "text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type controls */}
              <div className="space-y-2.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1a1a1a]/40">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/60 border border-[#1a1a1a]/8 text-[#1a1a1a]/70 rounded-xl px-3.5 py-2 outline-none font-medium cursor-pointer focus:border-[#1a1a1a]/20 w-full sm:max-w-xs text-xs"
                >
                  <option value="all">All Types</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="heartbreak">Heartbreak</option>
                  <option value="career">Career</option>
                  <option value="startup">Startup</option>
                  <option value="growth">Growth</option>
                  <option value="burnout">Burnout</option>
                  <option value="life lessons">Life Lessons</option>
                </select>
              </div>

              {/* Emotion controls */}
              <div className="space-y-2.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1a1a1a]/40">Filter by Emotion</label>
                <select
                  value={filterEmotion}
                  onChange={(e) => setFilterEmotion(e.target.value)}
                  className="bg-white/60 border border-[#1a1a1a]/8 text-[#1a1a1a]/70 rounded-xl px-3.5 py-2 outline-none font-medium cursor-pointer focus:border-[#1a1a1a]/20 w-full sm:max-w-xs text-xs"
                >
                  <option value="all">All Emotions</option>
                  <option value="lost">Lost</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="motivation">Motivation</option>
                  <option value="self doubt">Self Doubt</option>
                  <option value="resilience">Resilience</option>
                  <option value="confidence">Confidence</option>
                </select>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {aiInsight && filteredAndSortedResults.length > 0 && (
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
                          Drawing from {filteredAndSortedResults.length} stories
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
                    {filteredAndSortedResults.length > 0
                      ? `Related experiences (${filteredAndSortedResults.length})`
                      : "No matching experiences found"}
                  </h3>
                )}

                {filteredAndSortedResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAndSortedResults.map((res) => (
                      <ExperienceCard
                        key={res.experience.id}
                        experience={res.experience}
                        score={activeSearchQuery ? res.score : undefined}
                        explanation={res.explanation}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/50 p-16 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4 max-w-md mx-auto">
                    <AlertCircle className="w-10 h-10 text-[#1a1a1a]/20 mx-auto" />
                    <h4 className="font-medium text-lg text-[#1a1a1a]/80" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>No stories found</h4>
                    <p className="text-sm text-[#1a1a1a]/40 leading-relaxed">
                      We couldn&apos;t find experiences matching the active query and filters.
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
