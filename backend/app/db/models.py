"""
app/db/models.py — SQLAlchemy ORM Models
========================================
Defines three database tables:

  1. **users** — registered accounts.
  2. **experiences** — user-submitted life lessons / stories.
  3. **search_history** — log of semantic search queries.

Design decisions:
  • ``privacy`` uses a PostgreSQL Enum type (``PrivacyLevel``) so invalid
    values are rejected at the database level, not just the API layer.
  • ``ARRAY(String)`` stores emotion tags natively in PostgreSQL — no
    join table needed for this simple list.
  • ``server_default=func.now()`` lets PostgreSQL set the timestamp,
    avoiding clock-skew issues between app servers.
  • ``onupdate=func.now()`` is handled with ``server_default`` +
    explicit update in the CRUD layer because SQLAlchemy's ``onupdate``
    only fires from Python, not raw SQL.
  • All foreign keys cascade deletes: when a user is removed, their
    experiences and search history are cleaned up automatically.
"""

import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base
from sqlalchemy import TypeDecorator
import json

class SQLiteArray(TypeDecorator):
    """JSON-serialised string fallback for SQLite array emulation."""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        try:
            return json.loads(value)
        except Exception:
            return []


# ── Enums ────────────────────────────────────────────────────────────


class PrivacyLevel(str, enum.Enum):
    """Allowed privacy levels for an experience."""

    PUBLIC = "public"
    ANONYMOUS = "anonymous"
    PRIVATE = "private"


# ── Models ───────────────────────────────────────────────────────────


class User(Base):
    """A registered Veilory user."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    email = Column(String(320), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Phase 5 Additions (Tier, Limits, Interests)
    tier = Column(String(50), nullable=False, default="free", server_default="free")
    daily_search_count = Column(Integer, nullable=False, default=0, server_default="0")
    search_limit = Column(Integer, nullable=False, default=50, server_default="50")
    last_search_date = Column(String(50), nullable=True)
    interests = Column(ARRAY(String).with_variant(SQLiteArray, "sqlite"), nullable=False, default=list)

    # Relationships
    experiences = relationship(
        "Experience",
        back_populates="author",
        cascade="all, delete-orphan",
    )
    search_history = relationship(
        "SearchHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    viewed_stories = relationship(
        "ViewedStory",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    helpful_votes = relationship(
        "HelpfulVote",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"


class Experience(Base):
    """A user-submitted life experience / story / lesson."""

    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=False)
    emotion_tags = Column(ARRAY(String).with_variant(SQLiteArray, "sqlite"), nullable=False, default=list)
    privacy = Column(
        Enum(PrivacyLevel, name="privacy_level", create_constraint=True),
        nullable=False,
        default=PrivacyLevel.PUBLIC,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Phase 5 Additions (Analytics & Cached Counters)
    views_count = Column(Integer, nullable=False, default=0, server_default="0")
    helpful_count = Column(Integer, nullable=False, default=0, server_default="0")

    # Phase 6 Additions (AI & Vector Database References)
    primary_emotion = Column(String(100), nullable=True)
    secondary_emotions = Column(ARRAY(String).with_variant(SQLiteArray, "sqlite"), nullable=False, default=list)
    emotion_confidence = Column(Float, nullable=True)
    embedding_reference_id = Column(String(255), nullable=True)

    # Relationships
    author = relationship("User", back_populates="experiences")
    viewed_records = relationship(
        "ViewedStory",
        back_populates="experience",
        cascade="all, delete-orphan",
    )
    helpful_records = relationship(
        "HelpfulVote",
        back_populates="experience",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Experience(id={self.id}, title='{self.title[:30]}')>"


class SearchHistory(Base):
    """Records every semantic search a user performs."""

    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,       # Allow anonymous searches
        index=True,
    )
    query = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="search_history")

    def __repr__(self) -> str:
        return f"<SearchHistory(id={self.id}, query='{self.query[:30]}')>"


class ViewedStory(Base):
    """Log of story views by users."""

    __tablename__ = "viewed_stories"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    experience_id = Column(
        Integer,
        ForeignKey("experiences.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="viewed_stories")
    experience = relationship("Experience", back_populates="viewed_records")

    def __repr__(self) -> str:
        return f"<ViewedStory(user_id={self.user_id}, experience_id={self.experience_id})>"


class HelpfulVote(Base):
    """Log of helpfulness votes by users."""

    __tablename__ = "helpful_votes"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    experience_id = Column(
        Integer,
        ForeignKey("experiences.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="helpful_votes")
    experience = relationship("Experience", back_populates="helpful_records")

    def __repr__(self) -> str:
        return f"<HelpfulVote(user_id={self.user_id}, experience_id={self.experience_id})>"
