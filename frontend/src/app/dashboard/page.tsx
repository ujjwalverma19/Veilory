"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/shared/Sidebar";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { 
  Heart, Globe, Ghost, Lock, Clock, AlertCircle, PlusCircle, 
  Settings2, Activity, ShieldCheck, Database, FileText 
} from "lucide-react";
import { motion } from "framer-motion";
import { Experience } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, experiences, deleteExperience } = useAuth();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [dbStats, setDbStats] = useState({
    total: 0,
    publicCount: 0,
    anonCount: 0,
    privateCount: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Compute stats and filter experiences for current user
  useEffect(() => {
    if (user) {
      const userExps = experiences.filter((e) => e.user_id === user.id);
      setFilteredExperiences(userExps);

      const pub = userExps.filter(e => e.privacy === "Public").length;
      const anon = userExps.filter(e => e.privacy === "Anonymous").length;
      const priv = userExps.filter(e => e.privacy === "Private").length;

      setDbStats({
        total: userExps.length,
        publicCount: pub,
        anonCount: anon,
        privateCount: priv
      });
    }
  }, [experiences, user]);

  const handleEdit = (id: string) => {
    router.push(`/create?edit=${id}`);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteExperience(deleteTargetId);
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-indigo-400 animate-spin" />
          <span className="text-sm text-foreground/40 font-bold uppercase tracking-wider">Unlocking Sanctuary...</span>
        </div>
      </div>
    );
  }

  // Find target experience for deleting preview
  const deleteTargetExp = experiences.find(e => e.id === deleteTargetId);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full space-y-8 min-h-[calc(100vh-160px)]">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Greeting */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Sanctuary Overview</h1>
              <p className="text-foreground/50 text-sm mt-1">Hello, {user.name}. Welcome to your emotional reflection dashboard.</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                icon={<FileText className="w-5 h-5 text-indigo-400" />} 
                title="Total Stories" 
                value={dbStats.total} 
              />
              <StatsCard 
                icon={<Globe className="w-5 h-5 text-emerald-400" />} 
                title="Public Posts" 
                value={dbStats.publicCount} 
              />
              <StatsCard 
                icon={<Ghost className="w-5 h-5 text-rose-400" />} 
                title="Anonymous Posts" 
                value={dbStats.anonCount} 
              />
              <StatsCard 
                icon={<Lock className="w-5 h-5 text-amber-400" />} 
                title="Private Log" 
                value={dbStats.privateCount} 
              />
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions (Left) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Recent Activity Logs
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("my-experiences")}>
                    View all ({filteredExperiences.length})
                  </Button>
                </div>

                {filteredExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {filteredExperiences.slice(0, 2).map((exp) => (
                      <div 
                        key={exp.id} 
                        className="p-5 rounded-2xl glass-panel border border-white/5 bg-slate-900/10 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                      >
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm truncate">{exp.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-foreground/40 mt-1 font-semibold">
                            <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{exp.privacy}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="px-3 py-1.5" onClick={() => handleEdit(exp.id)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="px-3 py-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5" onClick={() => handleDeleteTrigger(exp.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-10 rounded-[2rem] text-center border-white/5 space-y-4">
                    <AlertCircle className="w-8 h-8 text-foreground/30 mx-auto" />
                    <div>
                      <h4 className="font-bold text-foreground/80">No stories shared yet</h4>
                      <p className="text-xs text-foreground/40 mt-1">Start cataloging your failures, growth logs, and lessons.</p>
                    </div>
                    <Button variant="primary" size="sm" rightIcon={<PlusCircle className="w-4 h-4" />} onClick={() => router.push("/create")}>
                      Log First Experience
                    </Button>
                  </div>
                )}
              </div>

              {/* Security Status Panel (Right) */}
              <div className="space-y-6">
                <h3 className="font-bold border-b border-white/5 pb-3">Sanctuary Health</h3>
                <GlassCard hoverEffect={false} className="p-6 rounded-[2rem] border-white/5 space-y-4 bg-slate-900/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Encryption Status</h4>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Mock Encrypted ✅</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Local Session Store</h4>
                      <p className="text-[10px] text-foreground/50 mt-0.5">{experiences.length} total cluster blocks</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-foreground/50 leading-relaxed font-medium">
                    💡 **Reflective Insight**: "Failure is the tax we pay on our growth vectors." Keep logging experiences to enhance search capabilities.
                  </div>
                </GlassCard>
              </div>

            </div>
          </motion.div>
        )}

        {/* MY EXPERIENCES TAB */}
        {activeTab === "my-experiences" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">My Shared Experiences</h1>
                <p className="text-foreground/50 text-sm mt-1">Full registry of your logged chapters.</p>
              </div>
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => router.push("/create")}>
                New Story
              </Button>
            </div>

            {filteredExperiences.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredExperiences.map((exp) => (
                  <ExperienceCard 
                    key={exp.id} 
                    experience={exp} 
                    onEdit={handleEdit}
                    onDelete={handleDeleteTrigger}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-16 rounded-[2.5rem] text-center border-white/5 space-y-4">
                <AlertCircle className="w-10 h-10 text-foreground/30 mx-auto" />
                <h4 className="font-bold text-lg">No Experiences Logged</h4>
                <p className="text-sm text-foreground/50 max-w-sm mx-auto leading-relaxed">
                  You haven't added any wisdom stories yet. Click the button below to start.
                </p>
                <Button variant="primary" onClick={() => router.push("/create")}>
                  Write First Story
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* SAVED EXPERIENCES TAB */}
        {activeTab === "saved-experiences" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Saved Insights</h1>
              <p className="text-foreground/50 text-sm mt-1">Wisdom chapters you bookmarked during search explorations.</p>
            </div>

            {/* Seed 1 mock bookmarked experience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExperienceCard 
                experience={{
                  id: "exp-3-saved",
                  title: "Left a high-paying FAANG job because I hated coding",
                  content: "On paper, I had it all. $250k salary, great perks, working on a famous team. But every single morning, I woke up with dread. I hated sitting in front of JIRA tickets all day. I felt guilty because others would kill for my job...",
                  emotion_tags: ["career mistake", "lost", "burnout", "growth"],
                  privacy: "Public",
                  user_id: "user-gamma",
                  author_name: "Sarah Chen",
                  created_at: "2026-03-20T14:45:00Z",
                  updated_at: "2026-03-20T14:45:00Z"
                }} 
              />
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-2xl"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Sanctuary Settings</h1>
              <p className="text-foreground/50 text-sm mt-1">Configure profile and privacy variables.</p>
            </div>

            <GlassCard hoverEffect={false} className="p-8 rounded-[2rem] border-white/5 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 pl-1">Preserver Name</label>
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none text-foreground text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 pl-1">Email Coordinates</label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none text-foreground text-sm opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end">
                <Button variant="primary" size="sm" onClick={() => alert("Profile coordinates saved (mock operation).")}>
                  Save Coordinates
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </div>

      {/* DELETE MODAL CONFIRMATION */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Banish Story?"
        description="This action is irreversible. The experience logs and any associated vector weights will be completely purged from the sanctuary."
        confirmLabel="Banish Story"
        onConfirm={handleDeleteConfirm}
        isConfirmLoading={isDeleting}
        variant="danger"
      >
        {deleteTargetExp && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-foreground/75 italic line-clamp-3">
            "{deleteTargetExp.title}"
          </div>
        )}
      </Modal>

    </div>
  );
}

// Sub Stats Card Component
function StatsCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-slate-900/10 space-y-3">
      <div className="p-2.5 rounded-xl bg-white/5 w-fit">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">{title}</p>
        <p className="text-2xl font-black text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
