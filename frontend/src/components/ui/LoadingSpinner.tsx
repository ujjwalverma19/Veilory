import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-white/10 border-t-indigo-400",
          {
            "w-6 h-6 border-2": size === "sm",
            "w-12 h-12 border-3": size === "md",
            "w-16 h-16 border-4": size === "lg",
          }
        )}
      />
      <span className="text-sm font-medium text-foreground/40 animate-pulse">
        Retrieving wisdom...
      </span>
    </div>
  );
}
