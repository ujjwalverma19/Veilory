"""
SQLAlchemy ORM models defining the database schema.
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
    password_hash = Column(String(255), nullable=True)
    supabase_user_id = Column(String(64), unique=True, index=True, nullable=True)
    display_name = Column(String(255), nullable=True)
    profile_picture = Column(String(1024), nullable=True)
    auth_provider = Column(String(50), nullable=False, default="email", server_default="email")
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

    # Phase 7 Additions (AI Insights & Reflection Panel)
    main_theme = Column(String(255), nullable=True)
    theme_confidence = Column(Float, nullable=True)
    why_matters = Column(Text, nullable=True)
    short_summary = Column(Text, nullable=True)
    medium_summary = Column(Text, nullable=True)
    key_lesson = Column(Text, nullable=True)
    lessons_learned = Column(ARRAY(String).with_variant(SQLiteArray, "sqlite"), nullable=False, default=list)
    emotion_initial = Column(String(100), nullable=True)
    emotion_catalyst = Column(String(100), nullable=True)
    emotion_outcome = Column(String(100), nullable=True)

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
