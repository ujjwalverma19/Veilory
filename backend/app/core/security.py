"""
app/core/security.py — Password Hashing & JWT Utilities
=======================================================
All authentication primitives live here so the rest of the codebase never
touches raw passwords or token encoding directly.

Design decisions:
  • passlib + bcrypt is the industry standard for password hashing.
    CryptContext handles algorithm migration automatically via
    ``deprecated="auto"``.
  • python-jose handles JWT encoding/decoding.  We include the token
    *type* ("access") inside the payload so future refresh-token logic
    can distinguish between token types.
  • We use ``datetime.now(timezone.utc)`` instead of the deprecated
    ``datetime.utcnow()`` for timezone-aware expiry timestamps.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password Hashing ────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return ``True`` if *plain_password* matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Return a bcrypt hash of *password*."""
    return pwd_context.hash(password)


# ── JWT Token ────────────────────────────────────────────────────────


def create_access_token(
    subject: Union[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token.

    Parameters
    ----------
    subject : str | Any
        The value stored in the ``sub`` claim (typically the user ID).
    expires_delta : timedelta, optional
        Custom lifetime.  Falls back to ``ACCESS_TOKEN_EXPIRE_MINUTES``.
    """
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access",
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
