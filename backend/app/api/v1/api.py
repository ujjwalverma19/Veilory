"""
app/api/v1/api.py — API v1 Router Aggregator
============================================
Mounts all v1 endpoint routers under their respective prefixes.

Design decisions:
  • The search router has been removed for Phase 1 (backend foundation
    only).  It will be re-added in the AI/Search phase.
  • Each router is tagged for clean grouping in the Swagger UI.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, experiences

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)
api_router.include_router(
    experiences.router,
    prefix="/experiences",
    tags=["Experiences"],
)
