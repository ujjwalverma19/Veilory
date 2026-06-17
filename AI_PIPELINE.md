# local AI Processing Pipeline

This document explains the end-to-end local artificial intelligence pipeline powering Veilory's search, classification, recommendations, and wisdom extraction engines.

---

## 1. Pipeline Overview

```
[Raw Story] 
    │
    ├──> [Emotion Service] ──────> Primary & Secondary Emotions (DistilBERT/Rules)
    │
    ├──> [Wisdom Service] ───────> Theme, Lesson, Summaries, Journey Extraction
    │
    └──> [Embedding Service] ────> 384d Dense Vector (all-MiniLM-L6-v2)
             │
             └──> [ChromaDB Store] ──> Indexed in Cosine Similarity Space
```

---

## 2. Component Pipeline Details

### 2.1 Ingestion & Local Emotion Classification
When a story is created or edited, it passes through the **Emotion Service**:
* **Hugging Face Model (Zero-Shot Classifier)**: Utilizes `typeform/distilbert-base-uncased-mnli` to evaluate stories against our emotional taxonomy (`lost`, `anxiety`, `motivation`, `self_doubt`, `resilience`, `confidence`, `failure`, `heartbreak`, `burnout`, `growth`).
* **Fast Local Fallback (Rules-Based Scorer)**: If weight downloads fail or the system runs offline, a custom keyword frequency and sentiment parser executes. It evaluates weights across emotion dictionaries and calculates a normalized confidence ratio (e.g. `0.75`), guaranteeing 100% uptime.

### 2.2 Semantic Vectorization (Embedding Generation)
To support semantic search by meaning rather than syntax, the text is converted into dense numerical vectors:
* **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` runs locally via the `SentenceTransformer` library.
* **Vector Output**: Converts title and story content into a **384-dimensional floating-point array**.
* **Seed-Based Fallback**: Generates unit-normalized vectors deterministically using MD5 hashes of the text to prevent system crashes in resource-constrained or CPU-only test environments.

### 2.3 ChromaDB Storage & Vector Indexing
The generated embedding and metadata are saved in the vector database:
* **Database Engine**: `ChromaDB` running a local persistent client.
* **Collections**:
  - `experiences`: Stores public experiences for general search and related queries.
  - `recommendations`: Used for user-profile recommendations matching.
* **Index Configuration**: Configured with the **Cosine Distance** metric (`{"hnsw:space": "cosine"}`) to calculate similarity based on vector angles rather than lengths.

### 2.4 Semantic Search Execution
When a user submits a search query:
1. **Query Embedding**: The search string is embedded using the same `all-MiniLM-L6-v2` transformer pipeline.
2. **Vector Query**: ChromaDB retrieves the top 10 closest matches based on Cosine Similarity.
3. **Serialization & Explanations**: Mismatched privacy records are filtered. An explanation generator evaluates tag overlap and main themes to formulate dynamic match explanations, e.g. *"Matched because this story discusses exam and themes of academic challenge."*
4. **Deduplication**: Result listings are filtered using a `seen_ids` set to prevent duplicate database rows.
5. **Keyword Fallback**: If ChromaDB fails, a SQL wildcard query runs across titles and contents, scoring matches programmatically.

### 2.5 Personalized Recommendation Engine
Personalized feeds are generated on-demand without external trackers:
* **Interest Filtering**: Matches experiences with user-selected interest tags.
* **Search Context Matching**: Evaluates keywords from the user's recent search history.
* **Reading History Tracking**: Extracts tags from the user's viewed stories.
* **Scoring Logic**:
  - *Interest + Search Match*: Score +15.0 (Reason: *"Recommended because you searched for '[query]' and are interested in [interest]."*)
  - *Search Match only*: Score +10.0 (Reason: *"Recommended because you searched for '[query]'."*)
  - *Interest Match only*: Score +8.0 (Reason: *"Recommended because of your interest in [interest]."*)
  - *Reading History Match*: Score +3.0 (Reason: *"Recommended because you read similar [tag] stories."*)
  - *General curated*: Score +1.0 (Reason: *"Curated reading recommendation for your personal growth."*)
* **Deduplication & Sorting**: The experiences are sorted by score descending, deduplicated by ID, and the top 4 are returned.

### 2.6 Wisdom Reflection Panel Extraction
To increase recruiter confidence in AI-generated insights, a custom extraction engine parses titles and contents:
* **Theme Categories**: Matches keywords to classify stories into themes such as *Academic Challenge*, *Relationship Healing*, *Career Setback*, *Workplace Burnout*, *Emotional Resilience*, or *Personal Growth*.
* **Why This Story Matters**: Formulates a structural significance description tailored to the theme.
* **Lessons & Summaries**: Outputs dual-length summaries (Short for cards, Medium for sidebars) and three lessons learned.
* **Journey Chain**: Visualizes the emotional transition from `Initial State` (e.g. Self Doubt) through `Catalyst` (e.g. Reflection) to `Outcome` (e.g. Growth).
* **Theme Confidence**: Computes confidence level based on vocabulary density, length, and tag consistency.
