from datetime import datetime
from pydantic import BaseModel
from uuid import UUID


class UserDTO(BaseModel):
	id: UUID
	username: str
	is_active: bool
	is_admin: bool
	created_at: datetime
	updated_at: datetime

class UserWithPasswordDTO(BaseModel):
	user: UserDTO
	password: str

class ListUsersDTO(BaseModel):
	items: list[UserDTO]
	count: int


class ObjectAccessDTO(BaseModel):
	id: UUID
	title: str
	url: str
	is_assigned: bool

class ListUserObjectsDTO(BaseModel):
	items: list[ObjectAccessDTO]
	count: int
