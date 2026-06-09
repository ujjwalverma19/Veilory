"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PrivacyLevel, Experience } from "@/types";
import { Button } from "@/components/ui/Button";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { PenLine, Send, Tag, Lock, Globe, Ghost, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Sub-component that consumes searchParams
function CreateExperienceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  
  const { experiences, addExperience, updateExperience, isAuthenticated, isLoading } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [privacy, setPrivacy] = useState<PrivacyLevel>("Public");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Authenticate user check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load experience if in edit mode
  useEffect(() => {
    if (editId) {
      const exp = experiences.find((e) => e.id === editId);
      if (exp) {
        setIsEditMode(true);
        setTitle(exp.title);
        setContent(exp.content);
        setTagsInput(exp.emotion_tags.join(", "));
        setPrivacy(exp.privacy);
      } else {
        setErrorMsg("The requested experience was not found in the registry.");
      }
    }
  }, [editId, experiences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and story content cannot be left blank.");
      return;
    }

    const processedTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);
    try {
      if (isEditMode && editId) {
        await updateExperience(editId, title.trim(), content.trim(), processedTags, privacy);
      } else {
        await addExperience(title.trim(), content.trim(), processedTags, privacy);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to catalog experience.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Back to dashboard */}
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <PenLine className="w-7 h-7 text-indigo-400" />
          {isEditMode ? "Amend Chapter" : "Preserve New Chapter"}
        </h1>
        <p className="text-foreground/50 text-sm mt-1">
          {isEditMode 
            ? "Refine your entry to improve accuracy and learning metrics." 
            : "Write down a failure, mistake, heartbreak, or growth story. Help others find wisdom."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Title Field */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/75 pl-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-lg transition-all text-foreground font-semibold placeholder:text-foreground/20"
            placeholder="e.g., My startup failed after 2 years of building"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Story Content Area */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/75 pl-1">The Story (Distraction-Free)</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-base resize-none transition-all leading-relaxed text-foreground placeholder:text-foreground/20 font-mono"
            placeholder="Write your story. What happened? How did it make you feel? What did you learn?"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Emotion Tags */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pl-1">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/75 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Emotion Tags
            </label>
            <span className="text-[10px] text-foreground/40 font-medium">Separated by commas</span>
          </div>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none transition-all text-foreground text-sm placeholder:text-foreground/20"
            placeholder="lost, startup, failure, lessons"
            disabled={isSubmitting}
          />
          {/* Real-time Tag Preview */}
          {tagsInput && (
            <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
              {tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).map((t, idx) => (
                <EmotionTag key={idx} tag={t} />
              ))}
            </div>
          )}
        </div>

        {/* Privacy Selector */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/75 pl-1">Sanctuary Privacy Level</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PrivacyButton
              active={privacy === "Public"}
              onClick={() => setPrivacy("Public")}
              icon={<Globe className="w-4 h-4" />}
              title="Public"
              desc="Visible to all explorers"
            />
            <PrivacyButton
              active={privacy === "Anonymous"}
              onClick={() => setPrivacy("Anonymous")}
              icon={<Ghost className="w-4 h-4" />}
              title="Anonymous"
              desc="Hide author identity details"
            />
            <PrivacyButton
              active={privacy === "Private"}
              onClick={() => setPrivacy("Private")}
              icon={<Lock className="w-4 h-4" />}
              title="Private"
              desc="Strictly locked for self reflection"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4.5 rounded-2xl"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            {isEditMode ? "Apply Amendments" : "Catalog to Sanctuary"}
          </Button>
        </div>

      </form>
    </div>
  );
}

// Reusable privacy selection button
function PrivacyButton({
  active,
  onClick,
  icon,
  title,
  desc
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4.5 rounded-2xl border transition-all text-center gap-1.5 cursor-pointer select-none",
        active
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
          : "border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10 hover:border-white/20"
      )}
    >
      {icon}
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-[10px] opacity-75 mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

export default function CreateExperience() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500" />
      </div>
    }>
      <CreateExperienceForm />
    </Suspense>
  );
}
