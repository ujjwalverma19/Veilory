"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { X, Sparkles, UserPlus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

export function SearchLimitModal() {
  const router = useRouter();
  const {
    showLimitModal,
    setShowLimitModal,
    limitModalType,
    upgradeToPremium
  } = useAuth();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  if (!showLimitModal || !limitModalType) return null;

  const handleClose = () => {
    setShowLimitModal(false);
    // Reset state after transition completes
    setTimeout(() => {
      setUpgradeSuccess(false);
      setIsUpgrading(false);
    }, 400);
  };

  const handleSignupRedirect = () => {
    handleClose();
    router.push("/auth/signup");
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate networking
    await upgradeToPremium();
    setIsUpgrading(false);
    setUpgradeSuccess(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#faf8f5]/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-[#1a1a1a]/10 p-8 shadow-xl text-center"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 p-1.5 rounded-full text-[#1a1a1a]/25 hover:text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {limitModalType === "guest" ? (
            /* GUEST MODE */
            <div className="space-y-6 py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center text-[#1a1a1a]/60">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h3
                  className="text-2xl font-light text-[#0a0a0a]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Continue Exploring Human Experiences
                </h3>
                <p className="text-xs text-[#1a1a1a]/55 leading-relaxed max-w-xs mx-auto">
                  You&apos;ve reached today&apos;s search limit. Create a free account to continue discovering stories from people who have walked similar paths.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  onClick={handleSignupRedirect}
                  className="w-full justify-center"
                >
                  Create Free Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="w-full justify-center text-[#1a1a1a]/45"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          ) : (
            /* LOGGED IN USER MODE */
            <div className="space-y-6 py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center text-[#1a1a1a]/60">
                {upgradeSuccess ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#1a1a1a]/60" />
                )}
              </div>

              {upgradeSuccess ? (
                <div className="space-y-3 animate-fade-in">
                  <h3
                    className="text-2xl font-light text-[#0a0a0a]"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Welcome to Premium
                  </h3>
                  <p className="text-xs text-[#1a1a1a]/55 leading-relaxed max-w-xs mx-auto">
                    Your account has been upgraded. You now have unlimited searches, advanced AI reflections, and personalized recommendations.
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      onClick={handleClose}
                      className="w-full justify-center"
                    >
                      Start Exploring
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3
                    className="text-2xl font-light text-[#0a0a0a]"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Unlock Unlimited Exploration
                  </h3>
                  <p className="text-xs text-[#1a1a1a]/55 leading-relaxed max-w-xs mx-auto">
                    Upgrade to Premium for unlimited searches, advanced AI insights, and personalized recommendations.
                  </p>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleUpgrade}
                      isLoading={isUpgrading}
                      className="w-full justify-center gap-1.5"
                    >
                      Activate Premium Preview
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      disabled={isUpgrading}
                      className="w-full justify-center text-[#1a1a1a]/45"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
