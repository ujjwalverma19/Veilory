"""
Database operations for the Experience model.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Experience, PrivacyLevel
from app.schemas.experience import ExperienceCreate, ExperienceUpdate


# ── Create ───────────────────────────────────────────────────────────


def create_experience(
    db: Session,
    experience_in: ExperienceCreate,
    user_id: int,
) -> Experience:
    """Insert a new experience and return the persisted instance."""
    db_experience = Experience(
        user_id=user_id,
        title=experience_in.title,
        content=experience_in.content,
        emotion_tags=experience_in.emotion_tags,
        privacy=experience_in.privacy,
    )
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience


# ── Read ─────────────────────────────────────────────────────────────


def get_experience_by_id(db: Session, experience_id: int) -> Experience | None:
    """Fetch a single experience by primary key."""
    return db.query(Experience).filter(Experience.id == experience_id).first()


def get_public_experiences(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> list[Experience]:
    """Return public experiences ordered by newest first."""
    return (
        db.query(Experience)
        .filter(Experience.privacy == PrivacyLevel.PUBLIC)
        .order_by(Experience.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_public_experiences(db: Session) -> int:
    """Return total count of public experiences (for pagination)."""
    return (
        db.query(func.count(Experience.id))
        .filter(Experience.privacy == PrivacyLevel.PUBLIC)
        .scalar()
    )


def get_user_experiences(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
) -> list[Experience]:
    """Return all experiences for a specific user (any privacy level)."""
    return (
        db.query(Experience)
        .filter(Experience.user_id == user_id)
        .order_by(Experience.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_user_experiences(db: Session, user_id: int) -> int:
    """Return total count of a user's experiences (for pagination)."""
    return (
        db.query(func.count(Experience.id))
        .filter(Experience.user_id == user_id)
        .scalar()
    )


# ── Update ───────────────────────────────────────────────────────────


def update_experience(
    db: Session,
    db_experience: Experience,
    experience_in: ExperienceUpdate,
) -> Experience:
    """Apply partial updates to an existing experience."""
    update_data = experience_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_experience, field, value)
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience


# ── Delete ───────────────────────────────────────────────────────────


def delete_experience(db: Session, db_experience: Experience) -> None:
    """Remove an experience from the database."""
    db.delete(db_experience)
    db.commit()
