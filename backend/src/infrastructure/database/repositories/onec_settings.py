from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.settings.entities import OneCSettings
from src.infrastructure.database.mappers.onec_settings import OneCSettingsMapper
from src.infrastructure.database.models import OneCSettingsModel


class OneCSettingsRepository:
	def __init__(self, session: AsyncSession):
		self.session = session

	async def get(self) -> OneCSettings:
		"""Singleton-строка настроек 1C — обычно сидится миграцией. Если её всё же нет
		(ручное вмешательство в БД), создаём пустую вместо падения."""
		result = await self.session.execute(select(OneCSettingsModel).limit(1))
		model = result.scalar_one_or_none()
		if model is None:
			settings = OneCSettings.create(username="", password="")
			self.session.add(OneCSettingsMapper.to_model(settings))
			await self.session.flush()
			return settings
		return OneCSettingsMapper.to_domain(model)

	async def update(self, settings: OneCSettings) -> None:
		result = await self.session.execute(select(OneCSettingsModel).where(OneCSettingsModel.id == settings.id))
		model = result.scalar_one()
		model.username = settings.username
		model.password = settings.password
		model.updated_at = settings.updated_at
		await self.session.flush()
