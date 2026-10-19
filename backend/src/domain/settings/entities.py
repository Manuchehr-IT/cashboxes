from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Self
from uuid import UUID, uuid4

from src.core.sentinels import UNSET, UnsetType


@dataclass
class OneCSettings:
	id: UUID
	username: str
	password: str
	created_at: datetime
	updated_at: datetime

	@classmethod
	def create(
		cls,
		username: str,
		password: str,
	) -> Self:
		now = datetime.now(UTC)
		return cls(
			id=uuid4(),
			username=username,
			password=password,
			created_at=now,
			updated_at=now,
		)

	def update(
		self,
		*,
		username: str | UnsetType = UNSET,
		password: str | UnsetType = UNSET,
	) -> None:
		if username is not UNSET:
			self.username = username
		if password is not UNSET:
			self.password = password
		self._touch()

	def _touch(self):
		self.updated_at = datetime.now(UTC)
