"""
app/services/ai/embedding_service.py — Embedding Generation Service
============================================================
Generates 384-dimensional dense vectors for texts using the all-MiniLM-L6-v2 model.
Includes a deterministic unit-vector hash fallback for local offline testing.
"""

import logging
import numpy as np
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self) -> None:
        self.model = None
        self.use_fallback = True
        
        # Try loading sentence-transformers
        try:
            from sentence_transformers import SentenceTransformer
            # We load the model lazily on first embedding request to speed up server start
            self.use_fallback = False
            logger.info("EmbeddingService initialized. sentence-transformers model ready.")
        except Exception as e:
            logger.warning(f"Could not import sentence-transformers: {e}. Defaulting to deterministic fallback.")
            self.use_fallback = True

    def generate_embedding(self, text: str) -> List[float]:
        """Generate a 384-float embedding vector for the given text."""
        if self.use_fallback:
            return self._fallback_embedding(text)
            
        try:
            from sentence_transformers import SentenceTransformer
            if not self.model:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
            
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.warning(f"Failed to generate transformer embedding: {e}. Using deterministic fallback.")
            return self._fallback_embedding(text)

    def _fallback_embedding(self, text: str) -> List[float]:
        """Deterministic unit vector generator using text content hash seed."""
        import hashlib
        
        # Calculate a stable numeric seed from the MD5 hash of the text
        hash_val = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16)
        
        # Seed generator deterministically (limited to 32-bit int size for compat)
        rng = np.random.default_rng(hash_val & 0xffffffff)
        
        # Generate 384 dimensions
        vector = rng.standard_normal(384)
        
        # Normalize to unit vector length (L2 norm)
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector.tolist()

embedding_service = EmbeddingService()
