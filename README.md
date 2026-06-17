# Veilory — AI-Powered Emotional Wisdom Search Engine

Veilory is a professional-grade full-stack web application designed to preserve and explore the emotional library of humanity. Instead of matching keywords, Veilory allows users to search human lived experiences by **emotion and meaning**, helping people find guidance from others who have walked similar paths.

---

## 🌌 The Problem
Traditional search engines are designed to match keywords and optimize for commercial intent. When a user searches a phrase like *"I failed my placement exams"* or *"struggling with founder burnout,"* standard search engines return SEO-optimized articles, lists, or dry medical/academic pages. 

They fail to surface:
1. **Lived Human Experience**: Real stories of people who went through the exact same struggle.
2. **Contextual Significance**: Why a setback occurred, what lesson it contained, and how the emotional state evolved.
3. **Actionable Emotional Wisdom**: Structured takeaways and cognitive reframings.

Traditional keyword search isolates users. Veilory connects them to the collective emotional wisdom of humanity.

---

## 💡 The Solution
Veilory is an AI-powered human experience repository and semantic search engine. Users share their stories (publicly, anonymously, or privately) and our local AI pipelines automatically extract:
* **Primary and Secondary Emotions** with confidence scores.
* **The Main Theme** (e.g., *Workplace Burnout*, *Relationship Healing*) and theme confidence.
* **Reflections & Summaries**: Multi-length summaries and why this experience matters.
* **Actionable Lessons Learned**: Takeaways and key lessons.
* **Emotional Journey Flow**: Visualizing the transition from `Initial State → Catalyst → Outcome`.

---

## 🛠️ Technology Stack
Veilory is built using a modern, fast, and 100% locally runnable stack:

* **Frontend**: Next.js 16 (React, TypeScript), styled with a warm, editorial Vanilla CSS aesthetic (Apple Journal & Medium inspired), animated with Framer Motion.
* **Backend**: FastAPI (Python 3.11+), structured with clean domain boundaries and Dependency Injection.
* **Database**: PostgreSQL (emulated locally via SQLite) mapped through SQLAlchemy ORM, managed with Alembic database migrations.
* **Vector Database**: ChromaDB storing and querying 384-dimensional dense vectors using Cosine Similarity metrics.
* **AI Layer**: 
  - `sentence-transformers` using the `all-MiniLM-L6-v2` model for generating dense representations of stories, search queries, and recommendations.
  - Zero-shot classification pipeline (`typeform/distilbert-base-uncased-mnli`) with rules-based fallback for lightning-fast offline emotion classification.

---

## ⚡ Quick Start & Setup

### Prerequisites
* Python 3.11+
* Node.js 18+
* npm or yarn

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed the database (112 realistic experiences)
python seed_experiences.py

# Run FastAPI server
python -m uvicorn app.main:app --reload
```
The FastAPI documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
The application will launch at `http://localhost:3000`.

---

## 🧠 Core AI Architecture

```
User Story ──> [Emotion Service] ──> Primary/Secondary Emotions
             ──> [Wisdom Service] ──> Theme, Lessons, Journey, Summary
             ──> [Embedding Service] ──> 384d Vector (all-MiniLM-L6-v2)
             ──> [ChromaDB Indexer] ──> Stored in Vector DB
             ──> [SQL Database] ──> Persisted metadata & columns
```

1. **Emotion Classifier**: Classifies content keywords and patterns into structured emotions with confidence ratios.
2. **Wisdom Panel Generator**: Synthesizes the core theme, lessons learned, and why a story matters.
3. **Sentence Transformers**: Generates embeddings for stories, search inputs, and interests.
4. **ChromaDB**: Houses vector representations.
5. **Personalized Recommendations**: Evaluates interest vectors, viewed history tags, and search keywords to output curated recommendations with explanatory reasons.

---

## 🗺️ Future Roadmap
* **Offline Transformer Pipelines**: Ship full ONNX-runtime local models in the client browser for zero-latency client-side wisdom generation.
* **Voice Reflection diary**: Allow users to dictate their experiences orally, applying transcription models (Whisper) before AI insights extraction.
* **Wisdom graphs**: Map similar stories in a visual, interactive 3D nodes graph to help users navigate overlapping emotional journeys.
