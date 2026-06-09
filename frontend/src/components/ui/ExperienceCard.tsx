import React from "react";
import Link from "next/link";
import { Experience } from "@/types";
import { EmotionTag } from "./EmotionTag";
import { GlassCard } from "./GlassCard";
import { Heart, Globe, Ghost, Lock, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceCardProps {
  experience: Experience;
  score?: number; // Similarity score (between 0 and 1) for search results
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ExperienceCard({
  experience,
  score,
  onEdit,
  onDelete,
  className
}: ExperienceCardProps) {
  // Format Date to: "2 months ago" or "June 9, 2026"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Truncate story text for card excerpt
  const getExcerpt = (text: string, maxLength = 180) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Privacy Icons
  const getPrivacyIcon = () => {
    switch (experience.privacy) {
      case "Anonymous":
        return <span title="Anonymous Story"><Ghost className="w-3.5 h-3.5 text-rose-400" /></span>;
      case "Private":
        return <span title="Private Story"><Lock className="w-3.5 h-3.5 text-amber-400" /></span>;
      default:
        return <span title="Public Story"><Globe className="w-3.5 h-3.5 text-emerald-400" /></span>;
    }
  };

  return (
    <GlassCard
      className={cn("flex flex-col justify-between h-full", className)}
      glowColor={score && score > 0.7 ? "indigo" : "none"}
    >
      <div>
        {/* Top Info Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            {getPrivacyIcon()}
            <span>{experience.privacy}</span>
            <span>•</span>
            <span>{formatDate(experience.created_at)}</span>
          </div>

          {/* Similarity Match Score for Search Page */}
          {score !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
              <span>{Math.round(score * 100)}% Wisdom Match</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/experiences/${experience.id}`} className="group/title block">
          <h3 className="text-xl font-bold mb-3 text-foreground group-hover/title:text-indigo-400 transition-colors leading-snug">
            {experience.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-foreground/70 text-sm leading-relaxed mb-6">
          {getExcerpt(experience.content)}
        </p>
      </div>

      {/* Footer tags and actions */}
      <div>
        {/* Emotion tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {experience.emotion_tags.slice(0, 3).map((tag) => (
            <EmotionTag key={tag} tag={tag} />
          ))}
          {experience.emotion_tags.length > 3 && (
            <span className="text-xs text-foreground/40 self-center font-medium pl-1">
              +{experience.emotion_tags.length - 3} more
            </span>
          )}
        </div>

        {/* Author / Actions Row */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
              experience.privacy === "Anonymous"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            )}>
              {experience.privacy === "Anonymous" ? "?" : (experience.author_name || "U")[0]}
            </div>
            <span className="text-xs font-semibold text-foreground/60">
              {experience.privacy === "Anonymous" ? "Anonymous Preserver" : (experience.author_name || "Someone")}
            </span>
          </div>

          {/* Action buttons (only for Dashboard list) */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(experience.id)}
                  className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
                  title="Edit story"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(experience.id)}
                  className="p-1.5 rounded-lg text-foreground/40 hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
                  title="Delete story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
