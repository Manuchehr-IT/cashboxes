from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PaymentEntryResponse(BaseModel):
	date: datetime
	sum: float

class PaymentScheduleEntryResponse(BaseModel):
	kontragent: str
	contract: str
	plan: list[PaymentEntryResponse]
	currency: str
	ost_start: float
	ost_end: float
	fact: list[PaymentEntryResponse]
	phone: str

class ObjectPaymentScheduleResponse(BaseModel):
	object_id: UUID
	object_title: str
	entries: list[PaymentScheduleEntryResponse]

class FailedObjectResponse(BaseModel):
	object_id: UUID
	object_title: str

class ListPaymentScheduleResponse(BaseModel):
	items: list[ObjectPaymentScheduleResponse]
	failed_objects: list[FailedObjectResponse]
