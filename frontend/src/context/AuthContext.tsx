"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { User, Experience, PrivacyLevel } from "@/types";
import { SearchLimitModal } from "@/components/ui/SearchLimitModal";
import { TokenStorage } from "@/lib/authStorage";
import { supabase } from "@/lib/supabaseClient";
import { 
  authService, 
  experienceService, 
  searchService, 
  recommendationService 
} from "@/lib/api";

const hasOAuthParams = () => {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  const search = window.location.search;
  return (
    hash.includes("access_token") ||
    hash.includes("refresh_token") ||
    hash.includes("id_token") ||
    search.includes("code=")
  );
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  experiences: Experience[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined" && hasOAuthParams()) {
      console.log("[OAUTH_PARAMS_DETECTED] OAuth params detected in URL on initial loading state creation.");
      return true;
    }
    return true;
  });

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

  const lastSyncedTokenRef = useRef<string | null>(null);

  // Initialize from backend (or fallback local storage for guest searches)
  useEffect(() => {
    const oauthDetected = hasOAuthParams();
    let timeoutId: NodeJS.Timeout | null = null;

    if (oauthDetected) {
      console.log("[OAUTH_PARAMS_DETECTED] OAuth parameters detected in URL on mount. Setting up fallback timeout.");
      // Fallback timeout to prevent permanent loading state
      timeoutId = setTimeout(() => {
        console.warn("[OAUTH_TIMEOUT] OAuth session detection timed out after 6 seconds.");
        setIsLoading(false);
      }, 6000);
    }

    const initAuth = async () => {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "server";
      console.log(`[INIT_AUTH_START] initAuth starting... Pathname: ${currentPath}`);
      if (oauthDetected) {
        console.log(`[OAUTH_PARAMS_DETECTED] OAuth params detected in URL during initAuth. Hash: ${typeof window !== "undefined" ? window.location.hash : ""}, Search: ${typeof window !== "undefined" ? window.location.search : ""}`);
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log(`[SESSION_RESULT] getSession() returned: session exists = ${!!session}, User ID = ${session?.user?.id || "none"}`);
      const token = session?.access_token || TokenStorage.getToken();
      console.log(`[TOKEN_STATUS] resolved token exists = ${!!token}, source = ${session?.access_token ? "Supabase session" : "TokenStorage"}`);
      
      if (token) {
        try {
          if (session?.access_token) {
            console.log("[OAUTH_SYNC_START] Syncing token with backend...");
            lastSyncedTokenRef.current = session.access_token;
            await authService.oauth(session.access_token);
          }
          console.log("[GET_PROFILE_START] Fetching profile...");
          const profile = await authService.getProfile();
          console.log(`[GET_PROFILE_SUCCESS] Profile fetched successfully: ID = ${profile?.id}, Email = ${profile?.email}`);
          setUser(profile);
          setSearchCount(profile.daily_search_count || 0);
          setUserInterests(profile.interests || []);
          
          // Load search history from DB
          const history = await searchService.getHistory();
          setPreviousSearches(history.map(h => h.query));
        } catch (err) {
          console.warn("[SESSION_RESTORE_FAILED] Session restore failed, falling back to client-side profile", err);
          if (session?.user) {
            const fallbackProfile: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Google User",
              email: session.user.email || "",
              created_at: session.user.created_at || new Date().toISOString(),
              tier: "free",
              daily_search_count: 0,
              search_limit: 50,
              interests: [],
              auth_provider: session.user.app_metadata?.provider || "google",
            };
            setUser(fallbackProfile);
          } else {
            TokenStorage.clearToken();
            await supabase.auth.signOut();
          }
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

      if (!oauthDetected) {
        console.log("[SET_LOADING] initAuth finished and no OAuth detected. Setting isLoading = false");
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes on Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(`[AUTH_STATE_CHANGE] Event: ${event}, Session exists: ${!!session}, User ID: ${session?.user?.id || "none"}`);
      if (event === "SIGNED_IN") {
        console.log("[SIGNED_IN_EVENT] Supabase SIGNED_IN event triggered.");
      }

      if (session?.access_token) {
        if (lastSyncedTokenRef.current !== session.access_token) {
          console.log(`[SYNC_CHECK] Token differs from lastSyncedTokenRef (lastSynced = ${lastSyncedTokenRef.current ? "exists" : "null"}). Syncing token to backend.`);
          lastSyncedTokenRef.current = session.access_token;
          setIsLoading(true);
          try {
            await authService.oauth(session.access_token);
            console.log("[GET_PROFILE_START] Fetching profile in onAuthStateChange...");
            const profile = await authService.getProfile();
            console.log(`[GET_PROFILE_SUCCESS] Profile fetched successfully in onAuthStateChange: ID = ${profile?.id}, Email = ${profile?.email}`);
            setUser(profile);
            setSearchCount(profile.daily_search_count || 0);
            setUserInterests(profile.interests || []);
            await refreshExperiences();
          } catch (err) {
            console.error("OAuth token sync failed; using fallback client-side user profile:", err);
            if (session?.user) {
              const fallbackProfile: User = {
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Google User",
                email: session.user.email || "",
                created_at: session.user.created_at || new Date().toISOString(),
                tier: "free",
                daily_search_count: 0,
                search_limit: 50,
                interests: [],
                auth_provider: session.user.app_metadata?.provider || "google",
              };
              setUser(fallbackProfile);
            }
          } finally {
            console.log("[SET_LOADING] onAuthStateChange sync complete. Setting isLoading = false");
            setIsLoading(false);
          }
        } else {
          console.log("[SYNC_CHECK] Token already synced (matches lastSyncedTokenRef). Setting isLoading = false");
          setIsLoading(false);
        }
      } else {
        const urlHasError = typeof window !== "undefined" && (
          window.location.hash.includes("error") ||
          window.location.search.includes("error")
        );
        if (urlHasError) {
          console.log("[OAUTH_ERROR] OAuth error detected in URL. Setting isLoading = false");
          setIsLoading(false);
        }
      }

      if (event === "SIGNED_OUT") {
        console.log("[SIGNED_OUT_EVENT] Supabase SIGNED_OUT event triggered. Clearing session.");
        lastSyncedTokenRef.current = null;
        if (TokenStorage.getToken()) {
          TokenStorage.clearToken();
          setUser(null);
          setSearchCount(0);
          setUserInterests([]);
          setPreviousSearches([]);
          setViewedStoryIds([]);
          refreshExperiences();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        console.log("Cleaning up OAuth fallback timeout.");
        clearTimeout(timeoutId);
      }
    };
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials") || error.status === 400) {
          console.log("Supabase login failed, attempting backend migration login...");
          const res = await authService.login(email, password);
          if (res.access_token) {
            await supabase.auth.setSession({
              access_token: res.access_token,
              refresh_token: "",
            });
            const profile = await authService.getProfile();
            setUser(profile);
            await refreshExperiences();
            setIsLoading(false);
            return true;
          }
        }
        throw error;
      }
      
      if (data.session?.access_token) {
        await authService.oauth(data.session.access_token);
        const profile = await authService.getProfile();
        setUser(profile);
        await refreshExperiences();
      }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          }
        }
      });
      if (error) throw error;
      if (data.session?.access_token) {
        await authService.oauth(data.session.access_token);
        const profile = await authService.getProfile();
        setUser(profile);
        await refreshExperiences();
      }
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Calling signInWithOAuth");
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      console.log("OAuth result:", result);
      if (result.error) throw result.error;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
        loginWithGoogle,
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
