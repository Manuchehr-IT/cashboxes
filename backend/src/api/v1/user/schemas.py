from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateUserRequest(BaseModel):
	username: str
	is_active: bool

class UpdateUserRequest(BaseModel):
	username: str | None = None
	is_active: bool | None = None

class UserResponse(BaseModel):
	id: UUID
	username: str
	is_active: bool
	is_admin: bool
	created_at: datetime
	updated_at: datetime

class UserWithPasswordResponse(BaseModel):
	user: UserResponse
	password: str

class ListUsersResponse(BaseModel):
	items: list[UserResponse]
	count: int
