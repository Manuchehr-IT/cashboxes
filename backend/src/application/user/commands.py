from uuid import UUID

from pydantic import BaseModel

from src.core.sentinels import UNSET, UnsetType
from src.domain.user.enums import CashAccessScope


class CreateUserCommand(BaseModel):
	username: str
	is_active: bool
	cash_access_scope: CashAccessScope = CashAccessScope.ALL

class UpdateUserCommand(BaseModel):
	id: UUID
	username: str | UnsetType = UNSET
	is_active: bool | UnsetType = UNSET
	cash_access_scope: CashAccessScope | UnsetType = UNSET

class SetUserPasswordCommand(BaseModel):
	actor_id: UUID
	user_id: UUID
	password: str

class DeleteUserCommand(BaseModel):
	actor_id: UUID
	user_id: UUID


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
