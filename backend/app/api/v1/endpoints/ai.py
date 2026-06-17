"""
app/api/v1/endpoints/ai.py — Future Ready AI Endpoints
======================================================
Exposes endpoints for emotion detection, embedding generation,
and ChromaDB indexing. These are kept unexposed to the public frontend.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

from app.services.ai.emotion_service import emotion_service
from app.services.ai.embedding_service import embedding_service
from app.services.ai.vector_service import vector_service

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    title: str
    content: str

class AnalyzeResponse(BaseModel):
    primary: str
    secondary: List[str]
    confidence: float

class EmbedRequest(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    embedding: List[float]
    dimension: int

class IndexRequest(BaseModel):
    experience_id: int
    title: str
    content: str
    primary_emotion: str
    secondary_emotions: List[str]

class IndexResponse(BaseModel):
    success: bool
    document_id: str


# ── Endpoints ────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze emotions from a story",
)
def analyze_emotions(payload: AnalyzeRequest):
    """Detect primary and secondary feelings with confidence scores."""
    try:
        res = emotion_service.detect_emotions(payload.title, payload.content)
        return AnalyzeResponse(
            primary=res["primary"],
            secondary=res["secondary"],
            confidence=res["confidence"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emotion analysis failed: {str(e)}"
        )


@router.post(
    "/embed",
    response_model=EmbedResponse,
    summary="Generate 384-float text embedding",
)
def embed_text(payload: EmbedRequest):
    """Generate dense vector representation using sentence-transformers."""
    try:
        vector = embedding_service.generate_embedding(payload.text)
        return EmbedResponse(
            embedding=vector,
            dimension=len(vector)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Embedding generation failed: {str(e)}"
        )


@router.post(
    "/index",
    response_model=IndexResponse,
    summary="Index an experience directly in ChromaDB",
)
def index_experience(payload: IndexRequest):
    """Insert or update vector documents in collections."""
    try:
        doc_id = vector_service.index_experience(
            experience_id=payload.experience_id,
            title=payload.title,
            content=payload.content,
            primary_emotion=payload.primary_emotion,
            secondary_emotions=payload.secondary_emotions
        )
        return IndexResponse(success=True, document_id=doc_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ChromaDB indexing failed: {str(e)}"
        )
