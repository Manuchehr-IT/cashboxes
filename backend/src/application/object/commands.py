from uuid import UUID

from pydantic import BaseModel

from src.core.sentinels import UNSET, UnsetType


class CreateObjectCommand(BaseModel):
	title: str
	url: str
	is_active: bool

class UpdateObjectCommand(BaseModel):
	id: UUID
	title: str | UnsetType = UNSET
	url: str | UnsetType = UNSET
	is_active: bool | UnsetType = UNSET

class DeleteObjectCommand(BaseModel):
	id: UUID
