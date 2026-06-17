"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Experience, PrivacyLevel } from "@/types";
import { INITIAL_EXPERIENCES } from "@/lib/mockData";
import { SearchLimitModal } from "@/components/ui/SearchLimitModal";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  experiences: Experience[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addExperience: (title: string, content: string, tags: string[], privacy: PrivacyLevel) => Promise<Experience>;
  updateExperience: (id: string, title: string, content: string, tags: string[], privacy: PrivacyLevel) => Promise<Experience>;
  deleteExperience: (id: string) => Promise<boolean>;

  // Search limit & Premium states
  searchCount: number;
  searchLimit: number;
  searchesRemaining: number;
  incrementSearchCount: () => boolean;
  attemptSearch: () => boolean;
  showLimitModal: boolean;
  setShowLimitModal: (show: boolean) => void;
  limitModalType: "guest" | "user" | null;
  setLimitModalType: (type: "guest" | "user" | null) => void;
  upgradeToPremium: () => Promise<void>;

  // Personalization, views & history tracking states
  viewedStoryIds: string[];
  previousSearches: string[];
  userInterests: string[];
  logViewedStory: (id: string) => void;
  logSearchQuery: (query: string) => void;
  toggleUserInterest: (interest: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search limit states
  const [searchCount, setSearchCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<"guest" | "user" | null>(null);

  // Personalization states
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);
  const [previousSearches, setPreviousSearches] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  const getLimit = () => {
    if (!user) return 10;
    if (user.tier === "premium") return Infinity;
    return 50;
  };

  const limit = getLimit();
  const searchesRemaining = limit === Infinity ? Infinity : Math.max(0, limit - searchCount);

  // Initialize from localStorage on mount & sync when user changes
  useEffect(() => {
    const storedUser = localStorage.getItem("veilory_user");
    const storedExps = localStorage.getItem("veilory_experiences");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedExps) {
      setExperiences(JSON.parse(storedExps));
    } else {
      setExperiences(INITIAL_EXPERIENCES);
      localStorage.setItem("veilory_experiences", JSON.stringify(INITIAL_EXPERIENCES));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const userPrefix = user ? `user_${user.id}` : "guest";
    
    // 1. Load search count for today
    const limitKey = `veilory_${userPrefix}_searches`;
    const storedLimitStr = localStorage.getItem(limitKey);
    if (storedLimitStr) {
      const parsed = JSON.parse(storedLimitStr);
      if (parsed.date === today) {
        setSearchCount(parsed.count);
      } else {
        setSearchCount(0);
        localStorage.setItem(limitKey, JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      setSearchCount(0);
      localStorage.setItem(limitKey, JSON.stringify({ date: today, count: 0 }));
    }

    // 2. Load viewed story history
    const viewsKey = `veilory_${userPrefix}_viewed_stories`;
    const storedViews = localStorage.getItem(viewsKey);
    setViewedStoryIds(storedViews ? JSON.parse(storedViews) : []);

    // 3. Load search history
    const historyKey = `veilory_${userPrefix}_searches_history`;
    const storedHistory = localStorage.getItem(historyKey);
    setPreviousSearches(storedHistory ? JSON.parse(storedHistory) : []);

    // 4. Load interests
    const interestsKey = `veilory_${userPrefix}_interests`;
    const storedInterests = localStorage.getItem(interestsKey);
    setUserInterests(storedInterests ? JSON.parse(storedInterests) : []);
  }, [user]);

  const attemptSearch = (): boolean => {
    const currentLimit = getLimit();
    if (searchCount >= currentLimit) {
      setLimitModalType(user ? "user" : "guest");
      setShowLimitModal(true);
      return false;
    }
    return true;
  };

  const incrementSearchCount = (): boolean => {
    const today = new Date().toLocaleDateString('en-CA');
    const userPrefix = user ? `user_${user.id}` : "guest";
    const limitKey = `veilory_${userPrefix}_searches`;
    const currentLimit = getLimit();

    if (searchCount >= currentLimit) {
      setLimitModalType(user ? "user" : "guest");
      setShowLimitModal(true);
      return false;
    }

    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem(limitKey, JSON.stringify({ date: today, count: newCount }));
    return true;
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    const upgradedUser: User = { ...user, tier: "premium" };
    setUser(upgradedUser);
    localStorage.setItem("veilory_user", JSON.stringify(upgradedUser));
  };

  const logViewedStory = (id: string) => {
    const userPrefix = user ? `user_${user.id}` : "guest";
    const key = `veilory_${userPrefix}_viewed_stories`;
    setViewedStoryIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [id, ...prev];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const logSearchQuery = (query: string) => {
    if (!query.trim()) return;
    const userPrefix = user ? `user_${user.id}` : "guest";
    const key = `veilory_${userPrefix}_searches_history`;
    setPreviousSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleUserInterest = (interest: string) => {
    const userPrefix = user ? `user_${user.id}` : "guest";
    const key = `veilory_${userPrefix}_interests`;
    setUserInterests(prev => {
      const updated = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email && password.length >= 8) {
      const mockUser: User = {
        id: "user-alpha",
        email: email,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        created_at: new Date().toISOString(),
        tier: "free"
      };
      setUser(mockUser);
      localStorage.setItem("veilory_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    throw new Error("Invalid email or password. Password must be at least 8 characters.");
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (name && email && password.length >= 8) {
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        name: name,
        created_at: new Date().toISOString(),
        tier: "free"
      };
      setUser(mockUser);
      localStorage.setItem("veilory_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    throw new Error("Signup failed. Password must be at least 8 characters.");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("veilory_user");
  };

  const addExperience = async (
    title: string,
    content: string,
    tags: string[],
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!user) throw new Error("Authentication required.");

    const newExp: Experience = {
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      emotion_tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      privacy,
      user_id: user.id,
      author_name: privacy === "Anonymous" ? null : user.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [newExp, ...experiences];
    setExperiences(updated);
    localStorage.setItem("veilory_experiences", JSON.stringify(updated));
    return newExp;
  };

  const updateExperience = async (
    id: string,
    title: string,
    content: string,
    tags: string[],
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!user) throw new Error("Authentication required.");

    const index = experiences.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Experience not found.");
    if (experiences[index].user_id !== user.id) throw new Error("Permission denied.");

    const updatedExp: Experience = {
      ...experiences[index],
      title,
      content,
      emotion_tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      privacy,
      author_name: privacy === "Anonymous" ? null : user.name,
      updated_at: new Date().toISOString()
    };

    const updated = [...experiences];
    updated[index] = updatedExp;
    setExperiences(updated);
    localStorage.setItem("veilory_experiences", JSON.stringify(updated));
    return updatedExp;
  };

  const deleteExperience = async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!user) throw new Error("Authentication required.");

    const exp = experiences.find((e) => e.id === id);
    if (!exp) throw new Error("Experience not found.");
    if (exp.user_id !== user.id) throw new Error("Permission denied.");

    const updated = experiences.filter((e) => e.id !== id);
    setExperiences(updated);
    localStorage.setItem("veilory_experiences", JSON.stringify(updated));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        experiences,
        login,
        signup,
        logout,
        addExperience,
        updateExperience,
        deleteExperience,
        searchCount,
        searchLimit: limit,
        searchesRemaining,
        incrementSearchCount,
        attemptSearch,
        showLimitModal,
        setShowLimitModal,
        limitModalType,
        setLimitModalType,
        upgradeToPremium,
        viewedStoryIds,
        previousSearches,
        userInterests,
        logViewedStory,
        logSearchQuery,
        toggleUserInterest
      }}
    >
      {children}
      <SearchLimitModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
