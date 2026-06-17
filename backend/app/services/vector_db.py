"""
app/services/vector_db.py — Legacy Bridge for Vector DB operations
==================================================================
Delegates vector operations to the new app.services.ai.vector_service
to maintain backward compatibility with MVP endpoints.
"""

from typing import List, Dict, Any
from app.services.ai.vector_service import vector_service
from app.services.ai.embedding_service import embedding_service

def add_experience_to_vector_db(experience_id: int, content: str, emotion_tags: List[str]) -> None:
    """Legacy bridge to index new experiences."""
    vector_service.index_experience(
        experience_id=experience_id,
        title="",
        content=content,
        primary_emotion="growth",
        secondary_emotions=emotion_tags
    )

def update_experience_in_vector_db(experience_id: int, content: str, emotion_tags: List[str]) -> None:
    """Legacy bridge to update indexed experiences."""
    vector_service.index_experience(
        experience_id=experience_id,
        title="",
        content=content,
        primary_emotion="growth",
        secondary_emotions=emotion_tags
    )
    
def delete_experience_from_vector_db(experience_id: int) -> None:
    """Legacy bridge to delete experiences."""
    vector_service.delete_experience(experience_id)

def search_similar_experiences(query: str, n_results: int = 5) -> Dict[str, Any]:
    """Legacy bridge to search ChromaDB and return raw dictionary format."""
    query_embedding = embedding_service.generate_embedding(query)
    raw_results = vector_service.experiences_col.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    # Ensure structure resembles what ai_pipeline expectations are:
    # {'ids': [...], 'metadatas': [...], 'documents': [...], 'distances': [...]}
    return raw_results
