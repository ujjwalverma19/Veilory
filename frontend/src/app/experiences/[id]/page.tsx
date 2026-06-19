"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Experience, AIInsight } from "@/types";
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

        // Fetch related experiences from the backend
        try {
          const related = await experienceService.getRelated(id);
          setRelatedExperiences(related);
        } catch (rErr) {
          console.warn("Failed to fetch related stories from backend, using context fallback:", rErr);
          const fallback = experiences.filter((e) => {
            if (String(e.id) === String(exp.id)) return false;
            if (e.privacy === "Private" || e.privacy === "private") return false;
            return e.emotion_tags.some((tag) => exp.emotion_tags.includes(tag));
          });
          setRelatedExperiences(fallback.slice(0, 2));
        }

      } catch (err: any) {
        console.error("Error loading experience details:", err);
        setErrorMsg(err.message || "This experience could not be loaded.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [id, experiences, user]);

  // Helper to resolve reflection panel details (including fallbacks for legacy records)
  const getReflectionDetails = () => {
    if (!experience) return null;

    const theme = experience.main_theme || "Personal Growth";
    const confidence = experience.theme_confidence || 0.85;
    const whyMatters = experience.why_matters || "This story shows how small, daily reflections eventually lead to a shift in mindset.";
    const summary = experience.medium_summary || experience.content.slice(0, 180) + "...";
    const keyLesson = experience.key_lesson || "Progress is rarely linear; trust the compounding value of small steps.";
    const lessons = experience.lessons_learned && experience.lessons_learned.length > 0 
      ? experience.lessons_learned 
      : [
          "Embrace discomfort as a signal of learning.",
          "Value the journey and reflections as much as the outcome.",
          "Build small daily habits rather than chasing giant leaps."
        ];
      
    const initial = experience.emotion_initial || "Uncertainty";
    const catalyst = experience.emotion_catalyst || "Reflection";
    const outcome = experience.emotion_outcome || "Growth";

    return {
      theme,
      confidence,
      whyMatters,
      summary,
      keyLesson,
      lessons,
      initial,
      catalyst,
      outcome
    };
  };

  const reflection = getReflectionDetails();

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
        {/* Story Content */}
        <article className="lg:col-span-2 space-y-10">
          <div className="space-y-5">
            {/* Metadata */}
            <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-wider text-[#1a1a1a]/35">
              <span className="flex items-center gap-1.5">
                {experience.privacy === "Public" && <Globe className="w-3.5 h-3.5" />}
                {experience.privacy === "Anonymous" && <Ghost className="w-3.5 h-3.5" />}
                {experience.privacy === "Private" && <Lock className="w-3.5 h-3.5" />}
                {experience.privacy}
              </span>
              <span>&middot;</span>
              <span>{formattedDate}</span>
              <span>&middot;</span>
              <span>
                {Math.max(1, Math.ceil(experience.content.split(/\s+/).filter(Boolean).length / 200))} min read
              </span>
            </div>

            <h1
              className="text-3xl md:text-5xl font-light tracking-tight leading-tight text-[#1a1a1a]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {experience.title}
            </h1>

            {/* Author Block */}
            <div className="flex items-center gap-3.5 pt-3 border-b border-[#1a1a1a]/5 pb-6">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a]/6 flex items-center justify-center font-semibold text-[#1a1a1a]/40 text-sm">
                {experience.privacy === "Anonymous" ? "?" : (experience.author_name || "U")[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {experience.privacy === "Anonymous" ? "Anonymous Contributor" : (experience.author_name || "Someone")}
                </p>
                <p className="text-[10px] text-[#1a1a1a]/30 font-medium uppercase tracking-wider">Veilory Member</p>
              </div>
            </div>
          </div>

          {/* Story body (Journal/Medium style) */}
          <div
            className="max-w-2xl text-[#1a1a1a]/85 text-lg md:text-xl leading-[2.1] space-y-8 whitespace-pre-line font-light select-text pr-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {experience.content}
          </div>

          {/* Tags */}
          <div className="space-y-3 pt-6 border-t border-[#1a1a1a]/5">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#1a1a1a]/30">Related Emotions</h4>
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

          {reflection ? (
            <GlassCard hoverEffect={false} className="p-6 rounded-2xl space-y-5">
              <div className="space-y-4">
                {/* Theme & Confidence (Feature 1 & Refinement 3) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1a1a1a]/5 pb-3">
                  <div className="flex items-center gap-2 text-[#1a1a1a]/70 font-semibold text-sm">
                    <BookOpen className="w-4 h-4 text-[#1a1a1a]/60 shrink-0" />
                    <span>{reflection.theme}</span>
                  </div>
                  <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60 w-fit">
                    Theme Confidence: {Math.round(reflection.confidence * 100)}%
                  </span>
                </div>

                {/* Detected Emotions (Feature 1) */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-semibold uppercase tracking-wider text-[#1a1a1a]/35">Detected Emotions</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1a1a1a]/5 border border-[#1a1a1a]/8 text-[#1a1a1a]/70 capitalize">
                      {experience.primary_emotion || "growth"}
                    </span>
                    {(experience.secondary_emotions || []).map((emo) => (
                      <span key={emo} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1a1a1a]/5 border border-[#1a1a1a]/8 text-[#1a1a1a]/55 capitalize">
                        {emo}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summary (Feature 1 & Feature 2) */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-semibold uppercase tracking-wider text-[#1a1a1a]/35">Summary</h4>
                  <p className="text-xs text-[#1a1a1a]/60 leading-relaxed font-light">
                    {reflection.summary}
                  </p>
                </div>

                {/* Why This Story Matters (Refinement 4) */}
                <div className="p-4 rounded-xl bg-amber-50/20 border border-amber-200/40 space-y-1.5">
                  <h4 className="text-[9px] font-semibold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-500" /> Why This Story Matters
                  </h4>
                  <p className="text-xs text-amber-900/80 leading-relaxed font-light">
                    {reflection.whyMatters}
                  </p>
                </div>

                {/* Key Lesson (Feature 1) */}
                <div className="p-4 rounded-xl bg-emerald-50/20 border border-emerald-200/40 space-y-1.5">
                  <h4 className="text-[9px] font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-500" /> Key Lesson
                  </h4>
                  <p
                    className="text-xs text-emerald-900/80 leading-relaxed italic"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    &ldquo;{reflection.keyLesson}&rdquo;
                  </p>
                </div>

                {/* Lessons Learned (Feature 3) */}
                <div className="space-y-2 pt-2 border-t border-[#1a1a1a]/5">
                  <h4 className="text-[9px] font-semibold text-[#1a1a1a]/35 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#1a1a1a]/40" /> Lessons Learned
                  </h4>
                  <ul className="space-y-2 text-[11px] text-[#1a1a1a]/55 pl-0.5">
                    {reflection.lessons.map((step, idx) => (
                      <li key={idx} className="flex gap-2 items-start font-light">
                        <span className="text-[#1a1a1a]/30 mt-0.5">&bull;</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emotional Journey (Feature 4 & Refinement 1) */}
                <div className="space-y-3 pt-2 border-t border-[#1a1a1a]/5">
                  <h4 className="text-[9px] font-semibold text-[#1a1a1a]/35 uppercase tracking-wider">
                    Emotional Journey
                  </h4>
                  <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#1a1a1a]/3 border border-[#1a1a1a]/4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-semibold text-[#1a1a1a]/45 tracking-wider">Initial State</span>
                      <span className="text-xs text-rose-600 font-medium capitalize">{reflection.initial}</span>
                    </div>
                    <div className="text-center text-[#1a1a1a]/25 text-[10px] leading-none">↓</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-semibold text-[#1a1a1a]/45 tracking-wider">Catalyst</span>
                      <span className="text-xs text-amber-600 font-medium capitalize">{reflection.catalyst}</span>
                    </div>
                    <div className="text-center text-[#1a1a1a]/25 text-[10px] leading-none">↓</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-semibold text-[#1a1a1a]/45 tracking-wider">Outcome</span>
                      <span className="text-xs text-emerald-600 font-medium capitalize">{reflection.outcome}</span>
                    </div>
                  </div>
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
