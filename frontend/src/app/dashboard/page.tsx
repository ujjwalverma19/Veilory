"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/shared/Sidebar";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Heart, Globe, Ghost, Lock, AlertCircle, PlusCircle,
  FileText, Search, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Experience } from "@/types";
import { cn } from "@/lib/utils";
import { experienceService, recommendationService, RecommendedStory } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    experiences,
    deleteExperience,
    viewedStoryIds,
    previousSearches,
    userInterests,
    toggleUserInterest,
    upgradeToPremium
  } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [myExperiences, setMyExperiences] = useState<Experience[]>([]);
  const [isLoadingMyExps, setIsLoadingMyExps] = useState(false);
  const [backendRecs, setBackendRecs] = useState<RecommendedStory[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [dbStats, setDbStats] = useState({
    total: 0,
    publicCount: 0,
    anonCount: 0,
    privateCount: 0
  });

  // State variables for recommendations filtering
  const [recSortBy, setRecSortBy] = useState<"score" | "latest" | "oldest">("score");
  const [recFilterType, setRecFilterType] = useState<string>("all");
  const [recFilterEmotion, setRecFilterEmotion] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch my experiences
  const fetchMyExperiences = async () => {
    setIsLoadingMyExps(true);
    try {
      const res = await experienceService.listMine(0, 100);
      setMyExperiences(res.experiences);
      
      const userExps = res.experiences;
      const pub = userExps.filter(e => e.privacy.toLowerCase() === "public").length;
      const anon = userExps.filter(e => e.privacy.toLowerCase() === "anonymous").length;
      const priv = userExps.filter(e => e.privacy.toLowerCase() === "private").length;

      setDbStats({
        total: userExps.length,
        publicCount: pub,
        anonCount: anon,
        privateCount: priv
      });
    } catch (err) {
      console.error("Failed to fetch my experiences:", err);
    } finally {
      setIsLoadingMyExps(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const recs = await recommendationService.getRecommended();
      setBackendRecs(recs);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyExperiences();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "recommendations") {
      fetchRecommendations();
    }
  }, [activeTab, isAuthenticated, userInterests]);

  // Frontend filter and sort on recommendations fetched from backend
  const filteredRecs = useMemo(() => {
    let pool = [...backendRecs];

    // Apply Type Filter
    if (recFilterType !== "all") {
      const typeLower = recFilterType.toLowerCase();
      pool = pool.filter(({ experience }) =>
        experience.emotion_tags.some((t) => t.toLowerCase() === typeLower || t.toLowerCase().includes(typeLower))
      );
    }

    // Apply Emotion Tag Filter
    if (recFilterEmotion !== "all") {
      const emotionLower = recFilterEmotion.toLowerCase();
      pool = pool.filter(({ experience }) =>
        experience.emotion_tags.some((t) => t.toLowerCase() === emotionLower || t.toLowerCase().includes(emotionLower))
      );
    }

    // Sort Recommendations by Score or Date
    if (recSortBy === "score") {
      pool.sort((a, b) => b.score - a.score);
    } else {
      pool.sort((a, b) => {
        const dateA = new Date(a.experience.created_at).getTime();
        const dateB = new Date(b.experience.created_at).getTime();
        return recSortBy === "latest" ? dateB - dateA : dateA - dateB;
      });
    }

    return pool.slice(0, 4); // Limit to top 4 cards
  }, [backendRecs, recFilterType, recFilterEmotion, recSortBy]);

  const handleEdit = (id: string | number) => {
    router.push(`/create?edit=${id}`);
  };

  const handleDeleteTrigger = (id: string | number) => {
    setDeleteTargetId(String(id));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteExperience(deleteTargetId);
      setDeleteTargetId(null);
      await fetchMyExperiences();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-3 border-[#1a1a1a]/10 border-t-[#1a1a1a]/50 animate-spin" />
          <span className="text-sm text-[#1a1a1a]/35 font-medium">Loading your library...</span>
        </div>
      </div>
    );
  }

  const deleteTargetExp = myExperiences.find(e => String(e.id) === deleteTargetId);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 w-full space-y-8 min-h-[calc(100vh-160px)]">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Welcome back, {user.name}
                </h1>
                <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">Your personal library of experiences and reflections.</p>
              </div>

              {user.tier === "premium" && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1a1a1a] text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Premium
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                icon={<FileText className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Total Stories"
                value={dbStats.total}
              />
              <StatsCard
                icon={<Globe className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Public"
                value={dbStats.publicCount}
              />
              <StatsCard
                icon={<Ghost className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Anonymous"
                value={dbStats.anonCount}
              />
              <StatsCard
                icon={<Lock className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Private"
                value={dbStats.privateCount}
              />
            </div>

            {/* Recent + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-[#1a1a1a]/6 pb-3">
                  <h3 className="font-medium text-[#1a1a1a]/70 text-sm">Recent stories</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("my-experiences")}>
                    View all ({myExperiences.length})
                  </Button>
                </div>

                {isLoadingMyExps && myExperiences.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-5 rounded-xl bg-white/40 border border-[#1a1a1a]/6 animate-pulse h-20" />
                    ))}
                  </div>
                ) : myExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {myExperiences.slice(0, 2).map((exp) => (
                      <div
                        key={exp.id}
                        className="p-5 rounded-xl bg-white/40 border border-[#1a1a1a]/6 flex items-center justify-between gap-4 hover:bg-white/60 hover:border-[#1a1a1a]/10 transition-colors"
                      >
                        <div className="overflow-hidden">
                          <h4 className="font-medium text-sm truncate text-[#1a1a1a]">{exp.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-[#1a1a1a]/35 mt-1 font-medium">
                            <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                            <span>&middot;</span>
                            <span className="capitalize">{exp.privacy}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="px-3 py-1.5" onClick={() => handleEdit(exp.id)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="px-3 py-1.5 text-rose-400/60 hover:text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteTrigger(exp.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/40 p-10 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4">
                    <AlertCircle className="w-8 h-8 text-[#1a1a1a]/20 mx-auto" />
                    <div>
                      <h4 className="font-medium text-[#1a1a1a]/70">No stories shared yet</h4>
                      <p className="text-xs text-[#1a1a1a]/35 mt-1">Start by writing about an experience that shaped you.</p>
                    </div>
                    <Button variant="primary" size="sm" rightIcon={<PlusCircle className="w-4 h-4" />} onClick={() => router.push("/create")}>
                      Write your first story
                    </Button>
                  </div>
                )}
              </div>

              {/* Side panel */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-[#1a1a1a]/70 text-sm border-b border-[#1a1a1a]/6 pb-3">About your library</h3>
                  <GlassCard hoverEffect={false} className="p-6 rounded-2xl space-y-4 mt-3">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-300" />
                      <div>
                        <h4 className="text-xs font-medium text-[#1a1a1a]">Your stories matter</h4>
                        <p className="text-[10px] text-[#1a1a1a]/35 mt-0.5">{experiences.length} experiences in the library</p>
                      </div>
                    </div>
                    <div className="p-3 bg-[#1a1a1a]/3 rounded-xl border border-[#1a1a1a]/5 text-[10px] text-[#1a1a1a]/45 leading-relaxed font-light"
                         style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                      &ldquo;Every failure carries a lesson someone else needs to hear.&rdquo;
                    </div>
                  </GlassCard>
                </div>

                {/* Recent Searches */}
                <div className="space-y-4">
                  <h3 className="font-medium text-[#1a1a1a]/70 text-sm border-b border-[#1a1a1a]/6 pb-3">Recent Searches</h3>
                  {previousSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {previousSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => router.push(`/explore?q=${encodeURIComponent(search)}`)}
                          className="px-3.5 py-1.5 rounded-full border border-[#1a1a1a]/8 bg-white/40 text-[11px] text-[#1a1a1a]/55 font-medium hover:bg-white/75 hover:border-[#1a1a1a]/15 hover:text-[#1a1a1a]/85 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3 text-[#1a1a1a]/30" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#1a1a1a]/35 font-light pl-1">Your recent searches will appear here.</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* MY EXPERIENCES TAB */}
        {activeTab === "my-experiences" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a]/6 pb-4">
              <div>
                <h1
                  className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  My Stories
                </h1>
                <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">All the experiences you&apos;ve shared.</p>
              </div>
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => router.push("/create")}>
                New Story
              </Button>
            </div>

            {isLoadingMyExps && myExperiences.length === 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 rounded-xl bg-white/40 border border-[#1a1a1a]/6 animate-pulse" />
                ))}
              </div>
            ) : myExperiences.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myExperiences.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onEdit={handleEdit}
                    onDelete={handleDeleteTrigger}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/40 p-16 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4">
                <AlertCircle className="w-10 h-10 text-[#1a1a1a]/20 mx-auto" />
                <h4 className="font-medium text-lg text-[#1a1a1a]/70" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>No stories yet</h4>
                <p className="text-sm text-[#1a1a1a]/40 max-w-sm mx-auto leading-relaxed">
                  You haven&apos;t shared any experiences yet. Start by writing about something that shaped you.
                </p>
                <Button variant="primary" onClick={() => router.push("/create")}>
                  Write your first story
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === "recommendations" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1
                className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Recommended For You
              </h1>
              <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">
                Wisdom curated based on your searches, reading history, and saved interests.
              </p>
            </div>

            {/* Interest customization toggles */}
            <div className="bg-white/40 p-6 rounded-2xl border border-[#1a1a1a]/6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a]/55">Customize Your Interests</h3>
                <p className="text-[11px] text-[#1a1a1a]/35">Select topics you care about to personalize your library feed.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Lost", "Anxiety", "Motivation", "Self Doubt", "Resilience", "Confidence"].map((tag) => {
                  const isSelected = userInterests.includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleUserInterest(tag.toLowerCase())}
                      className={cn(
                        "px-4 py-2 rounded-full border text-xs font-medium transition-all duration-300 cursor-pointer",
                        isSelected
                          ? "bg-[#1a1a1a] border-[#1a1a1a] text-white"
                          : "border-[#1a1a1a]/10 bg-white/45 text-[#1a1a1a]/55 hover:bg-white/70 hover:border-[#1a1a1a]/20"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter and Sort options for recommendations */}
            <div className="bg-white/40 p-5 rounded-2xl border border-[#1a1a1a]/6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                
                {/* Sort controls */}
                <div className="space-y-2.5">
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#1a1a1a]/40">Order by</span>
                  <div className="flex bg-[#1a1a1a]/5 p-0.5 rounded-lg border border-[#1a1a1a]/6 w-fit">
                    {[
                      { label: "Best Match", value: "score" },
                      { label: "Latest", value: "latest" },
                      { label: "Oldest", value: "oldest" }
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setRecSortBy(item.value as any)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer text-[10px]",
                          recSortBy === item.value
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
                    value={recFilterType}
                    onChange={(e) => setRecFilterType(e.target.value)}
                    className="bg-white/60 border border-[#1a1a1a]/8 text-[#1a1a1a]/70 rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer focus:border-[#1a1a1a]/20 w-full sm:max-w-xs text-[11px]"
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
                    value={recFilterEmotion}
                    onChange={(e) => setRecFilterEmotion(e.target.value)}
                    className="bg-white/60 border border-[#1a1a1a]/8 text-[#1a1a1a]/70 rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer focus:border-[#1a1a1a]/20 w-full sm:max-w-xs text-[11px]"
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
            </div>

            {/* Recommended Feed */}
            <div className="space-y-6">
              <h3 className="font-medium text-[#1a1a1a]/70 text-sm border-b border-[#1a1a1a]/6 pb-3">Curated Stories</h3>
              {isLoadingRecs ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-xl bg-white/40 border border-[#1a1a1a]/6 animate-pulse" />
                  ))}
                </div>
              ) : filteredRecs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredRecs.map(({ experience, reason }) => (
                    <div key={experience.id} className="space-y-2.5">
                      {/* Reason indicator badge */}
                      <div className="flex items-center gap-1.5 pl-2 text-[10px] font-semibold text-[#1a1a1a]/45 uppercase tracking-wide">
                        <Sparkles className="w-3 h-3 text-[#1a1a1a]/40" />
                        <span>{reason}</span>
                      </div>
                      <ExperienceCard experience={experience} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/40 p-12 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4 max-w-md mx-auto">
                  <AlertCircle className="w-8 h-8 text-[#1a1a1a]/20 mx-auto" />
                  <div>
                    <h4 className="font-medium text-[#1a1a1a]/70">No matching recommendations</h4>
                    <p className="text-xs text-[#1a1a1a]/35 mt-1">Try resetting the filters or selecting different interests above to find matching stories.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SAVED EXPERIENCES TAB */}
        {activeTab === "saved-experiences" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1
                className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Saved Stories
              </h1>
              <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">Stories you bookmarked while exploring.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExperienceCard
                experience={{
                  id: "exp-3-saved",
                  title: "Left a high-paying FAANG job because I hated coding",
                  content: "On paper, I had it all. $250k salary, great perks, working on a famous team. But every single morning, I woke up with dread. I hated sitting in front of JIRA tickets all day. I felt guilty because others would kill for my job. I finally quit to become a product designer. My income halved initially, but my sleep, digestion, and creativity returned. Don't trap yourself in a golden cage just because of society's definitions of success.",
                  emotion_tags: ["career", "lost", "burnout", "growth"],
                  privacy: "Public",
                  user_id: "user-gamma",
                  author_name: "Sarah Chen",
                  created_at: "2026-03-20T14:45:00Z",
                  updated_at: "2026-03-20T14:45:00Z"
                }}
              />
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-2xl"
          >
            <div>
              <h1
                className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Settings
              </h1>
              <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">Update your profile details.</p>
            </div>

            <GlassCard hoverEffect={false} className="p-8 rounded-2xl space-y-6">
              <div className="space-y-4">
                {/* Account Type Tier (Extensible for Premium) */}
                <div className="p-4 rounded-xl bg-[#1a1a1a]/4 border border-[#1a1a1a]/6 flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <h4 className="font-medium text-[#1a1a1a]">Account Type</h4>
                    <p className="text-[10px] text-[#1a1a1a]/35">Your current subscription level.</p>
                  </div>
                  <div>
                    {user.tier === "premium" ? (
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#1a1a1a] text-white uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#1a1a1a]/10 text-[#1a1a1a]/70 uppercase tracking-wider">
                          Free Account
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={upgradeToPremium}
                          className="text-[10px] font-bold text-[#1a1a1a] hover:bg-[#1a1a1a]/5 px-3 py-1.5 border border-[#1a1a1a]/10 cursor-pointer"
                        >
                          Upgrade
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 outline-none text-[#1a1a1a] text-sm focus:border-[#1a1a1a]/20 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 outline-none text-[#1a1a1a] text-sm opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a]/6 flex items-center justify-end">
                <Button variant="primary" size="sm" onClick={() => alert("Profile saved (demo).")}>
                  Save changes
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Delete this story?"
        description="This action cannot be undone. The story will be permanently removed from your library."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isConfirmLoading={isDeleting}
        variant="danger"
      >
        {deleteTargetExp && (
          <div className="p-4 rounded-xl bg-[#1a1a1a]/3 border border-[#1a1a1a]/6 text-xs text-[#1a1a1a]/60 italic line-clamp-3">
            &ldquo;{deleteTargetExp.title}&rdquo;
          </div>
        )}
      </Modal>

    </div>
  );
}

function StatsCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="bg-white/40 p-5 rounded-xl border border-[#1a1a1a]/6 space-y-3">
      <div className="p-2 rounded-lg bg-[#1a1a1a]/4 w-fit">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-medium text-[#1a1a1a]/35 tracking-wider">{title}</p>
        <p className="text-2xl font-light text-[#1a1a1a] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
