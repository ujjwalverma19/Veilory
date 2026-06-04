"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation to connect to FastAPI backend
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-8 md:p-12 rounded-[2.5rem] w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-foreground/60">Log in to your Veilory sanctuary</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 pl-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-foreground"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 pl-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className={cn(
              "w-full group relative px-8 py-4 rounded-2xl font-bold text-background bg-foreground overflow-hidden",
              "hover:scale-[1.02] transition-all duration-300 shadow-xl"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
