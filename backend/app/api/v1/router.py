"""Aggregates all v1 API routes.

ADDED — ATLAS-P1-AUTH-02 (auth_router), ATLAS-P1-AUTH-03 (oauth_router).
EXTENDED — ATLAS-P1-PROF-02 (profile_router), ATLAS-P1-CHAT-03
(chat_router).
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.oauth import router as oauth_router
from app.api.v1.profile import router as profile_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(oauth_router)
api_router.include_router(profile_router)
api_router.include_router(chat_router)
