"""
Pydantic schemas for User-related API payloads and responses.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Request Schemas ──────────────────────────────────────────────────


class UserCreate(BaseModel):
    """Payload for POST /auth/signup."""

    name: str = Field(..., min_length=1, max_length=255, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be blank")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    """Payload for POST /auth/login (JSON body alternative)."""

    email: EmailStr
    password: str


# ── Response Schemas ─────────────────────────────────────────────────


class UserResponse(BaseModel):
    """Serialised User returned to the client."""

    id: int
    name: str
    email: EmailStr
    created_at: datetime
    tier: str = "free"
    daily_search_count: int = 0
    search_limit: int = 50
    interests: list[str] = []
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None
    auth_provider: str = "email"

    model_config = {"from_attributes": True}


# ── Token Schemas ────────────────────────────────────────────────────


class Token(BaseModel):
    """Returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded contents of an access token."""

    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None
