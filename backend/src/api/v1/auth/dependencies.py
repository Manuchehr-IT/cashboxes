from fastapi import Depends

from src.api.dependencies import get_hasher, get_jwt_service, get_uow
from src.application.auth.use_cases import AuthLogin
from src.infrastructure.database import UnitOfWork
from src.infrastructure.security.hasher import Hasher
from src.infrastructure.security.jwt import JWTService


async def get_auth_login(
	uow: UnitOfWork = Depends(get_uow),
	hasher: Hasher = Depends(get_hasher),
	jwt_service: JWTService = Depends(get_jwt_service)
) -> AuthLogin:
	return AuthLogin(uow, hasher, jwt_service)
