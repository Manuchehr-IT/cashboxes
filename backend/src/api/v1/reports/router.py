from fastapi import APIRouter

from .endpoints import router as cashboxes_router

router = APIRouter()

router.include_router(cashboxes_router)
