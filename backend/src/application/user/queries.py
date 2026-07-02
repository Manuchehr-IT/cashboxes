from uuid import UUID

from pydantic import BaseModel

from src.core.sorting import SortField
from src.core.text import SearchQuery


class GetUserQuery(BaseModel):
	id: UUID

class ListUsersQuery(BaseModel):
	limit: int
	offset: int
	q: SearchQuery
	sort: list[SortField]
	is_active: bool | None

class ListUserObjectsQuery(BaseModel):
	user_id: UUID
	limit: int
	offset: int
	sort: list[SortField]
	is_assigned: bool | None
