from uuid import UUID

from pydantic import BaseModel


class DebtResponse(BaseModel):
	acc_code: str
	acc_name: str
	kontr: str
	manager: str
	contract: str
	debt: float
	currency: str
	vid_raschet: str

class ObjectDebtsResponse(BaseModel):
	object_id: UUID
	object_title: str
	debts: list[DebtResponse]

class FailedObjectResponse(BaseModel):
	object_id: UUID
	object_title: str

class ListCounterpartiesResponse(BaseModel):
	items: list[ObjectDebtsResponse]
	failed_objects: list[FailedObjectResponse]
