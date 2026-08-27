from uuid import UUID

from pydantic import BaseModel


class DebtDTO(BaseModel):
	acc_code: str
	acc_name: str
	kontr: str
	manager: str
	contract: str
	debt: float
	currency: str
	vid_raschet: str

class ObjectDebtsDTO(BaseModel):
	object_id: UUID
	object_title: str
	debts: list[DebtDTO]

class FailedObjectDTO(BaseModel):
	object_id: UUID
	object_title: str

class ListCounterpartiesDTO(BaseModel):
	items: list[ObjectDebtsDTO]
	failed_objects: list[FailedObjectDTO]
