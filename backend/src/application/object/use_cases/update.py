from src.application.object.commands import UpdateObjectCommand
from src.application.object.dtos import ObjectDTO
from src.application.object.mappers import ObjectMapper
from src.infrastructure.database import UnitOfWork


class UpdateObject:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: UpdateObjectCommand) -> ObjectDTO:
		async with self.uow:
			obj = await self.uow.obj.get(command.id)
			obj.update(
				title=command.title,
				url=command.url,
				is_active=command.is_active,
			)
			await self.uow.obj.update(obj)
			return ObjectMapper.to_dto(obj)
