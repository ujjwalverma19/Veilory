"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto mt-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border border-white/20 shadow-xl">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-foreground/80">
            The World's First Emotional Experience Engine
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Don't let your <br/>
          <span className="gradient-text">life lessons</span> fade away.
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Veilory is an AI-powered sanctuary for human experiences. Search by emotion, 
          share your journey, and find wisdom from others who have walked the same path.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/explore" className={cn(
            "group relative px-8 py-4 rounded-full font-semibold text-background bg-foreground overflow-hidden",
            "hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          )}>
            <span className="relative z-10 flex items-center gap-2">
              Start Exploring <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="/auth/signup" className={cn(
            "px-8 py-4 rounded-full font-semibold text-foreground glass-panel",
            "hover:bg-white/10 transition-colors"
          )}>
            Share Your Story
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto"
      >
        <FeatureCard 
          icon={<Brain className="w-8 h-8 text-indigo-400" />}
          title="Semantic Search"
          description="Don't search for keywords. Search for how you feel. Our AI finds the most emotionally relevant stories."
        />
        <FeatureCard 
          icon={<Sparkles className="w-8 h-8 text-purple-400" />}
          title="AI Insights"
          description="Get personalized insights generated from the collective wisdom of thousands of human experiences."
        />
        <FeatureCard 
          icon={<Shield className="w-8 h-8 text-emerald-400" />}
          title="Safe & Private"
          description="Share your journey publicly, completely anonymously, or keep it private just for your own reflection."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group">
      <div className="p-4 rounded-2xl bg-white/5 w-fit mb-6 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-foreground/60 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
