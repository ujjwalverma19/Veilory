"""
app/api/v1/endpoints/auth.py — Authentication Endpoints
=======================================================
Provides signup, login, and current-user retrieval routes.

Design decisions:
  • Signup accepts a JSON body (``UserCreate``).
  • Login accepts ``application/x-www-form-urlencoded`` via
    ``OAuth2PasswordRequestForm`` — this is the standard required by
    OAuth2 / OpenAPI and enables the Swagger UI "Authorize" button.
  • We return ``201 Created`` for signup (a new resource was created)
    and ``200 OK`` for login (no resource mutation).
  • Duplicate-email check uses a case-insensitive lookup.
  • Login returns a generic "Incorrect email or password" message —
    never reveals whether the email exists (prevents user enumeration).
  • ``GET /me`` lets the frontend retrieve the logged-in user's profile
    after a page refresh without re-authenticating.
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.crud.user import create_user, get_user_by_email
from app.db.models import User
from app.schemas.user import Token, UserCreate, UserResponse

router = APIRouter()


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def signup(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> UserResponse:
    """Create a new Veilory account.

    Raises ``409 Conflict`` if the email is already registered.
    """
    existing = get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )
    user = create_user(db, user_in=user_in)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Obtain an access token",
)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    """Authenticate with email + password and receive a JWT.

    The ``username`` field of the form should contain the user's email.
    Raises ``401 Unauthorized`` on failure.
    """
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def read_current_user(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the profile of the currently authenticated user.

    Useful for the frontend to verify identity after a page refresh.
    """
    return current_user

