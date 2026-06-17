"""
app/api/v1/endpoints/recommendations.py — Personalisation & Recommendations Router
==================================================================================
Calculates recommended experiences based on interests, searches, and view logs.
Tracks views analytics.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models import Experience, PrivacyLevel, SearchHistory, User, ViewedStory
from app.schemas.experience import ExperienceResponse
from app.schemas.recommendation import (
    RecommendedExperienceResponse,
    UserInterestsResponse,
    UserInterestsUpdate,
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────


def _serialize_experience(
    experience: Experience,
    current_user_id: Optional[int] = None,
) -> ExperienceResponse:
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
    )


# ── Endpoints ────────────────────────────────────────────────────────


@router.get(
    "/",
    response_model=List[RecommendedExperienceResponse],
    summary="Get personalized recommendations",
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[RecommendedExperienceResponse]:
    """Retrieve up to 4 personalized story recommendations based on user activity.

    Uses user interests, search history keywords, and viewed tag arrays.
    """
    # 1. Filter out user's own stories and private ones
    pool = (
        db.query(Experience)
        .filter(Experience.user_id != current_user.id)
        .filter(Experience.privacy == PrivacyLevel.PUBLIC)
        .all()
    )

    interest_set = {interest.lower() for interest in (current_user.interests or [])}

    # Fetch user search history
    searches = (
        db.query(SearchHistory.query)
        .filter(SearchHistory.user_id == current_user.id)
        .all()
    )
    search_terms = {row[0].lower() for row in searches}

    # Fetch viewed stories tags
    viewed_records = (
        db.query(ViewedStory)
        .filter(ViewedStory.user_id == current_user.id)
        .all()
    )
    viewed_experience_ids = {rec.experience_id for rec in viewed_records}
    viewed_experiences = (
        db.query(Experience)
        .filter(Experience.id.in_(viewed_experience_ids))
        .all()
    ) if viewed_experience_ids else []

    viewed_tags = set()
    for exp in viewed_experiences:
        for tag in exp.emotion_tags:
            viewed_tags.add(tag.lower())

    recommendations = []

    for exp in pool:
        score = 0.0
        reason = "Recommended for you"

        # Match 1: Saved interests (highest weight)
        matched_interest = next((t for t in exp.emotion_tags if t.lower() in interest_set), None)
        if matched_interest:
            score += 10.0
            reason = f"Based on your interest in {matched_interest.capitalize()}"

        # Match 2: Recent searches history match
        if score == 0.0:
            matched_search = next((term for term in search_terms if any(t.lower() in term for t in exp.emotion_tags) or term in exp.title.lower()), None)
            if matched_search:
                score += 5.0
                reason = f"Based on your recent search for \"{matched_search.capitalize()}\""

        # Match 3: Reading history viewed tags match
        if score == 0.0:
            matched_view_tag = next((t for t in exp.emotion_tags if t.lower() in viewed_tags), None)
            if matched_view_tag:
                score += 3.0
                reason = f"Because you read {matched_view_tag.capitalize()} stories"

        # Match 4: Default fallback
        if score == 0.0:
            score = 1.0
            if "growth" in exp.emotion_tags:
                reason = "Curated for growth and reflection"
            elif "lessons" in exp.emotion_tags:
                reason = "Curated for life lessons"
            else:
                reason = "Recommended reading"

        recommendations.append(
            RecommendedExperienceResponse(
                experience=_serialize_experience(exp, current_user.id),
                reason=reason,
                score=score,
            )
        )

    # Sort by recommendation score descending
    recommendations.sort(key=lambda r: r.score, reverse=True)
    return recommendations[:4]


@router.post(
    "/views/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Record a story view",
)
def record_story_view(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Record that the current user viewed an experience.

    Increments the views_count counter on the experience.
    """
    experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    # Verify connection logs. Ensure user does not generate duplicate views
    view_entry = (
        db.query(ViewedStory)
        .filter(
            ViewedStory.user_id == current_user.id,
            ViewedStory.experience_id == experience_id,
        )
        .first()
    )

    if not view_entry:
        new_view = ViewedStory(user_id=current_user.id, experience_id=experience_id)
        db.add(new_view)
        # Increment cached analytics counter
        experience.views_count += 1
        db.commit()


@router.get(
    "/interests",
    response_model=UserInterestsResponse,
    summary="Get user interests",
)
def get_user_interests(
    current_user: User = Depends(get_current_user),
) -> UserInterestsResponse:
    """Retrieve the set of interest tags customized by the current user."""
    return UserInterestsResponse(interests=current_user.interests or [])


@router.post(
    "/interests",
    response_model=UserInterestsResponse,
    summary="Update user interests",
)
def update_user_interests(
    interests_in: UserInterestsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserInterestsResponse:
    """Overwrite the user's customized interest tags."""
    cleaned = [tag.strip().lower() for tag in interests_in.interests if tag.strip()]
    current_user.interests = list(set(cleaned))  # deduplicate
    db.commit()
    return UserInterestsResponse(interests=current_user.interests)
