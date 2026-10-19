from src.domain.settings.entities import OneCSettings
from src.infrastructure.database.models import OneCSettingsModel


class OneCSettingsMapper:
	@staticmethod
	def to_domain(model: OneCSettingsModel) -> OneCSettings:
		return OneCSettings(
			id=model.id,
			username=model.username,
			password=model.password,
			created_at=model.created_at,
			updated_at=model.updated_at,
		)

	@staticmethod
	def to_model(settings: OneCSettings) -> OneCSettingsModel:
		return OneCSettingsModel(
			id=settings.id,
			username=settings.username,
			password=settings.password,
			created_at=settings.created_at,
			updated_at=settings.updated_at,
		)
