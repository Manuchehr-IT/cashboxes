from src.application.object.dtos import ObjectDTO
from src.application.object.mappers import ObjectMapper
from src.application.object.queries import GetObjectQuery
from src.infrastructure.database import UnitOfWork


class GetObject:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, query: GetObjectQuery) -> ObjectDTO:
		async with self.uow:
			obj = await self.uow.obj.get(query.id)
			return ObjectMapper.to_dto(obj)
