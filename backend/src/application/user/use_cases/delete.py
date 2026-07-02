from src.application.user.commands import DeleteUserCommand
from src.infrastructure.database import UnitOfWork


class DeleteUser:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: DeleteUserCommand) -> None:
		async with self.uow:
			await self.uow.user.delete(command.id)
