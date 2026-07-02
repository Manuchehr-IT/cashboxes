from fastapi import APIRouter

from .endpoints import router as user_router
from .me import router as me_router
from .user_object.router import router as user_object_router

router = APIRouter()

# me_router must be included before user_router: /users/me vs /users/{user_id}.
router.include_router(me_router)
router.include_router(user_router)
router.include_router(user_object_router)
