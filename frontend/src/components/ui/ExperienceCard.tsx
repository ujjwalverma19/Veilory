import React from "react";
import Link from "next/link";
import { Experience } from "@/types";
import { EmotionTag } from "./EmotionTag";
import { GlassCard } from "./GlassCard";
import { Globe, Ghost, Lock, Edit2, Trash2, Sparkles, Lightbulb, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ExperienceCardProps {
  experience: Experience;
  score?: number;
  explanation?: string;
  recommendationReason?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ExperienceCard({
  experience,
  score,
  explanation,
  recommendationReason,
  onEdit,
  onDelete,
  className
}: ExperienceCardProps) {
  const { logViewedStory } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getExcerpt = (text: string, maxLength = 160) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const getPrivacyIcon = () => {
    switch (experience.privacy) {
      case "Anonymous":
      case "anonymous":
        return <span title="Anonymous"><Ghost className="w-3 h-3 text-[#1a1a1a]/30" /></span>;
      case "Private":
      case "private":
        return <span title="Private"><Lock className="w-3 h-3 text-[#1a1a1a]/30" /></span>;
      default:
        return <span title="Public"><Globe className="w-3 h-3 text-[#1a1a1a]/30" /></span>;
    }
  };

  return (
    <GlassCard
      className={cn("flex flex-col justify-between h-full p-6", className)}
    >
      <div>
        {/* Top Header Row: Theme & Score/Date */}
        <div className="flex items-center justify-between mb-3.5 border-b border-[#1a1a1a]/4 pb-2.5">
          <div className="flex items-center gap-2">
            {getPrivacyIcon()}
            <span className="text-[9px] uppercase font-bold text-[#1a1a1a]/40 tracking-wider">
              {experience.main_theme || "Personal Growth"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {score !== undefined && (
              <span className="text-[9px] font-semibold tracking-wider uppercase bg-[#1a1a1a]/5 px-2 py-0.5 rounded border border-[#1a1a1a]/8 text-[#1a1a1a]/50">
                {Math.round(score * 100)}% match
              </span>
            )}
            <span className="text-[10px] text-[#1a1a1a]/30 font-medium">
              {formatDate(experience.created_at)}
            </span>
          </div>
        </div>

        {/* AI Recommendation Reason Banner (Phase 8) */}
        {recommendationReason && (
          <div className="mb-4 flex items-start gap-1.5 p-2.5 rounded-lg bg-[#1a1a1a]/3 border border-[#1a1a1a]/4 text-[10px] text-[#1a1a1a]/60 leading-relaxed font-light">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#1a1a1a]/70 block uppercase tracking-wider text-[8px] mb-0.5">AI Insights</span>
              {recommendationReason}
            </div>
          </div>
        )}

        {/* Title */}
        <Link 
          href={`/experiences/${experience.id}`} 
          onClick={() => logViewedStory(experience.id)}
          className="group/title block"
        >
          <h3
            className="text-base md:text-lg font-medium mb-2.5 text-[#1a1a1a] group-hover/title:text-[#1a1a1a]/70 transition-colors leading-snug"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {experience.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-[#1a1a1a]/55 text-xs md:text-sm leading-relaxed mb-4 font-light">
          {getExcerpt(experience.content)}
        </p>

        {/* Key Lesson Quote Box */}
        {experience.key_lesson && (
          <div className="pl-3 border-l border-emerald-500/30 text-xs italic text-[#1a1a1a]/60 leading-relaxed font-light my-3.5">
            &ldquo;{experience.key_lesson}&rdquo;
          </div>
        )}

        {/* Why This Story Matters Callout */}
        {experience.why_matters && (
          <div className="p-3 rounded-xl bg-amber-50/15 border border-amber-200/10 text-[11px] text-[#1a1a1a]/60 leading-relaxed font-light my-3.5">
            <span className="font-semibold text-amber-800/80 uppercase tracking-wide text-[8px] block mb-0.5">Why This Story Matters</span>
            {experience.why_matters}
          </div>
        )}

        {/* AI Search Match Explanation Callout */}
        {explanation && (
          <div className="p-3 rounded-xl bg-neutral-100/40 border border-neutral-200/25 text-[11px] text-[#1a1a1a]/60 leading-relaxed font-light my-3.5">
            <span className="font-semibold text-[#1a1a1a]/55 uppercase tracking-wide text-[8px] block mb-0.5">AI Match Explanation</span>
            {explanation}
          </div>
        )}
      </div>

      {/* Footer Row */}
      <div className="mt-4 pt-3.5 border-t border-[#1a1a1a]/5 flex flex-col gap-3">
        {/* Emotion Tags */}
        <div className="flex flex-wrap gap-1.5">
          {experience.emotion_tags.slice(0, 4).map((tag) => (
            <EmotionTag key={tag} tag={tag} size="sm" />
          ))}
          {experience.emotion_tags.length > 4 && (
            <span className="text-[10px] text-[#1a1a1a]/30 self-center font-medium pl-0.5">
              +{experience.emotion_tags.length - 4} more
            </span>
          )}
        </div>

        {/* Author Details and Actions */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium bg-[#1a1a1a]/8 text-[#1a1a1a]/50">
              {experience.privacy === "Anonymous" || experience.privacy === "anonymous" ? "?" : (experience.author_name || "U")[0]}
            </div>
            <span className="font-medium text-[#1a1a1a]/45">
              {experience.privacy === "Anonymous" || experience.privacy === "anonymous" ? "Anonymous" : (experience.author_name || "Someone")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[#1a1a1a]/30">
              {(experience.views_count !== undefined) ? experience.views_count : 12} views
            </span>
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 border-l border-[#1a1a1a]/6 pl-2.5">
                {onEdit && (
                  <button
                    onClick={() => onEdit(experience.id)}
                    className="p-1 rounded text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(experience.id)}
                    className="p-1 rounded text-[#1a1a1a]/30 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
