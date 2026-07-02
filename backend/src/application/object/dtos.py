from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ObjectDTO(BaseModel):
	id: UUID
	title: str
	url: str
	is_active: bool
	created_at: datetime
	updated_at: datetime

class ListObjectsDTO(BaseModel):
	items: list[ObjectDTO]
	count: int
