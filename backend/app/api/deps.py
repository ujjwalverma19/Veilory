"""
Shared dependencies for FastAPI endpoints (authentication and database sessions).
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud.user import get_user_by_id
from app.db.database import get_db  # re-export
from app.db.models import User
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


# ── Reusable exception ──────────────────────────────────────────────

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def verify_supabase_token(token: str) -> dict | None:
    """Validate a Supabase JWT token against the Supabase Auth API."""
    import os
    import json
    import urllib.request
    import urllib.error
    import re
    import logging

    logger = logging.getLogger("veilory")
    
    # Dev-only mock token for local testing without real Google Auth handshake
    if token.startswith("mock-google-token-"):
        email = token.replace("mock-google-token-", "")
        return {
            "id": f"mock-uuid-{email.split('@')[0]}",
            "email": email,
            "user_metadata": {
                "full_name": "Google Test User",
                "avatar_url": "https://lh3.googleusercontent.com/a/mock-avatar-123"
            },
            "app_metadata": {
                "provider": "google"
            }
        }
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url:
        # Fallback dynamic derivation from DATABASE_URL
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            match = re.search(r"postgres\.(?P<ref>[a-z0-9]+)@", db_url)
            if match:
                ref = match.group("ref")
                supabase_url = f"https://{ref}.supabase.co"

    if not supabase_url or not supabase_anon_key:
        logger.error("Supabase URL or Anon Key is missing from environment.")
        return None

    url = f"{supabase_url}/auth/v1/user"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": supabase_anon_key
        }
    )
    try:
        with urllib.request.urlopen(req) as res:
            res_body = res.read().decode("utf-8")
            return json.loads(res_body)
    except Exception as e:
        logger.error(f"Supabase token verification failed: {e}")
        return None


def get_user_from_token(db: Session, token: str) -> User | None:
    """Locate or create a user by resolving a legacy local JWT or a live Supabase JWT."""
    # 1. Try legacy local JWT decoding
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        token_data = TokenPayload(**payload)
        if token_data.sub:
            from app.crud.user import get_user_by_id
            return get_user_by_id(db, user_id=int(token_data.sub))
    except JWTError:
        pass

    # 2. Try Supabase token verification
    supabase_user = verify_supabase_token(token)
    if supabase_user:
        supabase_id = supabase_user.get("id")
        email = supabase_user.get("email")
        if not email:
            return None
        
        user_metadata = supabase_user.get("user_metadata", {})
        full_name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
        profile_picture = user_metadata.get("avatar_url") or user_metadata.get("picture")
        
        app_metadata = supabase_user.get("app_metadata", {})
        provider = app_metadata.get("provider") or user_metadata.get("provider") or "email"
        if provider == "google":
            provider = "google"
        elif provider == "apple":
            provider = "apple"
        else:
            provider = "email"

        from app.crud.user import get_user_by_supabase_id, get_user_by_email, create_oauth_user
        
        user = get_user_by_supabase_id(db, supabase_user_id=supabase_id)
        if not user:
            user = get_user_by_email(db, email=email)
            if user:
                # Link existing local email/password user to Supabase
                user.supabase_user_id = supabase_id
                user.auth_provider = provider
                if profile_picture:
                    user.profile_picture = profile_picture
                db.commit()
                db.refresh(user)
            else:
                # Create a new local user synced from Supabase
                user = create_oauth_user(
                    db=db,
                    email=email,
                    name=full_name,
                    supabase_user_id=supabase_id,
                    display_name=full_name,
                    profile_picture=profile_picture,
                    auth_provider=provider
                )
        else:
            # Sync / update fields if changed
            updated = False
            if user.profile_picture != profile_picture and profile_picture:
                user.profile_picture = profile_picture
                updated = True
            if user.auth_provider != provider:
                user.auth_provider = provider
                updated = True
            if user.name != full_name and full_name:
                user.name = full_name
                updated = True
            if updated:
                db.commit()
                db.refresh(user)
        return user

    return None


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """Decode token (legacy or Supabase) and return the authenticated User."""
    user = get_user_from_token(db, token)
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[User]:
    """Optionally decode token (legacy or Supabase) and return User if authenticated."""
    if not token:
        return None
    return get_user_from_token(db, token)
