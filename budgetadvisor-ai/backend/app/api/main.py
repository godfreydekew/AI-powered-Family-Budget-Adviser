from fastapi import APIRouter

from app.api.routes import admin, analytics, login, private, receipts, users, utils
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(receipts.router)
api_router.include_router(analytics.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
