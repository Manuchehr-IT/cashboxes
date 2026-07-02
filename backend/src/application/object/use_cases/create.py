from src.application.object.commands import CreateObjectCommand
from src.application.object.dtos import ObjectDTO
from src.application.object.mappers import ObjectMapper
from src.domain.object.entities import Object
from src.infrastructure.database import UnitOfWork


class CreateObject:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: CreateObjectCommand) -> ObjectDTO:
		async with self.uow:
			obj = Object.create(
				title=command.title,
				url=command.url,
				is_active=command.is_active,
			)

			await self.uow.obj.add(obj)
			return ObjectMapper.to_dto(obj)
