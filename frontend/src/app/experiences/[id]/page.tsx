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
  ArrowLeft, Sparkles, Ghost, Globe, Lock, Clock, Calendar, 
  User, Bookmark, Share2, Lightbulb, HeartPulse, CheckSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExperienceDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { experiences, user, isLoading } = useAuth();
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [relatedExperiences, setRelatedExperiences] = useState<Experience[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Retrieve requested story
    const foundExp = experiences.find((e) => e.id === id);
    if (!foundExp) {
      setErrorMsg("This experience story could not be found in the Veilory registry.");
      return;
    }

    // Verify privacy authorization
    if (foundExp.privacy === "Private" && (!user || foundExp.user_id !== user.id)) {
      setErrorMsg("This is a private reflection entry. Entry denied.");
      return;
    }

    setExperience(foundExp);

    // Compute AI Insights specific to this experience's text/tags
    const { insight } = simulateSearch(foundExp.title + " " + foundExp.emotion_tags.join(" "), experiences);
    setAiInsight(insight);

    // Filter related stories (share tags, exclude current one, must be public/anonymous)
    const related = experiences.filter((e) => {
      if (e.id === foundExp.id) return false;
      if (e.privacy === "Private") return false;
      // Must share at least one tag
      return e.emotion_tags.some((tag) => foundExp.emotion_tags.includes(tag));
    });
    setRelatedExperiences(related.slice(0, 2));

  }, [id, experiences, user, isLoading]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Coordinates copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500" />
      </div>
    );
  }

  if (errorMsg || !experience) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-foreground/50 leading-relaxed mt-2">{errorMsg || "Unavailable resource."}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => router.push("/explore")}>
          Return to Explore
        </Button>
      </div>
    );
  }

  // Format Date
  const formattedDate = new Date(experience.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="space-y-12">
      {/* Back button row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to exploration
        </button>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            leftIcon={<Bookmark className={cn("w-4 h-4", isSaved ? "fill-indigo-400 text-indigo-400" : "")} />} 
            onClick={() => setIsSaved(!isSaved)}
          >
            {isSaved ? "Saved" : "Save Insight"}
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
        
        {/* STORY CONTENT (Left/Col-2) */}
        <article className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            {/* Metadata tags */}
            <div className="flex items-center gap-2.5 text-xs text-foreground/50">
              <span className="flex items-center gap-1">
                {experience.privacy === "Public" && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                {experience.privacy === "Anonymous" && <Ghost className="w-3.5 h-3.5 text-rose-400" />}
                {experience.privacy === "Private" && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                {experience.privacy} entry
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-snug">
              {experience.title}
            </h1>

            {/* Author bar */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
                {experience.privacy === "Anonymous" ? "?" : (experience.author_name || "U")[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {experience.privacy === "Anonymous" ? "Anonymous Preserver" : (experience.author_name || "Someone")}
                </p>
                <p className="text-[10px] text-foreground/40 font-semibold uppercase tracking-wider">Story Contributor</p>
              </div>
            </div>
          </div>

          {/* Core Text Body */}
          <div className="p-8 md:p-10 rounded-[2.5rem] glass-panel border border-white/5 bg-slate-900/10 leading-relaxed text-foreground/90 text-base md:text-lg space-y-6 font-mono whitespace-pre-line">
            {experience.content}
          </div>

          {/* Emotion tags */}
          <div className="space-y-2.5 pl-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Preserved Emotions:</h4>
            <div className="flex flex-wrap gap-2">
              {experience.emotion_tags.map((tag) => (
                <EmotionTag key={tag} tag={tag} size="md" />
              ))}
            </div>
          </div>
        </article>

        {/* AI INSIGHTS BLOCK (Right/Col-1) */}
        <aside className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/45 border-b border-white/5 pb-3">AI Insight Synthesis</h3>

          {aiInsight ? (
            <GlassCard hoverEffect={false} className="p-6 rounded-[2rem] border-indigo-500/25 bg-indigo-500/5 space-y-6 relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <span>Interactive Reframing</span>
                </div>

                {/* Insight Summary */}
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  {aiInsight.summary}
                </p>

                {/* Cognitive Reframe */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1.5">
                  <h4 className="text-[10px] font-bold text-indigo-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Reframe Suggestion
                  </h4>
                  <p className="text-[11px] text-foreground/75 leading-relaxed italic">
                    "{aiInsight.reframing}"
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Action Plan
                  </h4>
                  <ul className="space-y-2 text-[11px] text-foreground/70 pl-0.5">
                    {aiInsight.growth_steps.map((step, idx) => (
                      <li key={idx} className="flex gap-2 items-start font-medium">
                        <span className="text-indigo-400 font-bold mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="p-6 rounded-[2rem] glass-panel border-white/5 text-center text-xs text-foreground/40">
              Generating insights...
            </div>
          )}
        </aside>

      </div>

      {/* RELATED EXPERIENCES */}
      {relatedExperiences.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-white/5">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-indigo-400" /> Similar Experiences Shared By Others
            </h3>
            <p className="text-foreground/50 text-xs mt-1">Read how other preservers processed matching emotional states.</p>
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
