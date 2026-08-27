from fastapi import APIRouter

from .endpoints import router as counterparties_router

router = APIRouter()

router.include_router(counterparties_router)
