# System Design Document

This document outlines the system requirements, engineering design choices, database architectures, and scalability strategies for Veilory.

---

## 1. Requirements

### 1.1 Functional Requirements
* **Story Sharing & CRUD**: Users can create, read, update, and delete experiences with privacy tiers (`public`, `anonymous`, `private`).
* **Semantic Search**: Users search for stories by meaning and feeling, receiving AI-generated query insights and match explanations.
* **AI Reflections Panel**: Displays themes, confidences, lessons, dual-length summaries, and an `Initial State → Catalyst → Outcome` journey flow on story pages.
* **Personalized Recommendations**: Evaluates interests, views, and search history to recommend stories with dynamic reasons.
* **Usage Limits**: Tracks and restricts searches for guest users (10/day) and free logged-in users (50/day), preparing for a `premium` tier (unlimited).

### 1.2 Non-Functional Requirements
* **Data Security & Privacy**: Anonymous stories must mask author information at the API serializer level, and private stories must be restricted to the author.
* **Local Offline Fallback**: All embedding, classification, and vector indexing must run 100% locally with offline fallbacks to ensure development safety and 100% uptime without external SaaS dependencies.
* **Deduplication**: Result feeds (search, recommendations, related stories) must have strict deduplication constraints.
* **Performance**: Search and details queries must resolve in sub-200ms latency under local execution.

---

## 2. Relational Database Design

Veilory uses SQLAlchemy to map ORM models. The database is SQLite locally and PostgreSQL in production, migrated via Alembic scripts.

### 2.1 Schema Definition: `experiences` table
| Column Name | Data Type | Nullable | Description / Design Decision |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | Primary key. |
| `user_id` | Integer | No | Foreign Key to `users.id` (Cascades on delete). |
| `title` | String(500) | No | Indexed column. |
| `content` | Text | No | Story body. |
| `emotion_tags` | Array / SQLiteArray | No | Trimmed, lowercase list of emotion tags. |
| `privacy` | Enum(PrivacyLevel) | No | Enforces public, anonymous, or private access. |
| `views_count` | Integer | No | Cached view analytics counter. |
| `helpful_count` | Integer | No | Cached helpful vote analytics counter. |
| `primary_emotion`| String(100) | Yes | Cached primary emotion from classifier. |
| `secondary_emotions`| Array / SQLiteArray | No | Cached secondary emotions from classifier. |
| `main_theme` | String(255) | Yes | Extracted main theme category. |
| `theme_confidence`| Float | Yes | Percentage confidence in theme match. |
| `why_matters` | Text | Yes | Explanatory statement of significance. |
| `short_summary` | Text | Yes | Card-length summary. |
| `medium_summary` | Text | Yes | Details-length summary. |
| `key_lesson` | Text | Yes | Central takeaway quote. |
| `lessons_learned` | Array / SQLiteArray | No | Actionable takeaway bullet points list. |
| `emotion_initial` | String(100) | Yes | Start emotion of journey. |
| `emotion_catalyst`| String(100) | Yes | Turning point of journey. |
| `emotion_outcome` | String(100) | Yes | Resolution emotion of journey. |

---

## 3. Semantic Search Design

Traditional keyword search fails when users describe issues using non-overlapping vocabularies. Veilory resolves this using vector databases:
1. **Model**: `all-MiniLM-L6-v2` encodes strings into 384-dimensional dense vectors.
2. **Indexing**: ChromaDB creates HNSW graphs in a cosine similarity metric space:
   $$D_{\text{cosine}}(A, B) = 1 - \frac{A \cdot B}{\|A\| \|B\|}$$
3. **Execution**: The query is embedded, queried against the collection, and IDs are resolved back to the SQL database.
4. **Fallback Scorer**: If vector services are offline, a wildcard SQL query is combined with a scoring loop checking tags and keyword weights to mimic similarity rankings.

---

## 4. Scalability & Production Strategy

### 4.1 Caching Analytics Counters
Running aggregate SQL queries (`COUNT`) to load views and helpful counts on search listings slows down the system. Veilory uses **cached counters** on the `experiences` table (`views_count`, `helpful_count`) updated incrementally during user actions.

### 4.2 HNSW Indexing Parameters
ChromaDB uses Hierarchical Navigable Small World (HNSW) graphs. For production databases with thousands of stories, search parameters can be optimized:
* `hnsw:space = cosine` (standardizes vector lengths).
* `hnsw:construction_ef` (balances indexing speed vs query accuracy).

### 4.3 HttpOnly Cookies Migration
For production, the authentication architecture is prepared to migrate from localStorage JWT storage to **HttpOnly Secure Cookies** to prevent Cross-Site Scripting (XSS) token theft. The frontend client wrapper (`apiFetch` in `frontend/src/lib/api.ts`) isolates credential logic, requiring zero changes in page files.

---

## 5. Future Roadmap
* **Quantized Local Embeddings**: Run WebAssembly-based Sentence Transformers directly in the client browser, reducing backend CPU load to zero.
* **Wisdom Graphs**: Create interactive 3D graphs connecting overlapping emotional journeys across categories.
* **Audio Voice diary**: Integrate Whisper speech-to-text models to allow users to dictate stories, extracting AI reflections automatically.
