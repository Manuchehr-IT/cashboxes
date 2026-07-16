from uuid import UUID

from pydantic import BaseModel


class CashboxResponse(BaseModel):
	id: str
	name: str
	currency: str
	ost1: float
	sump: float
	sumr: float
	ost2: float

class ObjectCashboxesResponse(BaseModel):
	object_id: UUID
	object_title: str
	cashboxes: list[CashboxResponse]

class FailedObjectResponse(BaseModel):
	object_id: UUID
	object_title: str

class ListCashboxesResponse(BaseModel):
	items: list[ObjectCashboxesResponse]
	failed_objects: list[FailedObjectResponse]


class CashDetailResponse(BaseModel):
	ddsname: str
	sump: float
	sumr: float
	subkonto: list[str]
	doc: str
	comment: str

class ListCashDetailsResponse(BaseModel):
	items: list[CashDetailResponse]
