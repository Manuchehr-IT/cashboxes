from src.core.errors import BadRequestError


class InvalidCredentialsError(BadRequestError):
	code = "invalid_credentials"

	def __init__(self):
		super().__init__("Invalid credentials")
