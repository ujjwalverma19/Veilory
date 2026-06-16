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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#faf8f5]/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-[#1a1a1a]/10 p-8 shadow-xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 rounded-full text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{title}</h2>
              {description && (
                <p className="text-[#1a1a1a]/50 text-sm leading-relaxed">{description}</p>
              )}
            </div>

            {/* Body */}
            <div className="mb-8">{children}</div>

            {/* Actions */}
            {(onConfirm || confirmLabel) && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a1a1a]/8">
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
