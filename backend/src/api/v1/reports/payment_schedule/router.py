from fastapi import APIRouter

from .endpoints import router as payment_schedule_router

router = APIRouter()

router.include_router(payment_schedule_router)
