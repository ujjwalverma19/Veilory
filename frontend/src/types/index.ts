/**
 * Types and interfaces for Veilory Domain Model
 */

export type PrivacyLevel = "Public" | "Anonymous" | "Private";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Experience {
  id: string;
  title: string;
  content: string;
  emotion_tags: string[];
  privacy: PrivacyLevel;
  user_id: string;
  author_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  summary: string;
  themes: string[];
  growth_steps: string[];
  reframing: string;
}

export interface SearchResult {
  experience: Experience;
  score: number; // Semantic similarity score
}

export interface SearchQueryResponse {
  query: string;
  insight: AIInsight;
  results: SearchResult[];
}
