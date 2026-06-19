# Veilory

Veilory is a web application designed to archive and search human experiences by emotional resonance and meaning. Rather than matching keyword strings, Veilory uses semantic search to connect users with narratives and lived experiences of others who have gone through similar life paths, challenges, or transitions.

## 🌌 The Problem
Standard search engines optimize for commercial intent and exact syntax matches. When someone searches for guidance on a personal challenge (e.g., "coping with exam failure" or "struggling with startup burnout"), they often receive search-engine-optimized articles, listicles, or generic advice pages.

Veilory aims to solve this by providing:
1. **Lived Experiences**: Authentic stories shared by people who navigated similar circumstances.
2. **Structural Reflection**: Summaries, lessons learned, and why a specific experience was meaningful.
3. **Privacy Control**: Custom options to share experiences publicly, anonymously, or keep them private.

## 💡 Features
* **Semantic Search**: Powered by dense vectors to locate experiences by feeling and meaning.
* **AI Reflections Sidebar**: Automatic extraction of themes, primary/secondary emotions, key lessons, and a visualization of the emotional transition (`Initial State → Catalyst → Outcome`).
* **Personalized Recommendations**: A content feed recommended based on user-selected interest tags, search history, and reading activity.
* **Access & Rate Limiting**: Simple daily search tracking rules for guest and free registered users.

## 🛠️ Tech Stack
* **Frontend**: Next.js 15 (React, TypeScript), styled with Vanilla CSS (Apple Journal/Medium-inspired design) and Framer Motion.
* **Backend**: FastAPI (Python 3.11+).
* **Database**: PostgreSQL (with SQLAlchemy ORM and Alembic migrations). SQLite is used locally.
* **Vector Search**: ChromaDB using `sentence-transformers` (`all-MiniLM-L6-v2`) for generating and indexing 384-dimensional text embeddings. Includes a deterministic hash fallback for offline or GPU-restricted environments.
* **Emotion Classification**: Keyword scoring fallback and DistilBERT-based MNLI classifier for tags mapping.

## ⚡ Setup & Run

### Prerequisites
* Python 3.11+
* Node.js 18+

### 1. Backend Setup
```bash
cd backend

# Create & activate virtual env
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed base experiences
python seed_experiences.py

# Start uvicorn
python -m uvicorn app.main:app --reload
```
Swagger docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The application will run at `http://localhost:3000`.

## ⚙️ Deployment
* **Backend**: Dockerized and configured for deployment on Render (see `Dockerfile` and `render.yaml`).
* **Frontend**: Optimized for Vercel deployment.
