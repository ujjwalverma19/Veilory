import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: string;
  borderGlow?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-[#faf8f5]/60 p-8 overflow-hidden transition-all duration-300 border border-[#1a1a1a]/8",
        {
          "hover:-translate-y-1 hover:bg-[#faf8f5]/80 hover:border-[#1a1a1a]/14 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]": hoverEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
