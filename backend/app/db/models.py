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
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


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
    emotion_tags = Column(ARRAY(String), nullable=False, default=list)
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

    # Relationships
    author = relationship("User", back_populates="experiences")

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
