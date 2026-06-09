import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: "indigo" | "purple" | "rose" | "emerald" | "none";
  borderGlow?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  glowColor = "none",
  borderGlow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[2rem] glass-panel p-8 overflow-hidden transition-all duration-300 border border-white/10",
        {
          "hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]": hoverEffect,
          "before:absolute before:inset-0 before:-z-10 before:rounded-[2rem] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500": borderGlow,
        },
        className
      )}
      {...props}
    >
      {/* Background glow effects */}
      {glowColor === "indigo" && (
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
      )}
      {glowColor === "purple" && (
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
      )}
      {glowColor === "rose" && (
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-rose-500/10 blur-[80px] pointer-events-none" />
      )}
      {glowColor === "emerald" && (
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
