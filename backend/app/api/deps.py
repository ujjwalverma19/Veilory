"""
app/api/deps.py — Shared FastAPI Dependencies
=============================================
Reusable dependency functions injected into route handlers via
``Depends()``.

Design decisions:
  • ``get_current_user`` validates the JWT, extracts the ``sub`` claim,
    and fetches the full User object from the database.  If anything
    fails, a 401 is raised — never a 403 (which implies the identity is
    known but access is denied).
  • The ``credentials_exception`` is defined once and reused to keep
    error messages consistent.
  • ``get_db`` is re-exported from ``db.database`` so all endpoints
    import their dependencies from a single module.
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


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Decode the JWT bearer token and return the authenticated User.

    Raises
    ------
    HTTPException 401
        If the token is missing, expired, malformed, or the user no
        longer exists in the database.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        token_data = TokenPayload(**payload)
        if token_data.sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_id(db, user_id=int(token_data.sub))
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[User]:
    """Optionally decode the JWT bearer token and return the User if authenticated.

    Returns None if token is missing or invalid, does not raise 401.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        token_data = TokenPayload(**payload)
        if token_data.sub is None:
            return None
    except JWTError:
        return None

    return get_user_by_id(db, user_id=int(token_data.sub))
