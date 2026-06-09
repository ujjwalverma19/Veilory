"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  isConfirmLoading?: boolean;
  variant?: "primary" | "danger";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  isConfirmLoading = false,
  variant = "primary"
}: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] glass-panel border border-white/10 p-8 shadow-2xl bg-slate-900/90"
          >
            {/* Top gradient stripe */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5",
              variant === "danger" 
                ? "bg-gradient-to-r from-red-500 to-rose-500" 
                : "bg-gradient-to-r from-indigo-500 to-purple-500"
            )} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 rounded-full text-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
              {description && (
                <p className="text-foreground/60 text-sm leading-relaxed">{description}</p>
              )}
            </div>

            {/* Body Content */}
            <div className="mb-8">{children}</div>

            {/* Actions Footer */}
            {(onConfirm || confirmLabel) && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={isConfirmLoading}>
                  Cancel
                </Button>
                {onConfirm && (
                  <Button
                    variant={variant === "danger" ? "danger" : "primary"}
                    size="sm"
                    onClick={onConfirm}
                    isLoading={isConfirmLoading}
                  >
                    {confirmLabel || "Confirm"}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
