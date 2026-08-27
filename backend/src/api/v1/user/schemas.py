from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.domain.user.enums import CashAccessScope


class CreateUserRequest(BaseModel):
	username: str
	cash_access_scope: CashAccessScope = CashAccessScope.ALL
	can_view_cashboxes: bool = True
	can_view_counterparties: bool = True

class UpdateUserRequest(BaseModel):
	username: str | None = None
	cash_access_scope: CashAccessScope | None = None
	can_view_cashboxes: bool | None = None
	can_view_counterparties: bool | None = None

class SetUserPasswordRequest(BaseModel):
	password: str = Field(min_length=8)

class UserResponse(BaseModel):
	id: UUID
	username: str
	is_admin: bool
	cash_access_scope: CashAccessScope
	can_view_cashboxes: bool
	can_view_counterparties: bool
	created_at: datetime
	updated_at: datetime

class UserWithPasswordResponse(BaseModel):
	user: UserResponse
	password: str

class ListUsersResponse(BaseModel):
	items: list[UserResponse]
	count: int
