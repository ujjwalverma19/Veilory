"""
app/services/ai/wisdom_service.py — AI Wisdom Extraction Service
================================================================
Analyzes story text and metadata to extract user-facing reflection components:
  • Themes & Theme Confidence
  • "Why This Story Matters" reflection
  • Key Lessons & lessons learned bullet points
  • Dual-length summarizations
  • Emotional Journey flow (Initial State -> Catalyst -> Outcome)
"""

import logging
import re
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

THEME_MAPPINGS = {
    "Career Setback": {
        "key_lesson": "Rejection is temporary; skills compound over time.",
        "why_matters": "This experience demonstrates how setbacks can become turning points for personal growth.",
        "lessons_learned": [
            "Failure is a source of feedback, not finality.",
            "Focus on continuous skill building and adaptation.",
            "Patience is key during career transitions."
        ]
    },
    "Academic Challenge": {
        "key_lesson": "One test score does not define your intellect or long-term potential.",
        "why_matters": "This story highlights the importance of separating performance metrics from self-worth.",
        "lessons_learned": [
            "Assessment results measure a single point in time, not your overall growth.",
            "Study strategy and mindset are more important than raw hours spent studying.",
            "Growth happens when you review your mistakes instead of avoiding them."
        ]
    },
    "Relationship Healing": {
        "key_lesson": "Heartbreak is painful, but it clears the path for deeper self-discovery.",
        "why_matters": "This story details the emotional rebuilding and boundary learning that follow heartbreak.",
        "lessons_learned": [
            "Healing requires time, patience, and absolute self-compassion.",
            "Every relationship teaches us about our core boundaries.",
            "Confidence returns when you redirect focus to your own path."
        ]
    },
    "Workplace Burnout": {
        "key_lesson": "Rest is not earned; it is required for sustainable growth.",
        "why_matters": "This experience shows how listening to bodily exhaustion forces essential lifestyle changes.",
        "lessons_learned": [
            "Prioritize rest to prevent physical and emotional exhaustion.",
            "Set clear boundaries between work commitments and life.",
            "Your worth is not tied to your external productivity."
        ]
    },
    "Emotional Resilience": {
        "key_lesson": "Every setback is feedback; your resilience is your greatest asset.",
        "why_matters": "This experience represents the strength found through facing internal doubt and anxiety.",
        "lessons_learned": [
            "Acknowledge difficult feelings without letting them control you.",
            "Consistency is more valuable than initial speed or perfection.",
            "Growth occurs outside your comfort zone when you face discomfort."
        ]
    },
    "Personal Growth": {
        "key_lesson": "Progress is rarely linear; trust the compounding value of small steps.",
        "why_matters": "This story shows how small, daily reflections eventually lead to a shift in mindset.",
        "lessons_learned": [
            "Embrace discomfort as a signal of learning and adaptation.",
            "Value the journey and reflections as much as the outcome.",
            "Build small daily habits rather than chasing giant leaps."
        ]
    }
}

