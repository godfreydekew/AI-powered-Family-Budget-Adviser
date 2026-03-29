from fastapi import APIRouter

from app.api.routes import (
    admin,
    advisor,
    analytics,
    login,
    private,
    receipts,
    users,
    utils,
)
from app.api.routes.benefits import admin_router as benefits_admin_router
from app.api.routes.benefits import public_router as benefits_public_router
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(receipts.router)
api_router.include_router(analytics.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(advisor.router)
api_router.include_router(benefits_admin_router)
api_router.include_router(benefits_public_router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
