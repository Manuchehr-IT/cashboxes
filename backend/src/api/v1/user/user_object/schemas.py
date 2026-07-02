from pydantic import BaseModel
from uuid import UUID


class SyncUserObjectsRequest(BaseModel):
	object_ids: list[UUID]

class ObjectAccessResponse(BaseModel):
	id: UUID
	title: str
	url: str
	is_assigned: bool

class ListUserObjectsResponse(BaseModel):
	items: list[ObjectAccessResponse]
	count: int
