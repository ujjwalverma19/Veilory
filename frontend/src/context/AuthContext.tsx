"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Experience, PrivacyLevel } from "@/types";
import { SearchLimitModal } from "@/components/ui/SearchLimitModal";
import { TokenStorage } from "@/lib/authStorage";
import { 
  authService, 
  experienceService, 
  searchService, 
  recommendationService 
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  experiences: Experience[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addExperience: (title: string, content: string, tags: string[], privacy: PrivacyLevel) => Promise<Experience>;
  updateExperience: (id: string | number, title: string, content: string, tags: string[], privacy: PrivacyLevel) => Promise<Experience>;
  deleteExperience: (id: string | number) => Promise<boolean>;

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
  viewedStoryIds: (string | number)[];
  previousSearches: string[];
  userInterests: string[];
  logViewedStory: (id: string | number) => void;
  logSearchQuery: (query: string) => void;
  toggleUserInterest: (interest: string) => void;
  refreshUser: () => Promise<void>;
  refreshExperiences: () => Promise<void>;
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
  const [viewedStoryIds, setViewedStoryIds] = useState<(string | number)[]>([]);
  const [previousSearches, setPreviousSearches] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  const limit = user ? (user.search_limit || 50) : 10;
  const searchesRemaining = limit === 999999 ? Infinity : Math.max(0, limit - searchCount);

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setSearchCount(profile.daily_search_count || 0);
      setUserInterests(profile.interests || []);
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
      logout();
    }
  };

  // Fetch experiences
  const refreshExperiences = async () => {
    try {
      const data = await experienceService.listPublic(0, 100);
      setExperiences(data.experiences);
    } catch (err) {
      console.error("Failed to load experiences from backend:", err);
    }
  };

  // Initialize from backend (or fallback local storage for guest searches)
  useEffect(() => {
    const initAuth = async () => {
      const token = TokenStorage.getToken();
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setSearchCount(profile.daily_search_count || 0);
          setUserInterests(profile.interests || []);
          
          // Load search history from DB
          const history = await searchService.getHistory();
          setPreviousSearches(history.map(h => h.query));
        } catch (err) {
          console.warn("Session restore failed, clearing token", err);
          TokenStorage.clearToken();
        }
      } else {
        // Load guest daily searches
        const today = new Date().toLocaleDateString('en-CA');
        const guestSearchesStr = localStorage.getItem("veilory_guest_searches");
        if (guestSearchesStr) {
          const parsed = JSON.parse(guestSearchesStr);
          if (parsed.date === today) {
            setSearchCount(parsed.count);
          } else {
            setSearchCount(0);
            localStorage.setItem("veilory_guest_searches", JSON.stringify({ date: today, count: 0 }));
          }
        }
      }

      await refreshExperiences();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Sync viewed stories list on login
  useEffect(() => {
    if (user) {
      // Load user search history
      searchService.getHistory()
        .then(history => setPreviousSearches(history.map(h => h.query)))
        .catch(console.error);

      // Load user interests
      recommendationService.getInterests()
        .then(interests => setUserInterests(interests))
        .catch(console.error);
    } else {
      // Local storage fallback for guest search history
      const guestHistory = localStorage.getItem("veilory_guest_searches_history");
      setPreviousSearches(guestHistory ? JSON.parse(guestHistory) : []);
    }
  }, [user]);

  const attemptSearch = (): boolean => {
    if (searchesRemaining <= 0) {
      setLimitModalType(user ? "user" : "guest");
      setShowLimitModal(true);
      return false;
    }
    return true;
  };

  const incrementSearchCount = (): boolean => {
    if (searchesRemaining <= 0) {
      setLimitModalType(user ? "user" : "guest");
      setShowLimitModal(true);
      return false;
    }

    const newCount = searchCount + 1;
    setSearchCount(newCount);

    if (!user) {
      const today = new Date().toLocaleDateString('en-CA');
      localStorage.setItem("veilory_guest_searches", JSON.stringify({ date: today, count: newCount }));
    }
    return true;
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    try {
      const upgradedUser = await authService.upgradeTier();
      setUser(upgradedUser);
    } catch (err) {
      console.error("Upgrade to Premium failed:", err);
      throw err;
    }
  };

  const logViewedStory = async (id: string | number) => {
    setViewedStoryIds(prev => {
      if (prev.includes(id)) return prev;
      return [id, ...prev];
    });

    if (user) {
      try {
        await recommendationService.logView(id);
      } catch (err) {
        console.error("Failed to log view to backend:", err);
      }
    } else {
      // Local storage fallback for guests
      const guestViewsKey = "veilory_guest_viewed_stories";
      const stored = localStorage.getItem(guestViewsKey);
      const views = stored ? JSON.parse(stored) : [];
      if (!views.includes(id)) {
        localStorage.setItem(guestViewsKey, JSON.stringify([id, ...views]));
      }
    }
  };

  const logSearchQuery = async (query: string) => {
    if (!query.trim()) return;
    
    setPreviousSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 10);
      
      if (!user) {
        localStorage.setItem("veilory_guest_searches_history", JSON.stringify(updated));
      }
      return updated;
    });
    
    // Note: Backend /search endpoint automatically saves searches for logged in users
  };

  const toggleUserInterest = async (interest: string) => {
    const cleaned = interest.trim().toLowerCase();
    const updated = userInterests.includes(cleaned)
      ? userInterests.filter(i => i !== cleaned)
      : [...userInterests, cleaned];

    setUserInterests(updated);

    if (user) {
      try {
        await recommendationService.updateInterests(updated);
      } catch (err) {
        console.error("Failed to sync interests to backend:", err);
      }
    } else {
      localStorage.setItem("veilory_guest_interests", JSON.stringify(updated));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      await refreshUser();
      await refreshExperiences();
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.signup(name, email, password);
      // Automatically log in after sign up
      await authService.login(email, password);
      await refreshUser();
      await refreshExperiences();
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    TokenStorage.clearToken();
    setUser(null);
    setSearchCount(0);
    setUserInterests([]);
    setPreviousSearches([]);
    setViewedStoryIds([]);
    refreshExperiences();
  };

  const addExperience = async (
    title: string,
    content: string,
    tags: string[],
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    if (!user) throw new Error("Authentication required.");
    
    try {
      const newExp = await experienceService.create(title, content, tags, privacy);
      await refreshExperiences();
      return newExp;
    } catch (err) {
      console.error("Create experience failed:", err);
      throw err;
    }
  };

  const updateExperience = async (
    id: string | number,
    title: string,
    content: string,
    tags: string[],
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    if (!user) throw new Error("Authentication required.");

    try {
      const updatedExp = await experienceService.update(id, {
        title,
        content,
        emotion_tags: tags,
        privacy
      });
      await refreshExperiences();
      return updatedExp;
    } catch (err) {
      console.error("Update experience failed:", err);
      throw err;
    }
  };

  const deleteExperience = async (id: string | number): Promise<boolean> => {
    if (!user) throw new Error("Authentication required.");

    try {
      await experienceService.delete(id);
      await refreshExperiences();
      return true;
    } catch (err) {
      console.error("Delete experience failed:", err);
      throw err;
    }
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
        toggleUserInterest,
        refreshUser,
        refreshExperiences
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
