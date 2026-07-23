from fastapi import APIRouter

from .endpoints import router as logs_router

router = APIRouter()

router.include_router(logs_router)
