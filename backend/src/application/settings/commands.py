from pydantic import BaseModel

from src.core.sentinels import UNSET, UnsetType


class UpdateOneCSettingsCommand(BaseModel):
	username: str | UnsetType = UNSET
	password: str | UnsetType = UNSET
