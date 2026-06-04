from typing import List
from sqlalchemy.orm import Session
from app.db.models import Experience
from app.schemas.experience import ExperienceCreate, ExperienceUpdate
from app.services.vector_db import add_experience_to_vector_db, update_experience_in_vector_db, delete_experience_from_vector_db

def create_experience(db: Session, experience: ExperienceCreate, user_id: int):
    db_experience = Experience(
        **experience.model_dump(),
        user_id=user_id
    )
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    
    # Add to ChromaDB vector store
    add_experience_to_vector_db(db_experience.id, db_experience.content, db_experience.emotion_tags)
    
    return db_experience

def get_experience(db: Session, experience_id: int):
    return db.query(Experience).filter(Experience.id == experience_id).first()

def get_experiences(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Experience).filter(Experience.privacy == "Public").offset(skip).limit(limit).all()

def get_user_experiences(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Experience).filter(Experience.user_id == user_id).offset(skip).limit(limit).all()

def update_experience(db: Session, db_experience: Experience, experience: ExperienceUpdate):
    update_data = experience.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_experience, key, value)
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    
    # Update in ChromaDB
    update_experience_in_vector_db(db_experience.id, db_experience.content, db_experience.emotion_tags)
    
    return db_experience

def delete_experience(db: Session, experience_id: int):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if db_experience:
        db.delete(db_experience)
        db.commit()
        # Delete from ChromaDB
        delete_experience_from_vector_db(experience_id)
    return db_experience
