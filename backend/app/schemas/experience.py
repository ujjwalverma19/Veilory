from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class ExperienceBase(BaseModel):
    title: str
    content: str
    emotion_tags: List[str]
    privacy: str = "Public"

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    emotion_tags: Optional[List[str]] = None
    privacy: Optional[str] = None

class ExperienceResponse(ExperienceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
