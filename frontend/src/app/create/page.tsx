"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine, Send, Tag, Lock, Globe, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateExperience() {
  const [privacy, setPrivacy] = useState("Public");
  
  return (
    <div className="max-w-3xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <PenLine className="w-8 h-8 text-indigo-400" />
          Share Your Journey
        </h1>
        <p className="text-foreground/60">Your story could be exactly what someone else needs to hear today.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-8 md:p-10 rounded-[2.5rem]"
      >
        <form className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80 pl-2">Title</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-lg transition-all text-foreground"
              placeholder="e.g., Surviving my first major career failure"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80 pl-2">Your Experience</label>
            <textarea 
              rows={8}
              className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-base resize-none transition-all leading-relaxed text-foreground"
              placeholder="What happened? How did it make you feel? What did you learn?"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80 pl-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Emotion Tags
            </label>
            <input 
              type="text" 
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none transition-all text-foreground"
              placeholder="e.g., lost, heartbreak, failure (comma separated)"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <label className="text-sm font-semibold text-foreground/80 pl-2">Privacy Level</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PrivacyButton 
                active={privacy === "Public"} 
                onClick={() => setPrivacy("Public")}
                icon={<Globe className="w-5 h-5" />}
                title="Public"
                desc="Visible to everyone"
              />
              <PrivacyButton 
                active={privacy === "Anonymous"} 
                onClick={() => setPrivacy("Anonymous")}
                icon={<Ghost className="w-5 h-5" />}
                title="Anonymous"
                desc="Hidden identity"
              />
              <PrivacyButton 
                active={privacy === "Private"} 
                onClick={() => setPrivacy("Private")}
                icon={<Lock className="w-5 h-5" />}
                title="Private"
                desc="Just for you"
              />
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="button"
              className={cn(
                "w-full group relative px-8 py-5 rounded-2xl font-bold text-background bg-foreground overflow-hidden",
                "hover:scale-[1.02] transition-all duration-300 shadow-xl"
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                Publish Experience <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PrivacyButton({ active, onClick, icon, title, desc }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-4 rounded-2xl border transition-all text-center gap-2",
        active 
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" 
          : "border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10 hover:border-white/20"
      )}
    >
      {icon}
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs opacity-70 mt-1">{desc}</div>
      </div>
    </button>
  );
}
