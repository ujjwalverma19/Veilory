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
          "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          {
            "bg-[#1a1a1a] text-white hover:bg-[#2d2d2d]":
              variant === "primary",
            "bg-white/50 border border-[#1a1a1a]/10 text-[#1a1a1a]/70 hover:bg-white/70 hover:border-[#1a1a1a]/18":
              variant === "secondary",
            "bg-white/30 border border-[#1a1a1a]/6 text-[#1a1a1a]/70 hover:bg-white/50":
              variant === "glass",
            "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100":
              variant === "danger",
            "text-[#1a1a1a]/50 hover:text-[#1a1a1a]/80 hover:bg-[#1a1a1a]/5":
              variant === "ghost",
          },
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
