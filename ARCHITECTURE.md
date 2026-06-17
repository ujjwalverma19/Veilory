# System Architecture

This document details the multi-tiered system design of Veilory, outlining boundaries, data flows, and structural relationships.

---

## 1. High-Level Component Boundaries

```mermaid
graph TD
    subgraph Frontend ["Client Tier (Next.js)"]
        UI["Web Pages & Views (Explore, Details, Dashboard)"]
        API_Client["API Service Client (fetch wrapper)"]
        UI --> API_Client
    end

    subgraph Backend ["Application Tier (FastAPI)"]
        Router["API Routers (v1/search, v1/experiences, v1/recommendations)"]
        AuthService["JWT Authentication Service"]
        CRUD["SQL CRUD Managers"]
        
        Router --> AuthService
        Router --> CRUD
    end

    subgraph Database ["Persistence Tier (PostgreSQL / SQLite)"]
        SQL_DB[("SQL Database (users, experiences, viewed_stories, helpful_votes)")]
        CRUD --> SQL_DB
    end

    subgraph AI_Layer ["AI & Vector Intelligence Layer"]
        EmotionService["Emotion Detection Service"]
        WisdomService["Wisdom Reflection Service"]
        EmbeddingService["Embedding Generation (all-MiniLM-L6-v2)"]
        ChromaDB[("ChromaDB Vector Store (experiences, recommendations)")]
        
        Router --> EmotionService
        Router --> WisdomService
        Router --> EmbeddingService
        EmbeddingService --> ChromaDB
    end
```

---

## 2. Request & Execution Lifecycles

### 2.1 Story Creation & Indexing Flow
When a user submits a story, it is stored in the relational database, processed through the local NLP extractors, vectorized, and indexed in ChromaDB.

```mermaid
sequenceDiagram
    participant User as Web UI
    participant Router as API Router
    participant DB as SQL Database
    participant AI as Emotion/Wisdom Services
    participant Embed as Embedding Service
    participant Chroma as ChromaDB Vector Store

    User->>Router: POST /experiences/ (title, content, tags)
    Router->>DB: Write base experience row (commit)
    Router->>AI: Detect primary/secondary emotions & extract wisdom properties
    AI-->>Router: Return theme, lesson, summaries, journey stages
    Router->>Embed: Generate 384d embedding of text (all-MiniLM-L6-v2)
    Embed-->>Router: Return vector array
    Router->>Chroma: Index document & vector (upsert doc_id)
    Chroma-->>Router: Acknowledge index success
    Router->>DB: Update experience row with AI fields & reference ID
    DB-->>Router: Commit transaction & refresh
    Router->>User: Return serialized ExperienceResponse
```

### 2.2 Semantic Search Flow
When a user inputs a search query, it is embedded, queried against ChromaDB, matched, deduplicated, and enriched with explanations before returning to the user.

```mermaid
sequenceDiagram
    participant User as Web UI
    participant Router as API Router
    participant Embed as Embedding Service
    participant Chroma as ChromaDB Vector Store
    participant DB as SQL Database

    User->>Router: POST /search/semantic (query)
    Router->>Embed: Generate query vector
    Embed-->>Router: Return vector
    Router->>Chroma: Query Cosine similarity (limit 10)
    Chroma-->>Router: Return matched document IDs and distances
    Router->>DB: Load matching Experience rows (with privacy filters)
    DB-->>Router: Return database records
    Router->>Router: Deduplicate & calculate explanation text ("Matched because...")
    Router->>User: Return SearchQueryResponse (insights + matched results)
```

---

## 3. Database Schema Layout

The relational database schema is structured around five core tables:
* **users**: Stores authentication credentials, tier details (`free` or `premium`), interests array, and daily search limits.
* **experiences**: Stores user-submitted stories with primary/secondary emotions, theme, why it matters, lessons, summaries, and journey stages.
* **search_history**: Logs user queries for analytics and search limits tracking.
* **viewed_stories**: Logs reading history to train the recommendation engine.
* **helpful_votes**: Tracks helpful counts on stories.

```mermaid
erDiagram
    users ||--o{ experiences : writes
    users ||--o{ search_history : logs
    users ||--o{ viewed_stories : views
    users ||--o{ helpful_votes : votes
    experiences ||--o{ viewed_stories : tracked
    experiences ||--o{ helpful_votes : tracked

    users {
        int id PK
        string name
        string email
        string password_hash
        string tier
        int daily_search_count
        int search_limit
        string last_search_date
        array interests
        datetime created_at
    }

    experiences {
        int id PK
        int user_id FK
        string title
        string content
        array emotion_tags
        string privacy
        datetime created_at
        datetime updated_at
        int views_count
        int helpful_count
        string primary_emotion
        array secondary_emotions
        float emotion_confidence
        string embedding_reference_id
        string main_theme
        float theme_confidence
        string why_matters
        string short_summary
        string medium_summary
        string key_lesson
        array lessons_learned
        string emotion_initial
        string emotion_catalyst
        string emotion_outcome
    }
```
