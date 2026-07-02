from uuid import UUID

from pydantic import BaseModel

from src.core.sentinels import UNSET, UnsetType


class CreateUserCommand(BaseModel):
	username: str
	is_active: bool

class UpdateUserCommand(BaseModel):
	id: UUID
	username: str | UnsetType = UNSET
	is_active: bool | UnsetType = UNSET

class SetUserPasswordCommand(BaseModel):
	id: UUID
	password: str

class DeleteUserCommand(BaseModel):
	id: UUID


class SyncUserObjectsCommand(BaseModel):
	actor_id: UUID
	user_id: UUID
	object_ids: list[UUID]

class GrantObjectAccessCommand(BaseModel):
	actor_id: UUID
	user_id: UUID
	object_id: UUID

class RevokeObjectAccessCommand(BaseModel):
	actor_id: UUID
	user_id: UUID
	object_id: UUID
