from uuid import UUID

from pydantic import BaseModel

from src.core.sorting import SortField
from src.core.text import SearchQuery


class GetObjectQuery(BaseModel):
	id: UUID

class ListObjectsQuery(BaseModel):
	limit: int
	offset: int
	q: SearchQuery
	sort: list[SortField]
	is_active: bool | None
