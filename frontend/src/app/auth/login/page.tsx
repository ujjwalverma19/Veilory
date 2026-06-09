"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Simple validation matching backend password rule
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const success = await login(email, password);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel p-8 md:p-12 rounded-[2.5rem] w-full max-w-md relative overflow-hidden bg-slate-900/40 border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-foreground/60 text-sm">Enter your sanctuary login credentials</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{errorMsg}</span>
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold text-center"
          >
            Sanctuary entry approved. Relocating...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 pl-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-foreground/35">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4.5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none text-foreground text-sm"
                placeholder="founder@veilory.com"
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">Password</label>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-foreground/35">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4.5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none text-foreground text-sm"
                placeholder="••••••••"
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

          <Button 
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
            disabled={success}
            rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-foreground/60 font-semibold border-t border-white/5 pt-6">
          <p>
            New to the platform?{" "}
            <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Create a Sanctuary Account
            </Link>
          </p>
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-foreground/40 text-left font-normal leading-normal">
            💡 **Tip**: Enter any email and password of **at least 8 characters** to log in automatically.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
