"""
app/core/config.py — Centralised Configuration
================================================
Reads all configuration from environment variables (loaded from a .env file
via pydantic-settings).  Every setting has a sensible default for local
development, but production deployments MUST override SECRET_KEY and
database credentials.

Design decisions:
  • pydantic-settings validates types at startup — a mis-typed PORT will
    crash immediately instead of causing a subtle runtime bug.
  • SQLALCHEMY_DATABASE_URI is a computed @property so the connection
    string always reflects the current field values.
  • BACKEND_CORS_ORIGINS is parsed as a JSON list so the .env can store
    a readable array like ["http://localhost:3000"].
"""

from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings sourced from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ─── Application ─────────────────────────────────────────────────
    PROJECT_NAME: str = "Veilory"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # ─── PostgreSQL ──────────────────────────────────────────────────
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "veilory_db"
    USE_SQLITE: bool = True

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Construct the connection string. Fallback to SQLite for local development."""
        import os
        if self.USE_SQLITE and not os.getenv("RENDER"):
            return "sqlite:///veilory.db"
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # ─── JWT Authentication ──────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_SECRETS_TOKEN_URLSAFE_64"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # ─── Validators ──────────────────────────────────────────────────

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Accept both a JSON list and a comma-separated string."""
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",")]
        if isinstance(v, list):
            return v
        # Let pydantic handle the JSON-list case automatically
        return v  # type: ignore[return-value]


settings = Settings()
