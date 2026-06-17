# Portfolio Case Study — Veilory

Veilory is an AI-powered human experience repository and semantic search engine designed to preserve and explore emotional wisdom. It serves as a modern showcase project demonstrating advanced search technologies, full-stack systems engineering, and product-focused AI design.

---

## 1. The Problem: The Inability of Keyword Search to Surface Wisdom

When someone faces a heavy life challenge—such as university exam failure, corporate burnout, or the collapse of a startup—their immediate instinct is to look for guidance. However, traditional search engines fail them:
* **The SEO Problem**: A query like *"failing my placement exam"* returns commercial boot camps, counseling ads, or generic advice blogs.
* **The Syntax Limit**: Standard database queries require exact word matches (e.g. searching "redundant" won't find a story about a "layoff"), isolating users from relevant experiences written in different vocabularies.
* **The Lack of Context**: Simple search results do not explain *why* a story is relevant, what *lessons* were learned, or how the author's *emotional journey* evolved from panic to growth.

---

## 2. The Vision: The Emotional Library of Humanity

Veilory solves this by building an AI-powered search engine. Users share their stories (under customizable privacy tiers) and our local processing pipelines automatically extract, vectorize, and index the wisdom:
* **Discoverability**: Search by meaning and emotion rather than keyword matching.
* **Reflections Sidebar**: Provides recruiters and users with structured insights on themes, lessons learned, and why a story matters.
* **Transparency**: Displays Theme Confidence (e.g., `92%`) and AI explanations (`Matched because...`) to build trust in automated reflections.
* **Visual Journey Flow**: Maps emotional transitions from `Initial State → Catalyst → Outcome`.

---

## 3. Product & UI Decisions

### 3.1 Warm Editorial Aesthetic
We discarded standard dark cyberpunk tech themes in favor of a warm, human-centric design. Inspired by **Apple Journal** and **Medium**, Veilory features:
* A warm cream background (`#faf8f5`) and dark charcoal typography (`#1a1a1a`).
* Premium serif headers (Georgia) and generous text leading (`leading-[2.0]`) to ensure reading comfort for long-form journal entries.
* Borderless open-sheet layouts that feel like reading a personal journal.

### 3.2 search Limit System
To prepare the application for business monetization, we built a search limit tracker:
* **Guests**: 10 searches per day.
* **Free Tier Users**: 50 searches per day.
* **Premium Tier Users**: Unlimited searches and recommendations (future subscription model, architected to require zero database schema changes).

---

## 4. Technical Design & Challenges Solved

### 4.1 SQLite Array Migration Obstacle
SQLite does not natively support array types, which are used to store emotion tags and lessons lists. While SQLAlchemy can emulate lists using JSON strings, running Alembic database migrations on existing SQLite databases often crashes during table alterations with non-nullable constraints.
* **Solution**: Mapped custom `SQLiteArray` type decorators that fall back to JSON serialization. In migrations, we utilized Alembic batch operations with a `server_default='[]'` constraint to ensure that existing database rows migrated successfully without losing structural integrity.

### 4.2 Local AI Stability with Vector Fallbacks
Deploying AI applications locally for demonstration purposes introduces environment-specific risks (e.g. CPU-only systems, lack of PyTorch GPU support, or network firewalls blocking Hugging Face model weight downloads).
* **Solution**: Programmed deterministic, CPU-safe mathematical fallbacks:
  - For embeddings, a seed-based hash generator creates 384-dimensional unit-length vectors.
  - For emotion classification, a weighted keyword parser calculates sentiment values.
  - This ensures that recruiters can execute the seeder and semantic search immediately without downloading gigabytes of model weights.

### 4.3 Strict Deduplication Constraints
When combining search results, related story feeds, and recommendation listings, SQL joins and vector nearest-neighbor queries often return duplicate rows if a user writes similar stories or tests the system repeatedly.
* **Solution**: Developed local deduplication layers using Python `seen_ids` sets across `/search/semantic`, `/recommendations/`, and `/experiences/{id}/related` routers. This ensures that every listing returns unique experiences.

---

## 5. Architectural Diagram

```
[ Next.js Client ] ──(REST API)──> [ FastAPI Application ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [ SQLAlchemy ORM ]                                  [ AI Service Layer ]
                 │                                               │
                 ▼                                               ▼
       [ SQLite / Postgres ]                            [ ChromaDB Vector Store ]
  (Users, Metadata, Analytics)                           (Experiences Embeddings)
```

---

## 6. How to Evaluate This Showcase Project

1. **Verify the Dataset**: Check that the database contains the 112 unique experiences populated by `seed_experiences.py`.
2. **Execute Semantic Queries**: Search for phrases like *"I made a mistake at work and got fired"* or *"I failed my university finals"* on the Explore page, noting that the system matches concepts even if the exact words differ.
3. **Inspect the AI panel**: Open any story details page, checking that the Reflections sidebar renders Theme Confidence, lessons learned, and the `Initial State → Catalyst → Outcome` journey chain.
4. **Customized Recommendations**: Update your interest tags on the Dashboard and notice how the feed recommends relevant stories with personalized reasons.
