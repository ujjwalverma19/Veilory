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
    # Frontend URLs – can be a single URL or a JSON list
    FRONTEND_URL: str = "https://veilory.online"
    # Derived origins list for CORS middleware – ensures credentials work across subdomains
    BACKEND_CORS_ORIGINS: List[str] = [FRONTEND_URL, f"https://www{FRONTEND_URL[len('https://'):] }"]

    # ─── PostgreSQL ──────────────────────────────────────────────────
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "veilory_db"
    USE_SQLITE: bool = True
    # ─── Persistence ────────────────────────────────────────────────────────
    CHROMA_DB_PATH: str = "./chroma_db"
    # ─── Feature Flags ───────────────────────────────────────────────────────
    USE_COOKIE_AUTH: bool = False



    # ─── JWT Authentication ──────────────────────────────────────────
    from pydantic import Field
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1440 minutes = 24h
    COOKIE_DOMAIN: str = ".veilory.online"

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
