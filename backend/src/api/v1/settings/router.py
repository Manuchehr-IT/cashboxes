from fastapi import APIRouter

from .endpoints import router as settings_endpoints_router

router = APIRouter()

router.include_router(settings_endpoints_router)
