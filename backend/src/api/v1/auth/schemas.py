from pydantic import BaseModel


class AuthLoginRequest(BaseModel):
	username: str
	password: str

class AuthResultResponse(BaseModel):
	access_token: str
	refresh_token: str | None = None
	is_new: bool = False
