from fastapi import APIRouter

from .endpoints import router as user_object_router

router = APIRouter()

router.include_router(user_object_router)
