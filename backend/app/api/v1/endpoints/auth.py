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
import os
import json
from typing import Optional
import urllib.request
import urllib.error
import re
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.crud.user import create_user, get_user_by_email
from app.db.models import User
from app.schemas.user import Token, UserCreate, UserResponse

router = APIRouter()
logger = logging.getLogger("veilory")


def supabase_authenticate(email: str, password: str) -> str | None:
    """Validate credentials and return access token from Supabase Auth.
    
    If the user does not exist in Supabase, attempts to sign up and then log in.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url:
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            match = re.search(r"postgres\.(?P<ref>[a-z0-9]+)@", db_url)
            if match:
                ref = match.group("ref")
                supabase_url = f"https://{ref}.supabase.co"

    if not supabase_url or not supabase_anon_key:
        logger.error("Supabase credentials missing during transparent login.")
        return None

    # 1. Try to log in to Supabase
    login_url = f"{supabase_url}/auth/v1/token?grant_type=password"
    req_data = json.dumps({"email": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(
        login_url,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "apikey": supabase_anon_key
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body.get("access_token")
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_content)
            err_desc = err_json.get("error_description", "") or err_json.get("msg", "")
        except Exception:
            err_desc = ""

        # 2. If credentials not found or error, attempt automatic signup to migrate them
        if "invalid_credentials" in err_desc or "Invalid login credentials" in err_desc or e.code == 400:
            signup_url = f"{supabase_url}/auth/v1/signup"
            req_signup = urllib.request.Request(
                signup_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "apikey": supabase_anon_key
                },
                method="POST"
            )
            try:
                with urllib.request.urlopen(req_signup) as signup_res:
                    signup_body = json.loads(signup_res.read().decode("utf-8"))
                    token = signup_body.get("access_token")
                    if token:
                        return token
                
                # Try logging in again after signup
                with urllib.request.urlopen(req) as res2:
                    res_body2 = json.loads(res2.read().decode("utf-8"))
                    return res_body2.get("access_token")
            except Exception as se:
                logger.error(f"Supabase signup migration failed: {se}")
                return None
        else:
            logger.error(f"Supabase login failed: {err_content}")
            return None
    except Exception as e:
        logger.error(f"Supabase connection error: {e}")
        return None


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
    """Create a new Veilory account locally and register it in Supabase Auth."""
    existing = get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )
    user = create_user(db, user_in=user_in)

    # Register in Supabase Auth programmatically
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    if supabase_url and supabase_anon_key:
        if not supabase_url.startswith("http"):
            match = re.search(r"postgres\.(?P<ref>[a-z0-9]+)@", os.getenv("DATABASE_URL", ""))
            if match:
                ref = match.group("ref")
                supabase_url = f"https://{ref}.supabase.co"
        
        signup_url = f"{supabase_url}/auth/v1/signup"
        req_data = json.dumps({
            "email": user_in.email,
            "password": user_in.password,
            "options": {"data": {"name": user_in.name}}
        }).encode("utf-8")
        req = urllib.request.Request(
            signup_url,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "apikey": supabase_anon_key
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req) as res:
                res_body = json.loads(res.read().decode("utf-8"))
                supabase_id = res_body.get("id") or res_body.get("user", {}).get("id")
                if supabase_id:
                    user.supabase_user_id = supabase_id
                    user.auth_provider = "email"
                    db.commit()
                    db.refresh(user)
        except Exception as e:
            logger.warn(f"Failed to register user {user_in.email} in Supabase on signup: {e}")
            
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
    """Authenticate with email + password.
    
    Validates locally and transparently logs in or migrates the credentials to Supabase Auth.
    """
    user = get_user_by_email(db, email=form_data.username)
    if not user or (user.password_hash and not verify_password(form_data.password, user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Perform transparent migration or login to Supabase
    token = supabase_authenticate(form_data.username, form_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supabase authentication failed. Please reset your password using the password reset flow."
        )

    # Sync local user record with Supabase ID
    from app.api.deps import get_user_from_token
    synced_user = get_user_from_token(db, token)
    if not synced_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to synchronize user session locally."
        )

    return Token(access_token=token)


class OAuthLoginRequest(BaseModel):
    access_token: str


@router.post(
    "/oauth",
    response_model=Token,
    summary="Verify Supabase OAuth token and establish session",
)
def oauth_login(
    payload: OAuthLoginRequest,
    db: Session = Depends(get_db)
) -> Token:
    """Verify Supabase OAuth token and establish session."""
    from app.api.deps import get_user_from_token
    user = get_user_from_token(db, payload.access_token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase access token"
        )
    return Token(access_token=payload.access_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def read_current_user(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return current_user


@router.post(
    "/upgrade",
    response_model=UserResponse,
    summary="Upgrade user to premium preview",
)
def upgrade_tier(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Upgrade the current user's account tier to premium."""
    current_user.tier = "premium"
    current_user.search_limit = 999999
    db.commit()
    db.refresh(current_user)
    return current_user


class SupabaseConfigResponse(BaseModel):
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None


@router.get(
    "/config",
    response_model=SupabaseConfigResponse,
    summary="Get public Supabase configuration",
)
def get_supabase_config() -> SupabaseConfigResponse:
    """Return public Supabase URL and Anon Key so frontend can dynamically initialize."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url:
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            match = re.search(r"postgres\.(?P<ref>[a-z0-9]+)@", db_url)
            if match:
                ref = match.group("ref")
                supabase_url = f"https://{ref}.supabase.co"

    return SupabaseConfigResponse(
        supabase_url=supabase_url,
        supabase_anon_key=supabase_anon_key
    )


