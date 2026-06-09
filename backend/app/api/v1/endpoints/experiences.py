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

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
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
from app.db.models import Experience, User
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
        privacy=experience.privacy,
        created_at=experience.created_at,
        updated_at=experience.updated_at,
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
    current_user: User = Depends(get_current_user),
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
    if experience.privacy.value == "private" and experience.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this experience",
        )
    return _serialize_experience(experience, current_user_id=current_user.id)


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
    delete_experience(db, db_experience=experience)
