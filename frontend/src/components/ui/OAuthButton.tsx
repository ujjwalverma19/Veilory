import React from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface OAuthButtonProps {
  provider: "google" | "apple";
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OAuthButton({ provider, isLoading, onClick, className }: OAuthButtonProps) {
  // Hide Apple UI until credentials exist / enabled via config
  const enableApple = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "true";
  
  if (provider === "apple" && !enableApple) {
    return null;
  }

  const getProviderConfig = () => {
    switch (provider) {
      case "google":
        return {
          name: "Google",
          styles: "bg-white border border-[#1a1a1a]/8 hover:bg-[#fafafa] text-[#1a1a1a]/70 hover:border-[#1a1a1a]/15 shadow-sm active:scale-95",
          icon: (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.328 0-6.027-2.7-6.027-6.028s2.7-6.028 6.028-6.028c1.5 0 2.87.55 3.93 1.455l3.076-3.075C19.123 2.13 15.938 1 12.241 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.48 0 10.748-4.536 10.748-10.95 0-.74-.08-1.3-.22-1.89H12.24Z"
              />
            </svg>
          ),
        };
      case "apple":
        return {
          name: "Apple",
          styles: "bg-black hover:bg-black/90 text-white border border-transparent shadow-md active:scale-95",
          icon: (
            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39Z" />
            </svg>
          ),
        };
    }
  };

  const config = getProviderConfig();

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      isLoading={isLoading}
      className={cn(
        "w-full flex items-center justify-center font-normal text-sm py-3 rounded-xl transition-all duration-300",
        config.styles,
        className
      )}
    >
      {!isLoading && config.icon}
      Continue with {config.name}
    </Button>
  );
}