class WisdomService:
    def __init__(self) -> None:
        self.model = None
        self.use_fallback = True
        
        # Structure prepared for future large generation pipeline models
        try:
            import transformers
            self.use_fallback = True
            logger.info("WisdomService initialized. Rule-based model set as primary; transformer placeholders ready.")
        except Exception as e:
            logger.warning(f"Could not import transformers in WisdomService: {e}.")
            self.use_fallback = True

    def generate_wisdom(
        self,
        title: str,
        content: str,
        primary_emotion: str,
        secondary_emotions: List[str]
    ) -> Dict[str, Any]:
        """Generate reflection data based on the experience text."""
        text = f"{title} {content}".lower()
        
        # 1. Determine main theme & theme confidence based on keyword matching
        theme = "Personal Growth"
        confidence = 0.85
        
        if any(kw in text for kw in ["breakup", "relationship", "split", "heartbreak", "partner", "love", "divorce", "dating", "ex-"]):
            theme = "Relationship Healing"
            confidence = 0.95
        elif any(kw in text for kw in ["placement", "exam", "college", "university", "final", "test", "grade", "study", "studying"]):
            theme = "Academic Challenge"
            confidence = 0.92
        elif any(kw in text for kw in ["career", "job", "workplace", "interview", "startup", "business", "co-founder", "corporate", "office"]):
            theme = "Career Setback"
            confidence = 0.90
        elif any(kw in text for kw in ["burnout", "exhaust", "tired", "drain", "stress", "overworked", "crashed", "breakdown"]):
            theme = "Workplace Burnout"
            confidence = 0.89
        elif any(kw in text for kw in ["anxiety", "panic", "doubt", "fear", "dread", "impostor", "scared"]):
            theme = "Emotional Resilience"
            confidence = 0.88
            
        # Add slight confidence variance depending on details length
        length_bonus = min(0.04, len(content) / 25000.0)
        confidence = round(confidence + length_bonus, 2)
        
        # 2. Retrieve key lesson, lessons learned, and why_matters from theme templates
        theme_data = THEME_MAPPINGS[theme]
        key_lesson = theme_data["key_lesson"]
        why_matters = theme_data["why_matters"]
        lessons_learned = theme_data["lessons_learned"]
        
        # 3. Formulate dual summaries (Short and Medium)
        # Parse sentences cleanly using regex
        sentences = [s.strip() for s in re.split(r'\. |\? |\! ', content) if s.strip()]
        first_sentence = sentences[0] if sentences else "A reflective journey shared by the author."
        if not first_sentence.endswith('.'):
            first_sentence += '.'
            
        # Short Summary (approx 150 chars limit)
        short_summary = f"The author shares an experience about '{title}', learning that {key_lesson.lower()}"
        if len(short_summary) > 160:
            short_summary = short_summary[:157] + "..."
            
        # Medium Summary (approx 300 chars limit)
        medium_summary = f"In this story, the author shares reflections on '{title}'. They explain: {first_sentence} Ultimately, they learn that {key_lesson.lower()}"
        if len(medium_summary) > 310:
            medium_summary = medium_summary[:307] + "..."
            
        # 4. Formulate Emotional Journey (Initial State -> Catalyst -> Outcome)
        # Map primary emotion to Initial State
        initial_state = "Uncertainty"
        if primary_emotion in ["lost", "self_doubt"]:
            initial_state = "Self Doubt"
        elif primary_emotion == "anxiety":
            initial_state = "Anxiety"
        elif primary_emotion == "failure":
            initial_state = "Defeat"
        elif primary_emotion == "heartbreak":
            initial_state = "Heartbreak"
        elif primary_emotion == "burnout":
            initial_state = "Exhaustion"
            
        # Map secondary emotions or general flow to Catalyst
        catalyst = "Reflection"
        if "resilience" in secondary_emotions or "resilience" == primary_emotion:
            catalyst = "Struggle"
        elif "motivation" in secondary_emotions or "motivation" == primary_emotion:
            catalyst = "Action"
        elif "growth" in secondary_emotions:
            catalyst = "Pivot"
            
        # Map to Outcome
        outcome = "Growth"
        if primary_emotion == "confidence" or "confidence" in secondary_emotions:
            outcome = "Confidence"
        elif primary_emotion == "motivation":
            outcome = "Purpose"
        elif "resilience" in secondary_emotions:
            outcome = "Resilience"
            
        return {
            "main_theme": theme,
            "theme_confidence": confidence,
            "why_matters": why_matters,
            "short_summary": short_summary,
            "medium_summary": medium_summary,
            "key_lesson": key_lesson,
            "lessons_learned": lessons_learned,
            "emotion_initial": initial_state,
            "emotion_catalyst": catalyst,
            "emotion_outcome": outcome
        }

wisdom_service = WisdomService()
