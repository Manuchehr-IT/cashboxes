from src.application.auth.commands import AuthLoginCommand
from src.application.auth.dtos import AuthResultDTO

from . import schemas


class AuthResultMapper:
	@staticmethod
	def to_response(dto: AuthResultDTO) -> schemas.AuthResultResponse:
		return schemas.AuthResultResponse(
			access_token=dto.access_token,
			refresh_token=dto.refresh_token,
			is_new=dto.is_new
		)

class AuthLoginMapper:
	@staticmethod
	def to_command(request: schemas.AuthLoginRequest) -> AuthLoginCommand:
		return AuthLoginCommand(
			username=request.username,
			password=request.password,
		)
