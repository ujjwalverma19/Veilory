"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
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
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const success = await signup(name, email, password);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel p-8 md:p-12 rounded-[2.5rem] w-full max-w-md relative overflow-hidden bg-slate-900/40 border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Account</h1>
          <p className="text-foreground/60 text-sm">Open a sanctuary to preserve your wisdom</p>
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
            Account created. Preparing your dashboard...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 pl-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-foreground/35">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4.5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none text-foreground text-sm"
                placeholder="Jane Doe"
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

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
                className="w-full pl-12 pr-4.5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none text-foreground text-sm"
                placeholder="you@example.com"
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 pl-1">Sanctuary Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-foreground/35">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4.5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none text-foreground text-sm"
                placeholder="Min. 8 characters"
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
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-foreground/60 font-semibold border-t border-white/5 pt-6">
          <p>
            Already registered?{" "}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
