from src.application.object.commands import DeleteObjectCommand
from src.infrastructure.database import UnitOfWork


class DeleteObject:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: DeleteObjectCommand) -> None:
		async with self.uow:
			await self.uow.obj.delete(command.id)
