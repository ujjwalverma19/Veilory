/**
 * Types and interfaces for Veilory Domain Model
 */

export type PrivacyLevel = "Public" | "Anonymous" | "Private" | "public" | "anonymous" | "private";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  tier?: "free" | "premium";
  daily_search_count?: number;
  search_limit?: number;
  interests?: string[];
  profile_picture?: string;
  auth_provider?: string;
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
  views_count?: number;
  helpful_count?: number;
  primary_emotion?: string | null;
  secondary_emotions?: string[];
  emotion_confidence?: number | null;
  embedding_reference_id?: string | null;
  main_theme?: string | null;
  theme_confidence?: number | null;
  why_matters?: string | null;
  short_summary?: string | null;
  medium_summary?: string | null;
  key_lesson?: string | null;
  lessons_learned?: string[];
  emotion_initial?: string | null;
  emotion_catalyst?: string | null;
  emotion_outcome?: string | null;
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
  explanation?: string;
}

export interface SearchQueryResponse {
  query: string;
  insight: AIInsight;
  results: SearchResult[];
}

/**
 * Future AI & Semantic Search Pipeline Contracts
 * Prepared for ChromaDB vector database, Sentence Transformers (embeddings), and NLP classification.
 */

export interface EmbeddingVector {
  values: number[]; // e.g., 384-dimensional for all-MiniLM-L6-v2, 1536 for text-embedding-3-small
  dimension: number;
}

export interface AIModelMetadata {
  model_name: string; // e.g., "all-MiniLM-L6-v2" or "gpt-4o"
  tokens_used?: number;
  latency_ms?: number;
}

export interface EmotionClassification {
  emotion: string; // e.g., "anxiety", "lost", "resilience"
  confidence: number; // 0.0 to 1.0
}

export interface SemanticSearchPayload {
  query: string;
  embedding?: EmbeddingVector;
  threshold?: number; // cosine similarity cutoff (e.g., 0.7)
  top_k?: number; // limit of results
}

export interface RelatedExperiencesPayload {
  experience_id: string;
  related: {
    experience: Experience;
    score: number; // cosine similarity
    shared_emotion_nodes: string[];
  }[];
}

