"""
app/schemas/recommendation.py — Pydantic Schemas for Recommendations
=====================================================================
Defines data contracts for personalized recommendation feeds and user interest tags.
"""

from typing import List
from pydantic import BaseModel, Field
from app.schemas.experience import ExperienceResponse


class UserInterestsUpdate(BaseModel):
    """Payload for updating user interests."""

    interests: List[str] = Field(..., max_length=15, examples=[["anxiety", "lost", "resilience"]])


class UserInterestsResponse(BaseModel):
    """Returned list of user interests."""

    interests: List[str]


class RecommendedExperienceResponse(BaseModel):
    """A recommended experience with matching reasoning and rating."""

    experience: ExperienceResponse
    reason: str
    score: float
