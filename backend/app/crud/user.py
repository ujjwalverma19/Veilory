"""
app/crud/user.py — Data Access Layer for Users
===============================================
Pure database operations — no HTTP concerns, no business logic.

Design decisions:
  • Functions accept a ``Session`` and return model instances or ``None``.
    The calling layer (API endpoint) decides what HTTP status to return.
  • ``create_user`` hashes the password here so the model never stores
    a plaintext password, even transiently.
  • Type hints on every function for IDE support and documentation.
"""

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models import User
from app.schemas.user import UserCreate


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Fetch a user by primary key."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    """Fetch a user by email address (case-insensitive)."""
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user and return the persisted instance."""
    db_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
