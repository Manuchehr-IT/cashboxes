from src.application.settings.commands import UpdateOneCSettingsCommand
from src.application.settings.dtos import OneCSettingsDTO
from src.application.settings.queries import GetOneCSettingsQuery

from . import schemas


class OneCSettingsMapper:
	@staticmethod
	def to_response(dto: OneCSettingsDTO) -> schemas.OneCSettingsResponse:
		return schemas.OneCSettingsResponse(
			username=dto.username,
			has_password=dto.has_password,
		)

class GetOneCSettingsMapper:
	@staticmethod
	def to_query() -> GetOneCSettingsQuery:
		return GetOneCSettingsQuery()

class UpdateOneCSettingsMapper:
	@staticmethod
	def to_command(request: schemas.UpdateOneCSettingsRequest) -> UpdateOneCSettingsCommand:
		data = {name: getattr(request, name) for name in request.model_fields_set}
		return UpdateOneCSettingsCommand(**data)
