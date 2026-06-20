"""
Database operations for the User model.
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


def get_user_by_supabase_id(db: Session, supabase_user_id: str) -> User | None:
    """Fetch a user by their Supabase UUID."""
    return db.query(User).filter(User.supabase_user_id == supabase_user_id).first()


def create_oauth_user(
    db: Session,
    email: str,
    name: str,
    supabase_user_id: str,
    display_name: str | None = None,
    profile_picture: str | None = None,
    auth_provider: str = "google",
) -> User:
    """Create a new user from verified Supabase OAuth or password signup."""
    db_user = User(
        name=name,
        email=email.lower(),
        supabase_user_id=supabase_user_id,
        display_name=display_name or name,
        profile_picture=profile_picture,
        auth_provider=auth_provider,
        password_hash=None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
