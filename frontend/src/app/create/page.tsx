"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PrivacyLevel } from "@/types";
import { Button } from "@/components/ui/Button";
import { EmotionTag } from "@/components/ui/EmotionTag";
import { PenLine, Send, Tag, Lock, Globe, Ghost, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

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
        setErrorMsg("The requested experience was not found.");
      }
    }
  }, [editId, experiences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and story content are required.");
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save experience.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-light tracking-tight text-[#1a1a1a] flex items-center gap-3"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <PenLine className="w-5 h-5 text-[#1a1a1a]/35" />
          {isEditMode ? "Edit your story" : "Share your experience"}
        </h1>
        <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">
          {isEditMode
            ? "Update your experience to refine the details."
            : "Write about a failure, lesson, heartbreak, or growth moment. Help others who walk a similar path."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Title */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white/60 border border-[#1a1a1a]/8 focus:border-[#1a1a1a]/20 outline-none text-lg transition-all text-[#1a1a1a] font-normal placeholder:text-[#1a1a1a]/20"
            placeholder="e.g., My startup failed after 2 years of building"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Story */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Your story</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-6 py-5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 focus:border-[#1a1a1a]/20 outline-none text-base resize-none transition-all leading-relaxed text-[#1a1a1a] placeholder:text-[#1a1a1a]/20 font-light"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            placeholder="Write your story. What happened? How did it make you feel? What did you learn?"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Tags */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pl-1">
            <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Emotion Tags
            </label>
            <span className="text-[10px] text-[#1a1a1a]/30 font-medium">Separated by commas</span>
          </div>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white/60 border border-[#1a1a1a]/8 focus:border-[#1a1a1a]/20 outline-none transition-all text-[#1a1a1a] text-sm placeholder:text-[#1a1a1a]/20"
            placeholder="lost, startup, failure, lessons"
            disabled={isSubmitting}
          />
          {tagsInput && (
            <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
              {tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).map((t, idx) => (
                <EmotionTag key={idx} tag={t} />
              ))}
            </div>
          )}
        </div>

        {/* Privacy */}
        <div className="space-y-3 pt-4 border-t border-[#1a1a1a]/6">
          <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Privacy</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PrivacyButton
              active={privacy === "Public"}
              onClick={() => setPrivacy("Public")}
              icon={<Globe className="w-4 h-4" />}
              title="Public"
              desc="Visible to everyone"
            />
            <PrivacyButton
              active={privacy === "Anonymous"}
              onClick={() => setPrivacy("Anonymous")}
              icon={<Ghost className="w-4 h-4" />}
              title="Anonymous"
              desc="Hide your identity"
            />
            <PrivacyButton
              active={privacy === "Private"}
              onClick={() => setPrivacy("Private")}
              icon={<Lock className="w-4 h-4" />}
              title="Private"
              desc="Only you can see this"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4.5 rounded-xl"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            {isEditMode ? "Save changes" : "Share your story"}
          </Button>
        </div>

      </form>
    </div>
  );
}

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
        "flex flex-col items-center justify-center p-4.5 rounded-xl border transition-all text-center gap-1.5 cursor-pointer select-none",
        active
          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
          : "border-[#1a1a1a]/8 bg-white/50 text-[#1a1a1a]/50 hover:bg-white/70 hover:border-[#1a1a1a]/15"
      )}
    >
      {icon}
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[10px] opacity-60 mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

export default function CreateExperience() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a1a]/15 border-t-[#1a1a1a]/60" />
      </div>
    }>
      <CreateExperienceForm />
    </Suspense>
  );
}
