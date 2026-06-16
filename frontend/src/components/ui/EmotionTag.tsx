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
        isSelected
          ? "bg-[#1a1a1a]/10 border-[#1a1a1a]/20 text-[#1a1a1a]/80"
          : "bg-[#1a1a1a]/4 border-[#1a1a1a]/8 text-[#1a1a1a]/50 hover:bg-[#1a1a1a]/8 hover:border-[#1a1a1a]/15",
        className
      )}
    >
      <span>#{tag}</span>
      {count !== undefined && (
        <span className="opacity-50 text-[10px] ml-0.5 bg-[#1a1a1a]/5 rounded-full px-1.5 py-0.5">
          {count}
        </span>
      )}
    </button>
  );
}
