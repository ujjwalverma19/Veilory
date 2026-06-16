"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
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
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const result = await login(email, password);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl w-full max-w-md border border-[#1a1a1a]/8"
      >
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-light tracking-tight mb-2 text-[#1a1a1a]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Welcome back
          </h1>
          <p className="text-[#1a1a1a]/40 text-sm font-light">Sign in to access your library</p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center"
          >
            Signed in successfully. Redirecting...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#1a1a1a]/25">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 focus:border-[#1a1a1a]/20 transition-all outline-none text-[#1a1a1a] text-sm placeholder:text-[#1a1a1a]/20"
                placeholder="your@email.com"
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50">Password</label>
              <a href="#" className="text-xs text-[#1a1a1a]/35 hover:text-[#1a1a1a]/60 font-medium transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#1a1a1a]/25">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 focus:border-[#1a1a1a]/20 transition-all outline-none text-[#1a1a1a] text-sm"
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

        <div className="mt-8 text-center text-xs text-[#1a1a1a]/40 font-medium border-t border-[#1a1a1a]/6 pt-6">
          <p>
            New here?{" "}
            <Link href="/auth/signup" className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors underline underline-offset-2">
              Create an account
            </Link>
          </p>
          <div className="mt-4 p-3 bg-[#1a1a1a]/3 rounded-xl border border-[#1a1a1a]/5 text-[10px] text-[#1a1a1a]/30 text-left font-light leading-relaxed">
            Enter any email and a password of at least 8 characters to sign in.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
