from src.application.user.commands import DeleteUserCommand
from src.domain.user.exceptions import AdminDeletionForbiddenError, SelfDeletionForbiddenError
from src.infrastructure.database import UnitOfWork


class DeleteUser:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: DeleteUserCommand) -> None:
		async with self.uow:
			if command.actor_id == command.user_id:
				raise SelfDeletionForbiddenError()

			user = await self.uow.user.get(command.user_id)
			if user.is_admin:
				raise AdminDeletionForbiddenError()

			await self.uow.user.delete(command.user_id)
