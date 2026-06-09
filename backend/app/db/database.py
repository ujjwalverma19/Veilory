"""
app/db/database.py — SQLAlchemy Engine & Session Factory
========================================================
Creates a single engine and session factory for the entire application.
The ``get_db`` generator is used as a FastAPI dependency to provide a
per-request database session with automatic cleanup.

Design decisions:
  • ``pool_pre_ping=True`` ensures stale connections (e.g. after a
    Postgres restart) are detected and recycled instead of causing 500s.
  • The ``Base`` declarative class is defined here so every model module
    can import it from one canonical location.
  • ``get_db`` uses a try/finally pattern to guarantee the session is
    closed even if the request handler raises an exception.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,       # detect stale connections before checkout
    pool_size=10,              # max persistent connections in the pool
    max_overflow=20,           # additional connections under burst load
    echo=False,                # set True for SQL debugging
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a database session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
