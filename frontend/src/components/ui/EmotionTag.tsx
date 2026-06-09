import React from "react";
import { cn } from "@/lib/utils";

interface EmotionTagProps {
  tag: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function EmotionTag({
  tag,
  count,
  isSelected = false,
  onClick,
  className,
  size = "sm"
}: EmotionTagProps) {
  // Map tags to tailored colors
  const getColorStyles = (emotion: string) => {
    const term = emotion.toLowerCase().trim();
    if (term.includes("lost") || term.includes("career")) {
      return isSelected
        ? "bg-blue-500/35 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30";
    }
    if (term.includes("fail") || term.includes("academic")) {
      return isSelected
        ? "bg-purple-500/35 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        : "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/30";
    }
    if (term.includes("heart") || term.includes("relation") || term.includes("sad")) {
      return isSelected
        ? "bg-rose-500/35 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
        : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30";
    }
    if (term.includes("burn") || term.includes("stress")) {
      return isSelected
        ? "bg-amber-500/35 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/30";
    }
    if (term.includes("anxiet") || term.includes("fear")) {
      return isSelected
        ? "bg-teal-500/35 border-teal-400 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
        : "bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/30";
    }
    if (term.includes("grief") || term.includes("lesson")) {
      return isSelected
        ? "bg-violet-500/35 border-violet-400 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/30";
    }

    // Default neutral color style
    return isSelected
      ? "bg-white/20 border-white/40 text-foreground"
      : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10 hover:border-white/20";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all select-none",
        onClick ? "cursor-pointer active:scale-95" : "cursor-default",
        {
          "px-2.5 py-0.5 text-xs": size === "sm",
          "px-4 py-1.5 text-sm": size === "md",
        },
        getColorStyles(tag),
        className
      )}
    >
      <span>#{tag}</span>
      {count !== undefined && (
        <span className="opacity-60 text-[10px] ml-0.5 bg-white/10 rounded-full px-1.5 py-0.2">
          {count}
        </span>
      )}
    </button>
  );
}
