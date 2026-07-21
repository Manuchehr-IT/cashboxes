from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CreateUserRequest(BaseModel):
	username: str
	is_active: bool

class UpdateUserRequest(BaseModel):
	username: str | None = None
	is_active: bool | None = None

class SetUserPasswordRequest(BaseModel):
	password: str = Field(min_length=8)

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
