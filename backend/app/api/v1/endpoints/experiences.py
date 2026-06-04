from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import experience as crud_experience
from app.schemas.experience import ExperienceCreate, ExperienceResponse, ExperienceUpdate
from app.db.models import User

router = APIRouter()

@router.post("/", response_model=ExperienceResponse)
def create_experience(
    experience_in: ExperienceCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud_experience.create_experience(db=db, experience=experience_in, user_id=current_user.id)

@router.get("/", response_model=List[ExperienceResponse])
def read_experiences(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    # Returns public experiences
    return crud_experience.get_experiences(db, skip=skip, limit=limit)

@router.get("/me", response_model=List[ExperienceResponse])
def read_user_experiences(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud_experience.get_user_experiences(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{experience_id}", response_model=ExperienceResponse)
def read_experience(
    experience_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    experience = crud_experience.get_experience(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    # Only allow if public or user owns it
    if experience.privacy != "Public" and experience.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return experience

@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(
    experience_id: int,
    experience_in: ExperienceUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    experience = crud_experience.get_experience(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    if experience.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud_experience.update_experience(db=db, db_experience=experience, experience=experience_in)

@router.delete("/{experience_id}")
def delete_experience(
    experience_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    experience = crud_experience.get_experience(db, experience_id=experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    if experience.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud_experience.delete_experience(db, experience_id=experience_id)
    return {"message": "Experience deleted successfully"}
