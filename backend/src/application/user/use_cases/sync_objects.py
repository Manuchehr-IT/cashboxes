from src.application.user.commands import SyncUserObjectsCommand
from src.domain.user.exceptions import AdminAccessForbiddenError, SelfAccessForbiddenError
from src.infrastructure.database import UnitOfWork


class SyncUserObjects:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: SyncUserObjectsCommand) -> None:
		async with self.uow:
			if command.actor_id == command.user_id:
				raise SelfAccessForbiddenError()

			user = await self.uow.user.get(command.user_id)

			if user.is_admin:
				raise AdminAccessForbiddenError()

			current_object_ids = await self.uow.user_object.get_object_ids_by_user(command.user_id)

			current_set = set(current_object_ids)
			target_set = set(command.object_ids)

			# Вычисляем дельту (чистая прикладная логика)
			ids_to_add = target_set - current_set       # Не были в БД, но добавили чекбоксы
			ids_to_delete = current_set - target_set    # Были в БД, но убрали чекбоксы

			if ids_to_delete:
				await self.uow.user_object.delete_batch(
					user_id=command.user_id, 
					object_ids=list(ids_to_delete)
				)

			if ids_to_add:
				await self.uow.user_object.add_batch(user_id=command.user_id, object_ids=list(ids_to_add))
