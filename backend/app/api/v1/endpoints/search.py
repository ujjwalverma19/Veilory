from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.vector_db import search_similar_experiences
from app.services.ai_pipeline import generate_insight_for_query
from app.crud.experience import get_experience
from app.db.models import User, SearchHistory
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class SearchQuery(BaseModel):
    query: str

class SearchResultItem(BaseModel):
    experience_id: int
    content: str
    tags: List[str]

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    ai_insight: str

@router.post("/", response_model=SearchResponse)
def search_experiences(
    search_query: SearchQuery,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user)
):
    # Log search history if user is logged in
    if current_user:
        history_entry = SearchHistory(user_id=current_user.id, query=search_query.query)
        db.add(history_entry)
        db.commit()
        
    # Perform vector search
    raw_results = search_similar_experiences(search_query.query, n_results=5)
    
    formatted_results = []
    if raw_results['ids'] and len(raw_results['ids'][0]) > 0:
        ids = raw_results['ids'][0]
        docs = raw_results['documents'][0]
        metas = raw_results['metadatas'][0]
        
        for i in range(len(ids)):
            exp_id = int(ids[i])
            # Fetch from DB to ensure it's still public and exists
            db_exp = get_experience(db, exp_id)
            if db_exp and (db_exp.privacy == "Public" or (current_user and db_exp.user_id == current_user.id)):
                tags = metas[i].get("tags", "").split(",") if metas[i].get("tags") else []
                formatted_results.append(SearchResultItem(
                    experience_id=exp_id,
                    content=docs[i],
                    tags=[t.strip() for t in tags if t.strip()]
                ))
                
    # Generate AI Insight
    insight = generate_insight_for_query(search_query.query)
    
    return SearchResponse(
        results=formatted_results,
        ai_insight=insight
    )
