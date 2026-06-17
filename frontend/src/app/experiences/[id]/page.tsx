"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Experience, AIInsight } from "@/types";
import { simulateSearch } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import {
  ArrowLeft, BookOpen, Ghost, Globe, Lock, Calendar,
  Bookmark, Share2, Lightbulb, Heart, CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { experienceService, recommendationService } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExperienceDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { experiences, user, isLoading, logViewedStory } = useAuth();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [relatedExperiences, setRelatedExperiences] = useState<Experience[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const exp = await experienceService.getById(id);
        setExperience(exp);
        setHelpfulCount(exp.helpful_count || 0);

        // Track user view in the backend if logged in
        if (user) {
          try {
            await recommendationService.logView(id);
          } catch (vErr) {
            console.warn("Failed to log view on backend:", vErr);
          }
        }
        logViewedStory(id);

        // Fetch related experiences from the context
        const related = experiences.filter((e) => {
          if (String(e.id) === String(exp.id)) return false;
          if (e.privacy === "Private" || e.privacy === "private") return false;
          return e.emotion_tags.some((tag) => exp.emotion_tags.includes(tag));
        });
        setRelatedExperiences(related.slice(0, 2));

        // Fallback or Mock AI Insight details
        const { insight } = simulateSearch(exp.title + " " + exp.emotion_tags.join(" "), experiences);
        setAiInsight(insight);

      } catch (err: any) {
        console.error("Error loading experience details:", err);
        setErrorMsg(err.message || "This experience could not be loaded.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [id, experiences, user]);

  const handleToggleHelpful = async () => {
    if (!user) {
      alert("Please sign in to vote stories as helpful.");
      return;
    }
    try {
      const updated = await experienceService.toggleHelpful(id);
      setIsHelpful(!isHelpful);
      setHelpfulCount(updated.helpful_count || 0);
    } catch (err) {
      console.error("Failed to toggle helpful:", err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (isLoading || isLoadingDetails) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a1a]/15 border-t-[#1a1a1a]/60" />
      </div>
    );
  }

  if (errorMsg || !experience) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-full bg-rose-50 text-rose-400 border border-rose-200 w-fit mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-[#1a1a1a]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Access Denied</h2>
          <p className="text-sm text-[#1a1a1a]/45 leading-relaxed mt-2">{errorMsg || "Unavailable."}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => router.push("/explore")}>
          Return to Explore
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(experience.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="space-y-12">
      {/* Back row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Heart className={cn("w-4 h-4", isHelpful ? "fill-rose-300 text-rose-300" : "text-[#1a1a1a]/60")} />}
            onClick={handleToggleHelpful}
          >
            {helpfulCount} Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Bookmark className={cn("w-4 h-4", isSaved ? "fill-[#1a1a1a]/60 text-[#1a1a1a]/60" : "")} />}
            onClick={() => setIsSaved(!isSaved)}
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Story Content */}
        <article className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            {/* Metadata */}
            <div className="flex items-center gap-2.5 text-xs text-[#1a1a1a]/35">
              <span className="flex items-center gap-1">
                {experience.privacy === "Public" && <Globe className="w-3.5 h-3.5" />}
                {experience.privacy === "Anonymous" && <Ghost className="w-3.5 h-3.5" />}
                {experience.privacy === "Private" && <Lock className="w-3.5 h-3.5" />}
                {experience.privacy}
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
              </span>
            </div>

            <h1
              className="text-2xl md:text-4xl font-light tracking-tight leading-snug text-[#1a1a1a]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {experience.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a]/8 flex items-center justify-center font-medium text-[#1a1a1a]/50 text-xs">
                {experience.privacy === "Anonymous" ? "?" : (experience.author_name || "U")[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">
                  {experience.privacy === "Anonymous" ? "Anonymous" : (experience.author_name || "Someone")}
                </p>
                <p className="text-[10px] text-[#1a1a1a]/30 font-medium">Contributor</p>
              </div>
            </div>
          </div>

          {/* Story body */}
          <div
            className="p-8 md:p-10 rounded-2xl bg-white/50 border border-[#1a1a1a]/6 leading-[1.9] text-[#1a1a1a]/75 text-base md:text-lg space-y-6 whitespace-pre-line font-light"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {experience.content}
          </div>

          {/* Tags */}
          <div className="space-y-2.5 pl-1">
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-[#1a1a1a]/30">Emotions:</h4>
            <div className="flex flex-wrap gap-2">
              {experience.emotion_tags.map((tag) => (
                <EmotionTag key={tag} tag={tag} size="md" />
              ))}
            </div>
          </div>
        </article>

        {/* Reflections sidebar */}
        <aside className="space-y-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-[#1a1a1a]/35 border-b border-[#1a1a1a]/6 pb-3">Reflections</h3>

          {aiInsight ? (
            <GlassCard hoverEffect={false} className="p-6 rounded-2xl space-y-5">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-[#1a1a1a]/50 font-medium text-sm">
                  <BookOpen className="w-4.5 h-4.5 shrink-0" />
                  <span>Perspectives</span>
                </div>

                {/* Summary */}
                <p className="text-xs text-[#1a1a1a]/60 leading-relaxed font-light">
                  {aiInsight.summary}
                </p>

                {/* Reframe */}
                <div className="p-4 rounded-xl bg-[#1a1a1a]/3 border border-[#1a1a1a]/5 space-y-1.5">
                  <h4 className="text-[10px] font-medium text-[#1a1a1a]/40 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> A different way to see this
                  </h4>
                  <p
                    className="text-[11px] text-[#1a1a1a]/55 leading-relaxed italic"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    &ldquo;{aiInsight.reframing}&rdquo;
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-2 pt-2 border-t border-[#1a1a1a]/5">
                  <h4 className="text-[10px] font-medium text-[#1a1a1a]/35 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Steps others found helpful
                  </h4>
                  <ul className="space-y-2 text-[11px] text-[#1a1a1a]/55 pl-0.5">
                    {aiInsight.growth_steps.map((step, idx) => (
                      <li key={idx} className="flex gap-2 items-start font-light">
                        <span className="text-[#1a1a1a]/30 mt-0.5">&bull;</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="p-6 rounded-2xl bg-white/40 border border-[#1a1a1a]/6 text-center text-xs text-[#1a1a1a]/30">
              Loading reflections...
            </div>
          )}
        </aside>

      </div>

      {/* Related */}
      {relatedExperiences.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-[#1a1a1a]/6">
          <div>
            <h3
              className="text-lg font-light flex items-center gap-2 text-[#1a1a1a]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <Heart className="w-4 h-4 text-rose-300" /> Similar stories from others
            </h3>
            <p className="text-[#1a1a1a]/35 text-xs mt-1 font-light">Experiences that share similar feelings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
