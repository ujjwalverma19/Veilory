"""
app/api/v1/endpoints/search.py — Search & History Router
=========================================================
Implements experience searching, search usage tracking, history persistence,
and most-searched topics analytics.
"""

from datetime import datetime, timezone
import random
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.db.models import Experience, PrivacyLevel, SearchHistory, User
from app.schemas.experience import ExperienceResponse
from app.schemas.search import (
    AIInsight,
    PopularSearchResponse,
    SearchHistoryResponse,
    SearchQuery,
    SearchQueryResponse,
    SearchResultItem,
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────


def _serialize_experience(
    experience: Experience,
    current_user_id: Optional[int] = None,
) -> ExperienceResponse:
    """Masks author information for anonymous experiences unless requested by author."""
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


@router.post(
    "/",
    response_model=SearchQueryResponse,
    summary="Search public experiences",
)
def execute_search(
    search_in: SearchQuery,
    db: Session = Depends(get_db),
    # Optional dependency: allows both guests and logged-in users to search
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> SearchQueryResponse:
    """Query the experience library with text-matching and check daily limits.

    Logged-in users have search counts updated in PostgreSQL.
    """
    query_str = search_in.query.strip()
    lowercase_query = query_str.lower()

    # 1. Search Limits check (only for authenticated users)
    if current_user:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # Reset count if new day
        if current_user.last_search_date != today_str:
            current_user.daily_search_count = 0
            current_user.last_search_date = today_str

        # Enforce search limit if not premium
        if current_user.tier != "premium":
            if current_user.daily_search_count >= current_user.search_limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="You've reached today's search limit.",
                )

        # Log query to SearchHistory
        history_entry = SearchHistory(user_id=current_user.id, query=query_str)
        db.add(history_entry)

        # Increment searches count
        current_user.daily_search_count += 1
        db.commit()

    # 2. Perform text-matching database query
    # Match title, content, or emotion tags
    # SQLite fallback doesn't support ILIKE, so we use lower() and contains
    results_pool = (
        db.query(Experience)
        .filter(Experience.privacy != PrivacyLevel.PRIVATE)
        .all()
    )

    scored_results = []
    for exp in results_pool:
        score = 0.2  # Base score
        
        # Tags matching
        for tag in exp.emotion_tags:
            if tag.lower() in lowercase_query:
                score += 0.25

        # Keywords matching
        if "startup" in lowercase_query and "startup" in exp.content.lower():
            score += 0.3
        if "fail" in lowercase_query and ("fail" in exp.content.lower() or "fail" in exp.title.lower()):
            score += 0.25
        if "code" in lowercase_query and "coding" in exp.content.lower():
            score += 0.35
        if "job" in lowercase_query and "job" in exp.content.lower():
            score += 0.2
        if "love" in lowercase_query or "heartbreak" in lowercase_query or "relationship" in lowercase_query:
            if "relationship" in exp.content.lower() or "heartbreak" in exp.content.lower() or "separate" in exp.content.lower():
                score += 0.35
        if "exam" in lowercase_query or "college" in lowercase_query or "school" in lowercase_query:
            if "exam" in exp.content.lower() or "academic" in exp.content.lower() or "university" in exp.content.lower():
                score += 0.4

        # Add organic small factor
        score = min(0.98, score + (random.random() * 0.05))

        # Filter out low scores if we have a search query, otherwise show all
        if not lowercase_query or score > 0.3:
            scored_results.append(
                SearchResultItem(
                    experience=_serialize_experience(exp, current_user.id if current_user else None),
                    score=score,
                )
            )

    scored_results.sort(key=lambda r: r.score, reverse=True)

    # 3. Generate Mock AI Insight based on keywords
    insight = AIInsight(
        summary="Reflecting on your search, there is a recurring theme of transition and realignment.",
        themes=["Transition", "Self-Worth", "Growth"],
        reframing="Temporary setbacks are pivots, not final outcomes. Separation of identity from output is key.",
        growth_steps=[
            "Acknowledge the emotional weight of this transition.",
            "Identify the core learning independent of external validation.",
            "Take one micro-action that aligns with your revised values.",
        ],
    )

    if "startup" in lowercase_query or "business" in lowercase_query or "founder" in lowercase_query:
        insight = AIInsight(
            summary="Founder failure is rarely a failure of capability; it is a mismatch of timing, distribution, or feedback loops. The collective experiences suggest that building in public and detaching personal identity from venture outcomes are vital for survival.",
            themes=["Identity Detachment", "Customer Discovery", "Resilience"],
            reframing="Your startup didn't fail you; it was a high-intensity apprenticeship that graduated you into a more capable operator.",
            growth_steps=[
                "Write a post-mortem to document exact learning nodes (technical, operational, market).",
                "Take a minimum 2-week cognitive break before starting any new venture.",
                "Talk to three previous founders about their post-failure pivot strategies.",
            ],
        )
    elif "lost" in lowercase_query or "career" in lowercase_query or "code" in lowercase_query or "coding" in lowercase_query:
        insight = AIInsight(
            summary="Career displacement and burnout usually manifest when there is a mismatch between values and daily activity. FAANG and high-prestige roles often act as golden cages that delay necessary alignment pivots.",
            themes=["Values Alignment", "Burnout Recovery", "Sunk Cost Fallacy"],
            reframing="Feeling lost is not a sign of weakness—it is your emotional processing system signaling that your current environment lacks meaningful nutrients.",
            growth_steps=[
                "Audit your daily activities: separate what drains you from what energizes you.",
                "Interview someone in a target adjacent field (e.g., product design, management).",
                "Set strict work boundary caps: block screen time after 6:00 PM.",
            ],
        )
    elif "relationship" in lowercase_query or "heartbreak" in lowercase_query or "lost someone" in lowercase_query or "love" in lowercase_query:
        insight = AIInsight(
            summary="Relational drifting can be more challenging than abrupt endings due to the lack of clear closure. The wisdom of similar experiences stresses that letting go of the projected future is the most critical hurdle in healing.",
            themes=["Ambiguous Loss", "Identity Re-establishment", "Emotional Grace"],
            reframing="Drifting apart is not a failure of love, but a reflection of divergent growth vectors that require releasing with gratitude.",
            growth_steps=[
                "Allow yourself to grieve the future you planned, not just the person you lost.",
                "Remove digital triggers or social media checks to allow neurons to reset.",
                "Reconnect with solo hobbies that pre-date the relationship.",
            ],
        )
    elif "exam" in lowercase_query or "fail" in lowercase_query or "study" in lowercase_query or "school" in lowercase_query:
        insight = AIInsight(
            summary="Academic setbacks trigger deep shame due to immediate comparison with peers. Similar student stories show that academic setbacks are often the first time individuals are forced to build systems for neurodivergence or anxiety.",
            themes=["Academic Shame", "Systemic Learning", "Self-Compassion"],
            reframing="Failing an exam is a localized metric of study strategy, not a global metric of intellectual capacity or future potential.",
            growth_steps=[
                "Disclose the situation to trusted allies to diffuse the burden of isolation.",
                "Redesign study environments (e.g., pomodoro timers, whiteboards, group accountability).",
                "Consult academic counselors for systems adjustments (e.g., ADHD accommodations).",
            ],
        )

    return SearchQueryResponse(
        query=query_str,
        insight=insight if lowercase_query else None,
        results=scored_results,
    )


@router.get(
    "/history",
    response_model=List[SearchHistoryResponse],
    summary="Get user search history",
)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[SearchHistoryResponse]:
    """Retrieve the recent searches executed by the current user."""
    history = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.created_at.desc())
        .limit(10)
        .all()
    )
    return history  # type: ignore


@router.delete(
    "/history",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear search history",
)
def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Permantently clear all search history logs for the current user."""
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()


@router.get(
    "/analytics/most-searched",
    response_model=List[PopularSearchResponse],
    summary="Most searched topics (Analytics)",
)
def get_most_searched_topics(
    db: Session = Depends(get_db),
) -> List[PopularSearchResponse]:
    """Analytics API — aggregates the most searched text queries across all users."""
    results = (
        db.query(SearchHistory.query, func.count(SearchHistory.id).label("count"))
        .group_by(SearchHistory.query)
        .order_by(func.count(SearchHistory.id).desc())
        .limit(10)
        .all()
    )
    return [
        PopularSearchResponse(query=row[0], count=row[1])
        for row in results
    ]
