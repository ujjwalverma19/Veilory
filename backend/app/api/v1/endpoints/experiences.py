"""
app/api/v1/endpoints/experiences.py — Experience CRUD Endpoints
===============================================================
Full create / read / update / delete for user experiences.

Design decisions:
  • POST returns ``201 Created`` with the full resource.
  • GET /{id} checks privacy: public experiences are visible to anyone,
    private/anonymous require ownership.
  • PUT /{id} only allows the author to modify their own experience.
  • DELETE /{id} returns ``204 No Content`` with no body.
  • Pagination defaults to 20 items per page with a max of 100.
    The response includes a ``total`` count so frontends can build
    page controls.
  • Anonymous experiences mask ``user_id`` and ``author_name`` in
    the serialised response — the author's identity is never leaked.
  • A helper ``_serialize_experience`` centralises the privacy-aware
    serialisation logic so it's applied consistently across all
    endpoints.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.services.ai.emotion_service import emotion_service
from app.services.ai.vector_service import vector_service
from app.services.ai.wisdom_service import wisdom_service

logger = logging.getLogger(__name__)
from app.crud.experience import (
    count_public_experiences,
    count_user_experiences,
    create_experience,
    delete_experience,
    get_experience_by_id,
    get_public_experiences,
    get_user_experiences,
    update_experience,
)
from app.db.models import Experience, User, HelpfulVote, PrivacyLevel
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
    PaginatedExperienceResponse,
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────


def _serialize_experience(
    experience: Experience,
    current_user_id: int | None = None,
) -> ExperienceResponse:
    """Convert an ORM Experience to a response schema.

    Applies privacy rules:
      • ``public``    → user_id and author_name are visible.
      • ``anonymous`` → user_id and author_name are masked to None
                        (unless the requester IS the author).
      • ``private``   → same as public (only the author can reach this
                        code path, enforced by the endpoint).
    """
    is_owner = current_user_id is not None and experience.user_id == current_user_id
    mask = experience.privacy.value == "anonymous" and not is_owner

    return ExperienceResponse(
        id=experience.id,
        user_id=None if mask else experience.user_id,
        author_name=None if mask else experience.author.name,
        title=experience.title,
        content=experience.content,
        emotion_tags=experience.emotion_tags or [],
        privacy=experience.privacy.value,  # type: ignore
        created_at=experience.created_at,
        updated_at=experience.updated_at,
        views_count=experience.views_count,
        helpful_count=experience.helpful_count,
        primary_emotion=experience.primary_emotion,
        secondary_emotions=experience.secondary_emotions or [],
        emotion_confidence=experience.emotion_confidence,
        embedding_reference_id=experience.embedding_reference_id,
        main_theme=experience.main_theme,
        theme_confidence=experience.theme_confidence,
        why_matters=experience.why_matters,
        short_summary=experience.short_summary,
        medium_summary=experience.medium_summary,
        key_lesson=experience.key_lesson,
        lessons_learned=experience.lessons_learned or [],
        emotion_initial=experience.emotion_initial,
        emotion_catalyst=experience.emotion_catalyst,
        emotion_outcome=experience.emotion_outcome,
    )


# ── Endpoints ────────────────────────────────────────────────────────


@router.post(
    "/",
    response_model=ExperienceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Share a new experience",
)
def create(
    experience_in: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an experience linked to the authenticated user.

    The ``emotion_tags`` are automatically normalised (trimmed,
    lowercased, deduplicated) by the schema validator.
    """
    experience = create_experience(
        db=db, experience_in=experience_in, user_id=current_user.id,
    )
    
    # AI Indexing Pipeline
    try:
        emotions = emotion_service.detect_emotions(experience.title, experience.content)
        experience.primary_emotion = emotions["primary"]
        experience.secondary_emotions = emotions["secondary"]
        experience.emotion_confidence = emotions["confidence"]
        
        # Phase 7 AI Wisdom Extraction
        wisdom = wisdom_service.generate_wisdom(
            title=experience.title,
            content=experience.content,
            primary_emotion=emotions["primary"],
            secondary_emotions=emotions["secondary"]
        )
        experience.main_theme = wisdom["main_theme"]
        experience.theme_confidence = wisdom["theme_confidence"]
        experience.why_matters = wisdom["why_matters"]
        experience.short_summary = wisdom["short_summary"]
        experience.medium_summary = wisdom["medium_summary"]
        experience.key_lesson = wisdom["key_lesson"]
        experience.lessons_learned = wisdom["lessons_learned"]
        experience.emotion_initial = wisdom["emotion_initial"]
        experience.emotion_catalyst = wisdom["emotion_catalyst"]
        experience.emotion_outcome = wisdom["emotion_outcome"]
        
        doc_id = vector_service.index_experience(
            experience_id=experience.id,
            title=experience.title,
            content=experience.content,
            primary_emotion=emotions["primary"],
            secondary_emotions=emotions["secondary"]
        )
        experience.embedding_reference_id = doc_id
        db.commit()
        db.refresh(experience)
    except Exception as e:
        logger.error(f"AI Indexing Pipeline failed on create: {e}")

    return _serialize_experience(experience, current_user_id=current_user.id)


