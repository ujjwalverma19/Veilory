"""
app/services/ai/emotion_service.py — Emotion Detection Service
============================================================
Classifies experiences into emotional categories (primary, secondary, confidence).
Uses keyword-based scoring as a lightweight MVP fallback to ensure offline success.
"""

import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Veilory-specific emotion mappings
EMOTION_KEYWORDS = {
    "lost": ["lost", "direction", "clueless", "confused", "where to go", "stuck", "drift", "uncertain", "wandering"],
    "anxiety": ["anxious", "anxiety", "panic", "worry", "stress", "dread", "fear", "scared", "nervous"],
    "motivation": ["motivation", "inspire", "driven", "fire", "energy", "ambition", "excited", "purpose"],
    "self_doubt": ["doubt", "impostor", "uncertain", "not good enough", "questioning", "insecure", "hesitant", "shame"],
    "resilience": ["resilience", "kept going", "persevere", "bounce back", "stronger", "endure", "persistence", "survival"],
    "confidence": ["confident", "capable", "proud", "sure of", "believe in", "assurance"],
    "failure": ["fail", "setback", "defeat", "unsuccessful", "dropped", "blew", "ruined", "crash", "rejection"],
    "heartbreak": ["heartbreak", "breakup", "split", "divorce", "dumped", "broken", "grief", "sadness", "relationship", "separated"],
    "burnout": ["exhaust", "burnout", "tired", "drain", "stress", "crashed", "breakdown", "overworked"],
    "growth": ["grow", "learn", "hindsight", "lesson", "better", "adapted", "pivoted", "mature", "reflect", "understanding"]
}

class EmotionService:
    def __init__(self) -> None:
        self.model = None
        self.use_fallback = True
        
        # Prepare architecture for transformers zero-shot pipeline
        try:
            # We delay actual initialization of pipeline until detect_emotions is called
            # to keep imports and startup extremely fast
            import transformers
            self.use_fallback = True  # Default to fallback for lightweight execution
            logger.info("EmotionService initialized. Rule-based model set as primary; transformers prepared.")
        except Exception as e:
            logger.warning(f"Could not import transformers: {e}. Defaulting to keyword rules fallback.")
            self.use_fallback = True

    def detect_emotions(self, title: str, content: str) -> Dict[str, Any]:
        """Classify title & content into primary and secondary emotions."""
        text = f"{title} {content}".lower()
        
        # Keep it lightweight for MVP: use dictionary-based scorer
        if self.use_fallback:
            return self._fallback_detect(text)
            
        try:
            from transformers import pipeline
            if not self.model:
                # Zero-shot classification allows custom emotional taxonomy mapping
                self.model = pipeline("zero-shot-classification", model="typeform/distilbert-base-uncased-mnli")
            
            candidate_labels = list(EMOTION_KEYWORDS.keys())
            res = self.model(text, candidate_labels)
            
            labels = res["labels"]
            scores = res["scores"]
            
            return {
                "primary": labels[0],
                "secondary": [labels[1], labels[2]],
                "confidence": round(float(scores[0]), 2)
            }
        except Exception as e:
            logger.warning(f"Transformer model failed to load/classify: {e}. Executing keyword rules fallback.")
            return self._fallback_detect(text)

    def _fallback_detect(self, text: str) -> Dict[str, Any]:
        """Rules-based keyword frequency analyzer."""
        scores = {}
        for emotion, keywords in EMOTION_KEYWORDS.items():
            count = 0
            for kw in keywords:
                count += text.count(kw)
            scores[emotion] = count
            
        # Rank emotions
        sorted_emotions = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        primary = "growth"  # default
        secondary = ["lessons"]
        confidence = 0.50
        
        # If we matched any keyword
        if sorted_emotions[0][1] > 0:
            primary = sorted_emotions[0][0]
            confidence = min(0.95, 0.5 + 0.05 * sorted_emotions[0][1])
            
            # Secondary
            sec_list = []
            for item in sorted_emotions[1:]:
                if item[1] > 0:
                    sec_list.append(item[0])
            if sec_list:
                secondary = sec_list[:2]
            else:
                secondary = ["growth"] if primary != "growth" else ["lessons"]
        
        return {
            "primary": primary,
            "secondary": secondary,
            "confidence": round(confidence, 2)
        }

emotion_service = EmotionService()
