from src.application.settings.commands import UpdateOneCSettingsCommand
from src.application.settings.dtos import OneCSettingsDTO
from src.application.settings.mappers import OneCSettingsMapper
from src.infrastructure.database import UnitOfWork


class UpdateOneCSettings:
	def __init__(self, uow: UnitOfWork):
		self.uow = uow

	async def execute(self, command: UpdateOneCSettingsCommand) -> OneCSettingsDTO:
		async with self.uow:
			settings = await self.uow.onec_settings.get()
			settings.update(
				username=command.username,
				password=command.password,
			)
			await self.uow.onec_settings.update(settings)
			return OneCSettingsMapper.to_dto(settings)
