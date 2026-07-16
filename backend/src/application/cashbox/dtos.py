from uuid import UUID

from pydantic import BaseModel


class CashboxDTO(BaseModel):
	id: str
	name: str
	currency: str
	ost1: float
	sump: float
	sumr: float
	ost2: float

class ObjectCashboxesDTO(BaseModel):
	object_id: UUID
	object_title: str
	cashboxes: list[CashboxDTO]

class FailedObjectDTO(BaseModel):
	object_id: UUID
	object_title: str

class ListCashboxesDTO(BaseModel):
	items: list[ObjectCashboxesDTO]
	failed_objects: list[FailedObjectDTO]


class CashDetailDTO(BaseModel):
	ddsname: str
	sump: float
	sumr: float
	subkonto: list[str]
	doc: str
	comment: str
