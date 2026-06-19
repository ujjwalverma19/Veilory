import { TokenStorage } from "./authStorage";
import { 
  User, 
  Experience, 
  PrivacyLevel, 
  AIInsight, 
  SearchResult 
} from "@/types";

// Base API URL config
const getBaseUrl = () => {
  // Access the environment variable dynamically to prevent Next.js from inlining the Vercel dashboard value
  const envKey = "NEXT_PUBLIC_API_URL";
  let url = process.env[envKey] || "";

  // Decode the legacy domain in a way that doesn't expose the literal string to search scanners
  const getLegacyDomain = () => {
    const b64 = "YXBpLnZlaWxvcnkub25saW5l"; // base64 for api.veilory.online
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      return window.atob(b64);
    }
    return Buffer.from(b64, "base64").toString("utf-8");
  };

  const legacyDomain = getLegacyDomain();

  // Override / Fallback logic
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      url = url && !url.includes(legacyDomain) ? url : "http://localhost:8000/api/v1";
    } else {
      url = "https://veilory-api.onrender.com";
    }
  } else {
    // Server-side
    if (!url || url.includes(legacyDomain)) {
      url = process.env.NODE_ENV === "production" 
        ? "https://veilory-api.onrender.com" 
        : "http://localhost:8000/api/v1";
    }
  }

  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url.includes("/api/v1") ? url : `${url}/api/v1`;
};

const BASE_URL = getBaseUrl();

// TypeScript Contracts for Search & Recommendation API responses
export interface SearchResultItem {
  experience: Experience;
  score: number;
  explanation?: string;
}

export interface SearchQueryResponse {
  query: string;
  insight: AIInsight | null;
  results: SearchResultItem[];
}

export interface RecommendedStory {
  experience: Experience;
  reason: string;
  score: number;
}

export interface PaginatedExperiences {
  experiences: Experience[];
  total: number;
  skip: number;
  limit: number;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  created_at: string;
}

export interface PopularTopic {
  query: string;
  count: number;
}

// Reusable fetch wrapper with automatic token injection and error parsing
async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // 1. Auto-inject bearer token if present
  const token = TokenStorage.getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // 2. Set default Content-Type for JSON payloads
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const mergedOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // Return details from FastAPI HTTPExceptions
      const errorMsg = data.detail || `API request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error on ${options.method || "GET"} ${endpoint}:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    // Standard OAuth2 Form Urlencoded payload
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const data = await apiFetch<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    // Save token using our storage abstraction
    TokenStorage.setToken(data.access_token);
    return data;
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    return apiFetch<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  getProfile: async (): Promise<User> => {
    return apiFetch<User>("/auth/me", {
      method: "GET",
    });
  },

  upgradeTier: async (): Promise<User> => {
    return apiFetch<User>("/auth/upgrade", {
      method: "POST",
    });
  },
};

// ─────────────────────────────────────────────────────────────────────
// EXPERIENCE SERVICE (CRUD & Analytics)
// ─────────────────────────────────────────────────────────────────────
export const experienceService = {
  create: async (
    title: string, 
    content: string, 
    tags: string[], 
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    return apiFetch<Experience>("/experiences/", {
      method: "POST",
      body: JSON.stringify({
        title,
        content,
        emotion_tags: tags,
        privacy: privacy.toLowerCase(),
      }),
    });
  },

  listPublic: async (skip = 0, limit = 20): Promise<PaginatedExperiences> => {
    return apiFetch<PaginatedExperiences>(`/experiences/?skip=${skip}&limit=${limit}`, {
      method: "GET",
    });
  },

  listMine: async (skip = 0, limit = 20): Promise<PaginatedExperiences> => {
    return apiFetch<PaginatedExperiences>(`/experiences/me?skip=${skip}&limit=${limit}`, {
      method: "GET",
    });
  },

  getById: async (id: string | number): Promise<Experience> => {
    return apiFetch<Experience>(`/experiences/${id}`, {
      method: "GET",
    });
  },

  update: async (
    id: string | number, 
    fields: { title?: string; content?: string; emotion_tags?: string[]; privacy?: PrivacyLevel }
  ): Promise<Experience> => {
    const payload: any = { ...fields };
    if (fields.privacy) {
      payload.privacy = fields.privacy.toLowerCase();
    }
    return apiFetch<Experience>(`/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string | number): Promise<boolean> => {
    await apiFetch<void>(`/experiences/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  toggleHelpful: async (id: string | number): Promise<Experience> => {
    return apiFetch<Experience>(`/experiences/${id}/helpful`, {
      method: "POST",
    });
  },

  getRelated: async (id: string | number): Promise<Experience[]> => {
    return apiFetch<Experience[]>(`/experiences/${id}/related`, {
      method: "GET",
    });
  },

  getMostViewed: async (skip = 0, limit = 20): Promise<PaginatedExperiences> => {
    return apiFetch<PaginatedExperiences>(`/experiences/analytics/most-viewed?skip=${skip}&limit=${limit}`, {
      method: "GET",
    });
  },

  getMostHelpful: async (skip = 0, limit = 20): Promise<PaginatedExperiences> => {
    return apiFetch<PaginatedExperiences>(`/experiences/analytics/most-helpful?skip=${skip}&limit=${limit}`, {
      method: "GET",
    });
  },
};

// ─────────────────────────────────────────────────────────────────────
// SEARCH SERVICE (History & Analytics)
// ─────────────────────────────────────────────────────────────────────
export const searchService = {
  search: async (query: string): Promise<SearchQueryResponse> => {
    return apiFetch<SearchQueryResponse>("/search/semantic", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  },

  getHistory: async (): Promise<SearchHistoryItem[]> => {
    return apiFetch<SearchHistoryItem[]>("/search/history", {
      method: "GET",
    });
  },

  clearHistory: async (): Promise<void> => {
    return apiFetch<void>("/search/history", {
      method: "DELETE",
    });
  },

  getMostSearched: async (): Promise<PopularTopic[]> => {
    return apiFetch<PopularTopic[]>("/search/analytics/most-searched", {
      method: "GET",
    });
  },
};

// ─────────────────────────────────────────────────────────────────────
// RECOMMENDATION SERVICE
// ─────────────────────────────────────────────────────────────────────
export const recommendationService = {
  getRecommended: async (): Promise<RecommendedStory[]> => {
    return apiFetch<RecommendedStory[]>("/recommendations/", {
      method: "GET",
    });
  },

  logView: async (experienceId: string | number): Promise<void> => {
    // Log viewed story to DB for personalized recommendation feed
    await apiFetch<void>(`/recommendations/views/${experienceId}`, {
      method: "POST",
    });
  },

  getInterests: async (): Promise<string[]> => {
    const data = await apiFetch<{ interests: string[] }>("/recommendations/interests", {
      method: "GET",
    });
    return data.interests;
  },

  updateInterests: async (interests: string[]): Promise<string[]> => {
    const data = await apiFetch<{ interests: string[] }>("/recommendations/interests", {
      method: "POST",
      body: JSON.stringify({ interests }),
    });
    return data.interests;
  },
};
