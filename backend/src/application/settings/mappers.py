from src.domain.settings.entities import OneCSettings

from .dtos import OneCSettingsDTO


class OneCSettingsMapper:
	@staticmethod
	def to_dto(settings: OneCSettings) -> OneCSettingsDTO:
		return OneCSettingsDTO(
			username=settings.username,
			has_password=bool(settings.password),
		)
