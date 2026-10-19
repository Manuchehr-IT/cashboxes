from pydantic import BaseModel


class OneCSettingsResponse(BaseModel):
	username: str
	has_password: bool


class UpdateOneCSettingsRequest(BaseModel):
	username: str | None = None
	password: str | None = None
