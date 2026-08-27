from src.application.user.commands import UpdateUserCommand
from src.application.user.dtos import UserDTO
from src.application.user.mappers import UserMapper
from src.infrastructure.database import UnitOfWork


class UpdateUser:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: UpdateUserCommand) -> UserDTO:
		async with self.uow:
			user = await self.uow.user.get(id=command.id)
			user.update(
				username=command.username,
				cash_access_scope=command.cash_access_scope,
				can_view_cashboxes=command.can_view_cashboxes,
				can_view_counterparties=command.can_view_counterparties,
			)
			await self.uow.user.update(user)
			return UserMapper.to_dto(user)
