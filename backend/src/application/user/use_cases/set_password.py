from src.application.user.commands import SetUserPasswordCommand
from src.domain.user.exceptions import AdminPasswordChangeForbiddenError
from src.infrastructure.database import UnitOfWork
from src.infrastructure.security.hasher import Hasher


class SetUserPassword:
	def __init__(self, uow: UnitOfWork, hasher: Hasher):
		self.uow = uow
		self.hasher = hasher

	async def execute(self, command: SetUserPasswordCommand) -> None:
		async with self.uow:
			user = await self.uow.user.get(command.user_id)
			if user.is_admin and command.actor_id != command.user_id:
				raise AdminPasswordChangeForbiddenError()

			user.set_password(self.hasher.hash_password(command.password))
			await self.uow.user.update(user)
