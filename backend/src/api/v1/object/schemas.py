from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateObjectRequest(BaseModel):
    title: str
    url: str
    is_active: bool


class UpdateObjectRequest(BaseModel):
    title: str | None = None
    url: str | None = None
    is_active: bool | None = None


class ObjectResponse(BaseModel):
    id: UUID
    title: str
    url: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ListObjectsResponse(BaseModel):
    items: list[ObjectResponse]
    count: int
