"""
app/main.py — FastAPI Application Entrypoint
============================================
Creates the FastAPI application, configures middleware, and mounts
the versioned API router.

Design decisions:
  • A global exception handler catches unhandled exceptions and returns
    a clean 500 JSON response instead of leaking stack traces.
  • CORS origins are loaded from the ``BACKEND_CORS_ORIGINS`` setting
    so production can restrict allowed frontends.
  • A ``/health`` endpoint is provided for load-balancer health checks.
  • The ``/api/v1/docs`` URL is the interactive API documentation.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings

# ── Logging ──────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("veilory")


# ── Application ──────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Veilory API — An AI-powered emotional wisdom preservation platform. "
        "Store life experiences, search by emotion, and discover human wisdom."
    ),
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)


# ── Middleware ───────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
from app.middleware.security_headers import SecurityHeadersMiddleware
app.add_middleware(SecurityHeadersMiddleware)


# ── Global Exception Handler ────────────────────────────────────────


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions.

    Logs the full traceback server-side but returns a sanitised
    message to the client — never expose internal details.
    """
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# ── Routes ───────────────────────────────────────────────────────────

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    """Root endpoint — basic API info."""
    return {
        "app": settings.PROJECT_NAME,
        "version": "0.1.0",
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health-check endpoint for load balancers and uptime monitors."""
    return {"status": "healthy"}


@app.on_event("startup")
def startup_db_setup():
    """Auto-creates SQLite tables for local dev fallback. 
    
    Production PostgreSQL uses Alembic migrations.
    """
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        from app.db.database import Base, engine
        Base.metadata.create_all(bind=engine)
