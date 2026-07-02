from pydantic import BaseModel


class AuthResultDTO(BaseModel):
	access_token: str
	refresh_token: str | None = None
	is_new: bool = False
