from src.application.user.commands import GrantObjectAccessCommand
from src.domain.object.exceptions import ObjectNotFoundError
from src.domain.user.exceptions import AdminAccessForbiddenError, SelfAccessForbiddenError
from src.infrastructure.database import UnitOfWork


class GrantObjectAccess:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: GrantObjectAccessCommand) -> None:
		async with self.uow:
			if command.actor_id == command.user_id:
				raise SelfAccessForbiddenError()

			user = await self.uow.user.get(command.user_id)
			if user.is_admin:
				raise AdminAccessForbiddenError()

			if not await self.uow.obj.exists(command.object_id):
				raise ObjectNotFoundError(id=str(command.object_id))
			await self.uow.user_object.add(command.user_id, command.object_id)
