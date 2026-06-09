"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, PenLine, Heart, Settings, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      id: "overview",
      label: "User Overview",
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: "my-experiences",
      label: "My Experiences",
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: "saved-experiences",
      label: "Saved Experiences",
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: "settings",
      label: "Sanctuary Settings",
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 glass-panel rounded-[2.5rem] p-6 border border-white/10 flex flex-col justify-between md:h-[calc(100vh-160px)] md:sticky md:top-28">
      <div className="space-y-8">
        {/* User Card */}
        {user && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate text-foreground">{user.name}</h4>
              <p className="text-[10px] text-foreground/40 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Sidebar Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                activeTab === item.id
                  ? "bg-foreground text-background shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/5"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <Link
            href="/create"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all mt-4 border border-dashed border-indigo-500/20"
          >
            <PenLine className="w-5 h-5" />
            <span>Write New Story</span>
          </Link>
        </nav>
      </div>

      {/* Logout Action */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/5 transition-all border border-transparent hover:border-rose-500/10 cursor-pointer mt-8 md:mt-0"
      >
        <LogOut className="w-5 h-5" />
        <span>Exit Sanctuary</span>
      </button>
    </aside>
  );
}