@router.get(
    "/",
    response_model=PaginatedExperienceResponse,
    summary="Browse public experiences",
)
def list_public(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """Return public experiences (newest first) with pagination.

    No authentication required.  Anonymous experiences mask author info.
    """
    experiences = get_public_experiences(db, skip=skip, limit=limit)
    total = count_public_experiences(db)

    return PaginatedExperienceResponse(
        experiences=[
            _serialize_experience(exp, current_user_id=None)
            for exp in experiences
        ],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/me",
    response_model=PaginatedExperienceResponse,
    summary="List your own experiences",
)
def list_mine(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all experiences owned by the authenticated user.

    Includes private and anonymous experiences — the user always
    sees their own data unmasked.
    """
    experiences = get_user_experiences(
        db, user_id=current_user.id, skip=skip, limit=limit,
    )
    total = count_user_experiences(db, user_id=current_user.id)

    return PaginatedExperienceResponse(
        experiences=[
            _serialize_experience(exp, current_user_id=current_user.id)
            for exp in experiences
        ],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{experience_id}",
    response_model=ExperienceResponse,
    summary="Get a single experience",
)
def read_one(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Fetch an experience by ID.

    Access rules:
      • **public** — accessible to anyone.
      • **anonymous** — accessible to anyone, but author info is masked.
      • **private** — accessible only to the author.

    Raises ``404`` if not found, ``403`` if the experience is private
    and the requester is not the author.
    """
    experience = get_experience_by_id(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )
    # Private experiences are only visible to the author
    if experience.privacy.value == "private":
        if not current_user or experience.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this experience",
            )
    return _serialize_experience(experience, current_user_id=current_user.id if current_user else None)


@router.put(
    "/{experience_id}",
    response_model=ExperienceResponse,
    summary="Update your experience",
)
def update(
    experience_id: int,
    experience_in: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an experience.  Only the author can modify it.

    Supports partial updates — only include the fields you want to
    change.  At least one field must be provided.
    """
    experience = get_experience_by_id(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )
    if experience.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own experiences",
        )
    updated = update_experience(
        db=db, db_experience=experience, experience_in=experience_in,
    )
    
    # AI Indexing Pipeline (Upsert)
    try:
        emotions = emotion_service.detect_emotions(updated.title, updated.content)
        updated.primary_emotion = emotions["primary"]
        updated.secondary_emotions = emotions["secondary"]
        updated.emotion_confidence = emotions["confidence"]
        
        # Phase 7 AI Wisdom Extraction
        wisdom = wisdom_service.generate_wisdom(
            title=updated.title,
            content=updated.content,
            primary_emotion=emotions["primary"],
            secondary_emotions=emotions["secondary"]
        )
        updated.main_theme = wisdom["main_theme"]
        updated.theme_confidence = wisdom["theme_confidence"]
        updated.why_matters = wisdom["why_matters"]
        updated.short_summary = wisdom["short_summary"]
        updated.medium_summary = wisdom["medium_summary"]
        updated.key_lesson = wisdom["key_lesson"]
        updated.lessons_learned = wisdom["lessons_learned"]
        updated.emotion_initial = wisdom["emotion_initial"]
        updated.emotion_catalyst = wisdom["emotion_catalyst"]
        updated.emotion_outcome = wisdom["emotion_outcome"]
        
        doc_id = vector_service.index_experience(
            experience_id=updated.id,
            title=updated.title,
            content=updated.content,
            primary_emotion=emotions["primary"],
            secondary_emotions=emotions["secondary"]
        )
        updated.embedding_reference_id = doc_id
        db.commit()
        db.refresh(updated)
    except Exception as e:
        logger.error(f"AI Indexing Pipeline failed on update: {e}")

    return _serialize_experience(updated, current_user_id=current_user.id)


@router.delete(
    "/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete your experience",
)
def remove(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an experience.  Only the author can delete it.

    Returns ``204 No Content`` on success — no response body.
    """
    experience = get_experience_by_id(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )
    if experience.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own experiences",
        )
        
    # Delete from ChromaDB
    try:
        vector_service.delete_experience(experience.id)
    except Exception as e:
        logger.warning(f"Failed to delete experience {experience.id} from ChromaDB: {e}")

    delete_experience(db, db_experience=experience)


@router.post(
    "/{experience_id}/helpful",
    response_model=ExperienceResponse,
    summary="Toggle helpful vote",
)
def toggle_helpful_vote(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExperienceResponse:
    """Toggle the current user's helpfulness vote on an experience.

    Increments or decrements the cached helpful_count accordingly.
    """
    experience = get_experience_by_id(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    vote = (
        db.query(HelpfulVote)
        .filter(
            HelpfulVote.user_id == current_user.id,
            HelpfulVote.experience_id == experience_id,
        )
        .first()
    )

    if vote:
        db.delete(vote)
        experience.helpful_count = max(0, experience.helpful_count - 1)
    else:
        new_vote = HelpfulVote(user_id=current_user.id, experience_id=experience_id)
        db.add(new_vote)
        experience.helpful_count += 1

    db.commit()
    db.refresh(experience)
    return _serialize_experience(experience, current_user_id=current_user.id)


@router.get(
    "/analytics/most-viewed",
    response_model=PaginatedExperienceResponse,
    summary="Most viewed experiences (Analytics)",
)
def list_most_viewed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Return public experiences ordered by views count descending."""
    experiences_list = (
        db.query(Experience)
        .filter(Experience.privacy == PrivacyLevel.PUBLIC)
        .order_by(Experience.views_count.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    total = count_public_experiences(db)
    return PaginatedExperienceResponse(
        experiences=[_serialize_experience(exp) for exp in experiences_list],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/analytics/most-helpful",
    response_model=PaginatedExperienceResponse,
    summary="Most helpful experiences (Analytics)",
)
def list_most_helpful(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Return public experiences ordered by helpful votes count descending."""
    experiences_list = (
        db.query(Experience)
        .filter(Experience.privacy == PrivacyLevel.PUBLIC)
        .order_by(Experience.helpful_count.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    total = count_public_experiences(db)
    return PaginatedExperienceResponse(
        experiences=[_serialize_experience(exp) for exp in experiences_list],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{experience_id}/related",
    response_model=List[ExperienceResponse],
    summary="Get related experiences",
)
def get_related(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Retrieve semantically similar public experiences.

    Excludes the current experience itself.
    """
    experience = get_experience_by_id(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )
        
    try:
        # Fetch related experience entries from vector database
        related_results = vector_service.find_related(experience_id, n_results=3)
        if not related_results:
            return []
            
        related_ids = [res["experience_id"] for res in related_results]
        
        # Load details from SQL database, preserving ChromaDB score ordering
        db_records = (
            db.query(Experience)
            .filter(Experience.id.in_(related_ids))
            .filter(Experience.privacy == PrivacyLevel.PUBLIC)
            .all()
        )
        
        record_map = {rec.id: rec for rec in db_records}
        
        ordered_experiences = []
        seen_ids = {experience_id}
        for res in related_results:
            rec_id = res["experience_id"]
            if rec_id in record_map and rec_id not in seen_ids:
                seen_ids.add(rec_id)
                ordered_experiences.append(
                    _serialize_experience(record_map[rec_id], current_user_id=current_user.id if current_user else None)
                )
                
        return ordered_experiences
    except Exception as e:
        logger.error(f"Failed to fetch related experiences: {e}")
        # Graceful fallback: return experiences with shared tags
        fallback_results = []
        seen_fallback = {experience_id}
        for item in db.query(Experience).filter(Experience.id != experience_id).filter(Experience.privacy == PrivacyLevel.PUBLIC).all():
            if item.id not in seen_fallback and any(t in experience.emotion_tags for t in item.emotion_tags):
                seen_fallback.add(item.id)
                fallback_results.append(item)
            if len(fallback_results) >= 3:
                break
        return [_serialize_experience(r, current_user_id=current_user.id if current_user else None) for r in fallback_results]
