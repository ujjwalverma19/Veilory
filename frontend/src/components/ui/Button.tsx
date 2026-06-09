import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          // Variants
          {
            "bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_35px_rgba(255,255,255,0.2)]":
              variant === "primary",
            "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20":
              variant === "secondary",
            "glass-panel text-foreground hover:bg-white/5 hover:border-white/20 shadow-inner":
              variant === "glass",
            "bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30":
              variant === "danger",
            "text-foreground/60 hover:text-foreground hover:bg-white/5":
              variant === "ghost",
          },
          // Sizes
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
