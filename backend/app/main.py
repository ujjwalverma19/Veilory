"""
FastAPI application entrypoint for the Veilory backend.
Sets up middleware, global exception handlers, and API routes.
"""

import logging

from fastapi import FastAPI, Request, Response, status, HTTPException
from fastapi.exceptions import RequestValidationError
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

logger.info("Initializing Veilory backend application...")
logger.info("Configuration loaded. Project name: %s", settings.PROJECT_NAME)

import os
db_url = os.getenv("DATABASE_URL")
logger.info(f"STARTUP DB VERIFICATION: DATABASE_URL env var exists: {db_url is not None}")
selected_uri = settings.SQLALCHEMY_DATABASE_URI
is_sqlite = selected_uri.startswith("sqlite")
logger.info(f"STARTUP DB VERIFICATION: Selected DB Engine: {'SQLite' if is_sqlite else 'PostgreSQL'}")
logger.info(f"STARTUP DB VERIFICATION: SQLALCHEMY_DATABASE_URI: {selected_uri.split('@')[-1] if '@' in selected_uri else selected_uri}") # mask password if present

logger.info("Database connection factory (SQLAlchemy engine) prepared.")

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

logger.info("Loading middleware: CORS and Security Headers...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://veilory.online",
        "https://www.veilory.online",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
from app.middleware.security_headers import SecurityHeadersMiddleware
app.add_middleware(SecurityHeadersMiddleware)

logger.info("Middleware loaded successfully.")

# ── Exception Handlers with CORS ─────────────────────────────────────

def add_cors_headers(request: Request, response: JSONResponse) -> JSONResponse:
    origin = request.headers.get("origin")
    allowed_origins = {
        "https://veilory.online",
        "https://www.veilory.online",
        "http://localhost:3000"
    }
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    return add_cors_headers(request, response)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    response = JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )
    return add_cors_headers(request, response)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions.

    Logs the full traceback server-side but returns a sanitised
    message to the client — never expose internal details.
    """
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )
    return add_cors_headers(request, response)


# ── Routes ───────────────────────────────────────────────────────────

logger.info("Registering versioned API routers...")

app.include_router(api_router, prefix=settings.API_V1_STR)

logger.info("API routers registered successfully.")
logger.info("Veilory backend application initialization completed.")


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
    logger.info("Executing startup event handlers...")
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        logger.info("SQLite database detected. Running metadata creation...")
        from app.db.database import Base, engine
        Base.metadata.create_all(bind=engine)
        logger.info("SQLite tables verified/created.")
    else:
        logger.info("PostgreSQL database detected. Running Alembic migrations programmatically...")
        try:
            import os
            from alembic.config import Config
            from alembic import command
            
            # Resolve paths relative to app/main.py
            app_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(app_dir)
            alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
            
            alembic_cfg = Config(alembic_ini_path)
            # Make sure script_location is resolved correctly (backend/alembic)
            alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
            alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)
            
            command.upgrade(alembic_cfg, "head")
            logger.info("Alembic migrations completed successfully.")
        except Exception as e:
            logger.error(f"Failed to run Alembic migrations on startup: {e}")
    logger.info("Veilory backend startup events completed successfully.")
