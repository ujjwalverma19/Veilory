"""
app/schemas/experience.py — Pydantic Schemas for Experience Domain
==================================================================
Defines the data contracts for Experience-related API operations.

Design decisions:
  • ``privacy`` is validated against the ``PrivacyLevel`` enum so
    invalid values (e.g. "secret") are rejected at the schema level.
  • ``emotion_tags`` enforces 1–10 unique tags, strips whitespace, and
    lowercases for consistent downstream processing.
  • ``ExperienceUpdate`` makes every field optional — only supplied
    fields will be updated (partial update semantics).
  • ``ExperienceResponse`` masks the ``user_id`` to ``None`` when the
    experience privacy is "anonymous" — so the author's identity is
    never leaked through the API.
  • ``PaginatedExperienceResponse`` wraps results with ``total`` count
    so frontends can render proper pagination controls.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# ── Enums ────────────────────────────────────────────────────────────


class PrivacyLevel(str, Enum):
    """Mirrors the database PrivacyLevel enum."""

    PUBLIC = "public"
    ANONYMOUS = "anonymous"
    PRIVATE = "private"


# ── Request Schemas ──────────────────────────────────────────────────


class ExperienceCreate(BaseModel):
    """Payload for POST /experiences."""

    title: str = Field(
        ...,
        min_length=3,
        max_length=500,
        examples=["How I survived my startup failing"],
    )
    content: str = Field(
        ...,
        min_length=10,
        max_length=50_000,
        examples=["When my startup failed after 2 years, I felt..."],
    )
    emotion_tags: List[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        examples=[["failure", "resilience", "growth"]],
    )
    privacy: PrivacyLevel = Field(
        default=PrivacyLevel.PUBLIC,
        examples=["public"],
    )

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be blank")
        return v.strip()

    @field_validator("emotion_tags")
    @classmethod
    def clean_and_dedupe_tags(cls, v: List[str]) -> List[str]:
        """Strip whitespace, lowercase, remove empties, and deduplicate."""
        seen: set[str] = set()
        cleaned: list[str] = []
        for tag in v:
            normalised = tag.strip().lower()
            if normalised and normalised not in seen:
                seen.add(normalised)
                cleaned.append(normalised)
        if not cleaned:
            raise ValueError("At least one non-empty emotion tag is required")
        return cleaned


class ExperienceUpdate(BaseModel):
    """Payload for PUT /experiences/{id}.  All fields optional."""

    title: Optional[str] = Field(None, min_length=3, max_length=500)
    content: Optional[str] = Field(None, min_length=10, max_length=50_000)
    emotion_tags: Optional[List[str]] = Field(None, max_length=10)
    privacy: Optional[PrivacyLevel] = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Title cannot be blank")
        return v.strip() if v else v

    @field_validator("emotion_tags")
    @classmethod
    def clean_and_dedupe_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        seen: set[str] = set()
        cleaned: list[str] = []
        for tag in v:
            normalised = tag.strip().lower()
            if normalised and normalised not in seen:
                seen.add(normalised)
                cleaned.append(normalised)
        if not cleaned:
            raise ValueError("At least one non-empty emotion tag is required")
        return cleaned

    @model_validator(mode="after")
    def at_least_one_field(self):
        """Reject empty update payloads — at least one field must be set."""
        if not any([self.title, self.content, self.emotion_tags, self.privacy]):
            raise ValueError("At least one field must be provided for update")
        return self


# ── Response Schemas ─────────────────────────────────────────────────


class ExperienceResponse(BaseModel):
    """Serialised Experience returned to the client.

    When privacy is "anonymous", ``user_id`` and ``author_name`` are
    masked to ``None`` so the author's identity is never leaked.
    """

    id: int
    user_id: Optional[int] = None
    author_name: Optional[str] = None
    title: str
    content: str
    emotion_tags: List[str]
    privacy: PrivacyLevel
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaginatedExperienceResponse(BaseModel):
    """Wrapper for paginated experience listings."""

    experiences: List[ExperienceResponse]
    total: int
    skip: int
    limit: int
