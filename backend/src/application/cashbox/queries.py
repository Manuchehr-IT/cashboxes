from datetime import date
from uuid import UUID

from pydantic import BaseModel


class ListCashboxesQuery(BaseModel):
	user_id: UUID
	date_from: date | None = None
	date_to: date | None = None

class GetCashDetailsQuery(BaseModel):
	user_id: UUID
	object_id: UUID
	cash_id: str
	date_from: date | None = None
	date_to: date | None = None
