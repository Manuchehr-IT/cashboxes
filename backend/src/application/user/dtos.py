from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.domain.user.enums import CashAccessScope


class UserDTO(BaseModel):
	id: UUID
	username: str
	is_active: bool
	is_admin: bool
	cash_access_scope: CashAccessScope
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
