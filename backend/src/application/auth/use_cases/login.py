from src.application.auth.commands import AuthLoginCommand
from src.application.auth.dtos import AuthResultDTO
from src.application.auth.exceptions import InvalidCredentialsError
from src.infrastructure.database import UnitOfWork
from src.infrastructure.security.hasher import Hasher
from src.infrastructure.security.jwt import JWTService


class AuthLogin:
	def __init__(self, uow: UnitOfWork, hasher: Hasher, jwt_service: JWTService):
		self.uow = uow
		self.hasher = hasher
		self.jwt_service = jwt_service

	async def execute(self, command: AuthLoginCommand) -> AuthResultDTO:
		async with self.uow:
			user = await self.uow.user.find_by_username(command.username)
			if not user:
				raise InvalidCredentialsError()

			if not self.hasher.verify_password(command.password, user.password_hash):
				raise InvalidCredentialsError()

			access_token = self.jwt_service.create_access_token(payload={"sub": str(user.id)})

			return AuthResultDTO(access_token=access_token)
