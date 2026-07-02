from src.application.user.dtos import UserDTO
from src.application.user.mappers import UserMapper
from src.application.user.queries import GetUserQuery
from src.infrastructure.database import UnitOfWork


class GetUser:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, query: GetUserQuery) -> UserDTO:
		async with self.uow:
			user = await self.uow.user.get(id=query.id)
			return UserMapper.to_dto(user)
