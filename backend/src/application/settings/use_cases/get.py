from src.application.settings.dtos import OneCSettingsDTO
from src.application.settings.mappers import OneCSettingsMapper
from src.application.settings.queries import GetOneCSettingsQuery
from src.infrastructure.database import UnitOfWork


class GetOneCSettings:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, query: GetOneCSettingsQuery) -> OneCSettingsDTO:
		async with self.uow:
			settings = await self.uow.onec_settings.get()
			return OneCSettingsMapper.to_dto(settings)
