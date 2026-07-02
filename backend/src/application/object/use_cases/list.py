from src.application.object.dtos import ListObjectsDTO
from src.application.object.mappers import ObjectMapper
from src.application.object.queries import ListObjectsQuery
from src.infrastructure.database import UnitOfWork


class ListObjects:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, query: ListObjectsQuery) -> ListObjectsDTO:
		async with self.uow:
			objects = await self.uow.obj.list(
				limit=query.limit,
				offset=query.offset,
				q=query.q,
				sort=query.sort,
				is_active=query.is_active,
			)
			count = await self.uow.obj.count(
				q=query.q,
				is_active=query.is_active,
			)
			return ListObjectsDTO(
				items=[ObjectMapper.to_dto(object) for object in objects],
				count=count,
			)
