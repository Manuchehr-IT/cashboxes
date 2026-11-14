from fastapi import APIRouter

from .counterparties.router import router as counterparties_router
from .endpoints import router as cashboxes_router
from .payment_schedule.router import router as payment_schedule_router

router = APIRouter()

router.include_router(cashboxes_router)
router.include_router(counterparties_router)
router.include_router(payment_schedule_router)
