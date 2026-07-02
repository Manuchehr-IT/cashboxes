from fastapi import APIRouter

from .endpoints import router as object_router

router = APIRouter()

router.include_router(object_router)
