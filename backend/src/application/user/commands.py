from uuid import UUID

from pydantic import BaseModel

from src.core.sentinels import UNSET, UnsetType
from src.domain.user.enums import CashAccessScope


class CreateUserCommand(BaseModel):
	username: str
	cash_access_scope: CashAccessScope = CashAccessScope.ALL
	can_view_cashboxes: bool = True
	can_view_counterparties: bool = True

class UpdateUserCommand(BaseModel):
	id: UUID
	username: str | UnsetType = UNSET
	cash_access_scope: CashAccessScope | UnsetType = UNSET
	can_view_cashboxes: bool | UnsetType = UNSET
	can_view_counterparties: bool | UnsetType = UNSET

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
