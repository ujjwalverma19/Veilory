"""
app/services/ai/vector_service.py — Vector Database Service
============================================================
Handles connection to ChromaDB PersistentClient, manages collections,
indexes experiences, and performs similarity searches.
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional
import chromadb
from app.services.ai.embedding_service import embedding_service

logger = logging.getLogger(__name__)

# Persistent database storage directory inside workspace
CHROMA_DB_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "chroma_db"
)

class VectorService:
    def __init__(self) -> None:
        self.client = None
        self.experiences_col = None
        self.recommendations_col = None
        self.is_ready = False
        
        try:
            # Create directory if absent
            os.makedirs(CHROMA_DB_DIR, exist_ok=True)
            self.client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
            
            # Configure collections with Cosine Similarity metric
            self.experiences_col = self.client.get_or_create_collection(
                name="experiences",
                metadata={"hnsw:space": "cosine"}
            )
            self.recommendations_col = self.client.get_or_create_collection(
                name="recommendations",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Vector Database collections initialized at: {CHROMA_DB_DIR}")
            self.is_ready = True
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB collections at {CHROMA_DB_DIR}: {e}. Vector database features will be disabled.")
            self.is_ready = False

    def index_experience(
        self,
        experience_id: int,
        title: str,
        content: str,
        primary_emotion: str,
        secondary_emotions: List[str]
    ) -> str:
        """Embed and index/upsert an experience in experiences and recommendations collections."""
        if not self.is_ready or not self.experiences_col or not self.recommendations_col:
            raise RuntimeError("ChromaDB vector database service is not available.")
        # Generate the dense representation
        text_to_embed = f"Title: {title}\nContent: {content}"
        embedding = embedding_service.generate_embedding(text_to_embed)
        
        # Compile metadata properties
        metadata = {
            "experience_id": experience_id,
            "title": title,
            "primary_emotion": primary_emotion or "growth",
            "secondary_emotions": ",".join(secondary_emotions)
        }
        
        doc_id = str(experience_id)
        
        # Upsert in both collections (handles both creates and edits)
        self.experiences_col.upsert(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[content],
            metadatas=[metadata]
        )
        
        self.recommendations_col.upsert(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[content],
            metadatas=[metadata]
        )
        
        logger.info(f"Experience {experience_id} indexed successfully in ChromaDB.")
        return doc_id

    def delete_experience(self, experience_id: int) -> None:
        """Remove an experience from both collections."""
        if not self.is_ready or not self.experiences_col or not self.recommendations_col:
            raise RuntimeError("ChromaDB vector database service is not available.")
        doc_id = str(experience_id)
        try:
            self.experiences_col.delete(ids=[doc_id])
            self.recommendations_col.delete(ids=[doc_id])
            logger.info(f"Experience {experience_id} deleted from ChromaDB.")
        except Exception as e:
            logger.warning(f"Could not delete experience {experience_id} from ChromaDB: {e}")

    def search_similar(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Run similarity queries on the experiences vector collection."""
        if not self.is_ready or not self.experiences_col:
            raise RuntimeError("ChromaDB vector database service is not available.")
        query_embedding = embedding_service.generate_embedding(query)
        
        query_res = self.experiences_col.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        output = []
        if not query_res or not query_res["ids"] or len(query_res["ids"][0]) == 0:
            return output
            
        ids = query_res["ids"][0]
        metadatas = query_res["metadatas"][0]
        documents = query_res["documents"][0]
        # query returns L2/cosine distance. Cosine similarity = 1.0 - Cosine distance
        distances = query_res["distances"][0] if "distances" in query_res and query_res.get("distances") is not None else [0.0]*len(ids)
        
        for idx, item_id in enumerate(ids):
            output.append({
                "experience_id": int(item_id),
                "score": float(1.0 - distances[idx]) if distances[idx] is not None else 0.0,
                "document": documents[idx],
                "metadata": metadatas[idx]
            })
            
        return output

    def find_related(self, experience_id: int, n_results: int = 2) -> List[Dict[str, Any]]:
        """Retrieve experiences that are semantically closest to a source experience."""
        if not self.is_ready or not self.experiences_col:
            raise RuntimeError("ChromaDB vector database service is not available.")
        doc_id = str(experience_id)
        
        # 1. Retrieve the source story vector from the collection
        res = self.experiences_col.get(
            ids=[doc_id],
            include=["embeddings"]
        )
        
        if not res or res.get("embeddings") is None or len(res["embeddings"]) == 0:
            logger.warning(f"Embedding not found in ChromaDB for experience_id {experience_id}")
            return []
            
        source_embedding = res["embeddings"][0]
        
        # 2. Query collections. Ask for n_results + 1 to account for self-matching
        query_res = self.experiences_col.query(
            query_embeddings=[source_embedding],
            n_results=n_results + 1
        )
        
        output = []
        if not query_res or not query_res["ids"] or len(query_res["ids"][0]) == 0:
            return output
            
        ids = query_res["ids"][0]
        metadatas = query_res["metadatas"][0]
        documents = query_res["documents"][0]
        distances = query_res["distances"][0] if "distances" in query_res and query_res.get("distances") is not None else [0.0]*len(ids)
        
        for idx, item_id in enumerate(ids):
            # Exclude the source story itself
            if item_id == doc_id:
                continue
            output.append({
                "experience_id": int(item_id),
                "score": float(1.0 - distances[idx]) if distances[idx] is not None else 0.0,
                "document": documents[idx],
                "metadata": metadatas[idx]
            })
            
        return output[:n_results]

vector_service = VectorService()
