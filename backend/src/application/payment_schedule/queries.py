from datetime import date
from uuid import UUID

from pydantic import BaseModel


class ListPaymentScheduleQuery(BaseModel):
	user_id: UUID
	date_from: date | None
	date_to: date | None
