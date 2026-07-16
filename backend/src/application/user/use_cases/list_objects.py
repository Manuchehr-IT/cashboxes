from src.application.user.dtos import ListUserObjectsDTO
from src.application.user.queries import ListUserObjectsQuery
from src.infrastructure.database import UnitOfWork


class ListUserObjects:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, query: ListUserObjectsQuery) -> ListUserObjectsDTO:
		async with self.uow:
			items = await self.uow.user_object.list_all_with_access(
				user_id=query.user_id,
				is_assigned=query.is_assigned,
				sort=query.sort,
				limit=query.limit,
				offset=query.offset,
			)
			count = await self.uow.user_object.count_all_with_access(
				user_id=query.user_id,
				is_assigned=query.is_assigned,
			)
			return ListUserObjectsDTO(items=items, count=count)
