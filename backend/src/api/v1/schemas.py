from uuid import UUID

from pydantic import BaseModel


class IDResponse(BaseModel):
	id: UUID
