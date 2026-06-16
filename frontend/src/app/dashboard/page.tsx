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
  Heart, Globe, Ghost, Lock, AlertCircle, PlusCircle,
  FileText
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

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
          <div className="w-10 h-10 rounded-full border-3 border-[#1a1a1a]/10 border-t-[#1a1a1a]/50 animate-spin" />
          <span className="text-sm text-[#1a1a1a]/35 font-medium">Loading your library...</span>
        </div>
      </div>
    );
  }

  const deleteTargetExp = experiences.find(e => e.id === deleteTargetId);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 w-full space-y-8 min-h-[calc(100vh-160px)]">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1
                className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Welcome back, {user.name}
              </h1>
              <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">Your personal library of experiences and reflections.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                icon={<FileText className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Total Stories"
                value={dbStats.total}
              />
              <StatsCard
                icon={<Globe className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Public"
                value={dbStats.publicCount}
              />
              <StatsCard
                icon={<Ghost className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Anonymous"
                value={dbStats.anonCount}
              />
              <StatsCard
                icon={<Lock className="w-4.5 h-4.5 text-[#1a1a1a]/40" />}
                title="Private"
                value={dbStats.privateCount}
              />
            </div>

            {/* Recent + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-[#1a1a1a]/6 pb-3">
                  <h3 className="font-medium text-[#1a1a1a]/70 text-sm">Recent stories</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("my-experiences")}>
                    View all ({filteredExperiences.length})
                  </Button>
                </div>

                {filteredExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {filteredExperiences.slice(0, 2).map((exp) => (
                      <div
                        key={exp.id}
                        className="p-5 rounded-xl bg-white/40 border border-[#1a1a1a]/6 flex items-center justify-between gap-4 hover:bg-white/60 hover:border-[#1a1a1a]/10 transition-colors"
                      >
                        <div className="overflow-hidden">
                          <h4 className="font-medium text-sm truncate text-[#1a1a1a]">{exp.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-[#1a1a1a]/35 mt-1 font-medium">
                            <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                            <span>&middot;</span>
                            <span className="capitalize">{exp.privacy}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="px-3 py-1.5" onClick={() => handleEdit(exp.id)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="px-3 py-1.5 text-rose-400/60 hover:text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteTrigger(exp.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/40 p-10 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4">
                    <AlertCircle className="w-8 h-8 text-[#1a1a1a]/20 mx-auto" />
                    <div>
                      <h4 className="font-medium text-[#1a1a1a]/70">No stories shared yet</h4>
                      <p className="text-xs text-[#1a1a1a]/35 mt-1">Start by writing about an experience that shaped you.</p>
                    </div>
                    <Button variant="primary" size="sm" rightIcon={<PlusCircle className="w-4 h-4" />} onClick={() => router.push("/create")}>
                      Write your first story
                    </Button>
                  </div>
                )}
              </div>

              {/* Side panel */}
              <div className="space-y-6">
                <h3 className="font-medium text-[#1a1a1a]/70 text-sm border-b border-[#1a1a1a]/6 pb-3">About your library</h3>
                <GlassCard hoverEffect={false} className="p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-300" />
                    <div>
                      <h4 className="text-xs font-medium text-[#1a1a1a]">Your stories matter</h4>
                      <p className="text-[10px] text-[#1a1a1a]/35 mt-0.5">{experiences.length} experiences in the library</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#1a1a1a]/3 rounded-xl border border-[#1a1a1a]/5 text-[10px] text-[#1a1a1a]/45 leading-relaxed font-light"
                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    &ldquo;Every failure carries a lesson someone else needs to hear.&rdquo;
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
            <div className="flex items-center justify-between border-b border-[#1a1a1a]/6 pb-4">
              <div>
                <h1
                  className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  My Stories
                </h1>
                <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">All the experiences you&apos;ve shared.</p>
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
              <div className="bg-white/40 p-16 rounded-2xl text-center border border-[#1a1a1a]/6 space-y-4">
                <AlertCircle className="w-10 h-10 text-[#1a1a1a]/20 mx-auto" />
                <h4 className="font-medium text-lg text-[#1a1a1a]/70" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>No stories yet</h4>
                <p className="text-sm text-[#1a1a1a]/40 max-w-sm mx-auto leading-relaxed">
                  You haven&apos;t shared any experiences yet. Start by writing about something that shaped you.
                </p>
                <Button variant="primary" onClick={() => router.push("/create")}>
                  Write your first story
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
              <h1
                className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Saved Stories
              </h1>
              <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">Stories you bookmarked while exploring.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExperienceCard
                experience={{
                  id: "exp-3-saved",
                  title: "Left a high-paying job because I hated coding",
                  content: "On paper, I had it all. $250k salary, great perks, working on a famous team. But every single morning, I woke up with dread. I hated sitting in front of JIRA tickets all day. I felt guilty because others would kill for my job...",
                  emotion_tags: ["career", "lost", "burnout", "growth"],
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
              <h1
                className="text-2xl font-light tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Settings
              </h1>
              <p className="text-[#1a1a1a]/40 text-sm mt-1 font-light">Update your profile details.</p>
            </div>

            <GlassCard hoverEffect={false} className="p-8 rounded-2xl space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 outline-none text-[#1a1a1a] text-sm focus:border-[#1a1a1a]/20 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#1a1a1a]/50 pl-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-[#1a1a1a]/8 outline-none text-[#1a1a1a] text-sm opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a]/6 flex items-center justify-end">
                <Button variant="primary" size="sm" onClick={() => alert("Profile saved (demo).")}>
                  Save changes
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Delete this story?"
        description="This action cannot be undone. The story will be permanently removed from your library."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isConfirmLoading={isDeleting}
        variant="danger"
      >
        {deleteTargetExp && (
          <div className="p-4 rounded-xl bg-[#1a1a1a]/3 border border-[#1a1a1a]/6 text-xs text-[#1a1a1a]/60 italic line-clamp-3">
            &ldquo;{deleteTargetExp.title}&rdquo;
          </div>
        )}
      </Modal>

    </div>
  );
}

function StatsCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="bg-white/40 p-5 rounded-xl border border-[#1a1a1a]/6 space-y-3">
      <div className="p-2 rounded-lg bg-[#1a1a1a]/4 w-fit">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-medium text-[#1a1a1a]/35 tracking-wider">{title}</p>
        <p className="text-2xl font-light text-[#1a1a1a] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
