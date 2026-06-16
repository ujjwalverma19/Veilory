"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, PenLine, Heart, Settings, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4.5 h-4.5" />
    },
    {
      id: "my-experiences",
      label: "My Stories",
      icon: <BookOpen className="w-4.5 h-4.5" />
    },
    {
      id: "saved-experiences",
      label: "Saved",
      icon: <Heart className="w-4.5 h-4.5" />
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4.5 h-4.5" />
    }
  ];

  return (
    <aside className="w-full md:w-60 shrink-0 bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-[#1a1a1a]/6 flex flex-col justify-between md:h-[calc(100vh-160px)] md:sticky md:top-28">
      <div className="space-y-6">
        {/* User */}
        {user && (
          <div className="p-3.5 rounded-xl bg-[#1a1a1a]/4 border border-[#1a1a1a]/6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center font-medium text-[#1a1a1a]/60 text-sm">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-medium truncate text-[#1a1a1a]">{user.name}</h4>
              <p className="text-[10px] text-[#1a1a1a]/35 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
                activeTab === item.id
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#1a1a1a]/50 hover:text-[#1a1a1a]/80 hover:bg-[#1a1a1a]/5"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <Link
            href="/create"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1a1a1a]/50 hover:text-[#1a1a1a]/70 hover:bg-[#1a1a1a]/5 transition-all mt-3 border border-dashed border-[#1a1a1a]/10"
          >
            <PenLine className="w-4.5 h-4.5" />
            <span>Write new story</span>
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400/60 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer mt-8 md:mt-0"
      >
        <LogOut className="w-4.5 h-4.5" />
        <span>Sign out</span>
      </button>
    </aside>
  );
}
