"""
app/schemas/search.py — Pydantic Schemas for Search Domain
==========================================================
Defines data contracts for Search queries, history logs, and analytics.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.experience import ExperienceResponse


class SearchQuery(BaseModel):
    """Payload for POST /search/."""

    query: str = Field(..., min_length=1, examples=["I failed my exams"])


class AIInsight(BaseModel):
    """Reflections and reframing generated for a search query."""

    summary: str
    themes: List[str]
    growth_steps: List[str]
    reframing: str


class SearchResultItem(BaseModel):
    """A single matched experience with similarity score."""

    experience: ExperienceResponse
    score: float


class SearchQueryResponse(BaseModel):
    """Complete response returned for an explore search."""

    query: str
    insight: Optional[AIInsight] = None
    results: List[SearchResultItem]


class SearchHistoryResponse(BaseModel):
    """A log of a user's past search query."""

    id: int
    query: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PopularSearchResponse(BaseModel):
    """Aggregation entry for trending/most searched topics."""

    query: str
    count: int
