import React from "react";
import Link from "next/link";
import { Experience } from "@/types";
import { EmotionTag } from "./EmotionTag";
import { GlassCard } from "./GlassCard";
import { Globe, Ghost, Lock, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ExperienceCardProps {
  experience: Experience;
  score?: number;
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
  const { logViewedStory } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getExcerpt = (text: string, maxLength = 180) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const getPrivacyIcon = () => {
    switch (experience.privacy) {
      case "Anonymous":
        return <span title="Anonymous"><Ghost className="w-3.5 h-3.5 text-[#1a1a1a]/30" /></span>;
      case "Private":
        return <span title="Private"><Lock className="w-3.5 h-3.5 text-[#1a1a1a]/30" /></span>;
      default:
        return <span title="Public"><Globe className="w-3.5 h-3.5 text-[#1a1a1a]/30" /></span>;
    }
  };

  const getMockMetrics = () => {
    const seed = experience.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const readers = (seed % 140) + 15;
    const helpful = Math.max(1, Math.round(readers * (0.2 + (seed % 20) / 100)));
    return { readers, helpful };
  };

  const { readers, helpful } = getMockMetrics();

  return (
    <GlassCard
      className={cn("flex flex-col justify-between h-full", className)}
    >
      <div>
        {/* Top Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-[#1a1a1a]/40">
            {getPrivacyIcon()}
            <span>{experience.privacy}</span>
            <span>&middot;</span>
            <span>{formatDate(experience.created_at)}</span>
          </div>

          {score !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase bg-[#1a1a1a]/5 border border-[#1a1a1a]/8 text-[#1a1a1a]/50">
              <span>{Math.round(score * 100)}% match</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link 
          href={`/experiences/${experience.id}`} 
          onClick={() => logViewedStory(experience.id)}
          className="group/title block"
        >
          <h3
            className="text-lg font-medium mb-3 text-[#1a1a1a] group-hover/title:text-[#1a1a1a]/70 transition-colors leading-snug"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {experience.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-[#1a1a1a]/55 text-sm leading-relaxed mb-6">
          {getExcerpt(experience.content)}
        </p>
      </div>

      {/* Footer */}
      <div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {experience.emotion_tags.slice(0, 3).map((tag) => (
            <EmotionTag key={tag} tag={tag} />
          ))}
          {experience.emotion_tags.length > 3 && (
            <span className="text-xs text-[#1a1a1a]/30 self-center font-medium pl-1">
              +{experience.emotion_tags.length - 3} more
            </span>
          )}
        </div>

        {/* Non-social Metrics */}
        <div className="flex items-center gap-3 text-[11px] text-[#1a1a1a]/35 mb-5 pl-1.5 font-light">
          <span>{readers} read</span>
          <span className="text-[#1a1a1a]/20">&middot;</span>
          <span>{helpful} found helpful</span>
        </div>

        {/* Author / Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]/6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium bg-[#1a1a1a]/8 text-[#1a1a1a]/50">
              {experience.privacy === "Anonymous" ? "?" : (experience.author_name || "U")[0]}
            </div>
            <span className="text-xs font-medium text-[#1a1a1a]/45">
              {experience.privacy === "Anonymous" ? "Anonymous" : (experience.author_name || "Someone")}
            </span>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(experience.id)}
                  className="p-1.5 rounded-lg text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(experience.id)}
                  className="p-1.5 rounded-lg text-[#1a1a1a]/30 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete"
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
