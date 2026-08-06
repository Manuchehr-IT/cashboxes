import secrets

from src.application.user.commands import CreateUserCommand
from src.application.user.dtos import UserWithPasswordDTO
from src.application.user.mappers import UserWithPasswordMapper
from src.domain.user.entities import User
from src.infrastructure.database import UnitOfWork
from src.infrastructure.security.hasher import Hasher


class CreateUser:
	def __init__(self, uow: UnitOfWork, hasher: Hasher):
		self.uow = uow
		self.hasher = hasher

	async def execute(self, command: CreateUserCommand) -> UserWithPasswordDTO:
		async with self.uow:
			# Admin-created users get a random password.
			password = secrets.token_urlsafe(32)
			password_hash = self.hasher.hash_password(password)

			user = User.create(
				username=command.username,
				password_hash=password_hash,
				is_active=command.is_active,
				is_admin=False,
				cash_access_scope=command.cash_access_scope,
			)
			await self.uow.user.add(user)
			return UserWithPasswordMapper.to_dto(user, password)
