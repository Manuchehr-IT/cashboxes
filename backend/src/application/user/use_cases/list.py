from src.application.user.dtos import ListUsersDTO
from src.application.user.mappers import UserMapper
from src.application.user.queries import ListUsersQuery
from src.infrastructure.database import UnitOfWork


class ListUsers:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, query: ListUsersQuery) -> ListUsersDTO:
		async with self.uow:
			users = await self.uow.user.list(
				q=query.q,
				is_active=query.is_active,
				sort=query.sort,
				limit=query.limit,
				offset=query.offset,
			)
			count = await self.uow.user.count(
				q=query.q,
				is_active=query.is_active,
			)
			return ListUsersDTO(
				items=[UserMapper.to_dto(m) for m in users],
				count=count,
			)
