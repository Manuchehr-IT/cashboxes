from dataclasses import dataclass
from typing import Self
from uuid import UUID

@dataclass(frozen=True)
class UserObject:
	object_id: UUID

	@classmethod
	def create(cls, object_id: UUID) -> Self:
		return cls(object_id=object_id)
