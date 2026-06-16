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
        "relative rounded-2xl bg-white/40 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 border border-[#1a1a1a]/6",
        {
          "hover:-translate-y-1 hover:bg-white/60 hover:border-[#1a1a1a]/12 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]": hoverEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
