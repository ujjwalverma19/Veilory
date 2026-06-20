"""
Configuration settings for the Veilory application, loaded from environment
variables and .env files using Pydantic Settings.
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

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Construct the connection string. Fallback to SQLite for local development."""
        import os
        db_url = os.getenv("DATABASE_URL")
        
        # Priority 1: If DATABASE_URL is present, always use PostgreSQL
        if db_url:
            # SQLAlchemy 1.4+ removed support for "postgres://", must be "postgresql://"
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif db_url.startswith("postgresql://"):
                db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            
            # Enforce sslmode=require for secure production DB (e.g., Supabase) if not present
            if "sslmode=" not in db_url:
                separator = "&" if "?" in db_url else "?"
                db_url = f"{db_url}{separator}sslmode=require"
            return db_url

        # Priority 2: Use local fallback databases based on USE_SQLITE flag
        if self.USE_SQLITE:
            if os.getenv("RENDER"):
                return "sqlite:////app/chroma_db/veilory.db"
            return "sqlite:///veilory.db"

        # Priority 3: Fallback PostgreSQL from config variables
        uri = (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
        if "sslmode=" not in uri:
            uri = f"{uri}?sslmode=require"
        return uri



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
