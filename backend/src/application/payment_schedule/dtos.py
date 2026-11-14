from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PaymentEntryDTO(BaseModel):
	date: datetime
	sum: float

class PaymentScheduleEntryDTO(BaseModel):
	kontragent: str
	contract: str
	plan: list[PaymentEntryDTO]
	currency: str
	ost_start: float
	ost_end: float
	fact: list[PaymentEntryDTO]
	phone: str

class ObjectPaymentScheduleDTO(BaseModel):
	object_id: UUID
	object_title: str
	entries: list[PaymentScheduleEntryDTO]

class FailedObjectDTO(BaseModel):
	object_id: UUID
	object_title: str

class ListPaymentScheduleDTO(BaseModel):
	items: list[ObjectPaymentScheduleDTO]
	failed_objects: list[FailedObjectDTO]
