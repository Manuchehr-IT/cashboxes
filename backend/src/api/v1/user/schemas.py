from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.domain.user.enums import CashAccessScope


class CreateUserRequest(BaseModel):
	username: str
	is_active: bool
	cash_access_scope: CashAccessScope = CashAccessScope.ALL

class UpdateUserRequest(BaseModel):
	username: str | None = None
	is_active: bool | None = None
	cash_access_scope: CashAccessScope | None = None

class SetUserPasswordRequest(BaseModel):
	password: str = Field(min_length=8)

class UserResponse(BaseModel):
	id: UUID
	username: str
	is_active: bool
	is_admin: bool
	cash_access_scope: CashAccessScope
	created_at: datetime
	updated_at: datetime

class UserWithPasswordResponse(BaseModel):
	user: UserResponse
	password: str

class ListUsersResponse(BaseModel):
	items: list[UserResponse]
	count: int
