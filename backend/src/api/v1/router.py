from fastapi import APIRouter

from .auth.router import router as auth_router
from .object.router import router as object_router
from .reports.router import router as reports_router
from .user.router import router as user_router

router = APIRouter(prefix="/v1")

router.include_router(auth_router)
router.include_router(user_router)
router.include_router(object_router)
router.include_router(reports_router)
