from typing import Any
from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from src.core.config import settings
from src.core.errors import AuthenticationFailedError, ForbiddenError
from src.domain.user.entities import User
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.http import HTTPClient
from src.infrastructure.security.hasher import Hasher
from src.infrastructure.security.jwt import JWTService

security = HTTPBearer(auto_error=False)

async def get_http_client(request: Request) -> HTTPClient:
	return request.app.state.http_client

async def get_redis(request: Request) -> Redis:
	return request.app.state.redis

async def get_engine_client(request: Request) -> AsyncEngine:
	return request.app.state.engine

async def get_session_factory(request: Request) -> async_sessionmaker[AsyncSession]:
	return request.app.state.session_maker

async def get_uow(
	session_factory: async_sessionmaker[AsyncSession] = Depends(get_session_factory)
) -> UnitOfWork:
	return UnitOfWork(session_factory)

async def get_jwt_service() -> JWTService:
	return JWTService(
		secret_key=settings.jwt.secret_key,
		algorithm=settings.jwt.algorithm,
		access_token_expire_minutes=settings.jwt.access_token_expire_minutes,
		refresh_token_expire_days=settings.jwt.refresh_token_expire_days
	)

async def get_token_payload(
	credentials: HTTPAuthorizationCredentials = Depends(security),
	jwt_service: JWTService = Depends(get_jwt_service)
) -> dict[str, Any]:
	if not credentials:
		raise AuthenticationFailedError("missing")

	return jwt_service.verify_token(credentials.credentials, expected_type="access")

async def get_hasher() -> Hasher:
	return Hasher()

async def get_current_user(
	token_payload: dict[str, Any] = Depends(get_token_payload),
	uow: UnitOfWork = Depends(get_uow)
) -> User:
	sub_id = token_payload.get("sub")

	try:
		user_id = UUID(sub_id)
	except (TypeError, ValueError) as e:
		raise AuthenticationFailedError("invalid") from e

	async with uow:
		user = await uow.user.find(user_id)
		if not user:
			raise AuthenticationFailedError("invalid")
		return user
	
async def require_user(
	current_user: User = Depends(get_current_user)
):
	return current_user

async def require_admin_role(
	current_user: User = Depends(get_current_user)
):
	if not current_user.is_admin:
		raise ForbiddenError()

	return current_user
