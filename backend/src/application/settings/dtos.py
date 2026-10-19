from pydantic import BaseModel


class OneCSettingsDTO(BaseModel):
	username: str
	has_password: bool
