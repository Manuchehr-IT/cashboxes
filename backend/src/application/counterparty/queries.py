from uuid import UUID

from pydantic import BaseModel


class ListCounterpartiesQuery(BaseModel):
	user_id: UUID
