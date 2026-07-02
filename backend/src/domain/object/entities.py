from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Self
from uuid import UUID, uuid4

from src.core.sentinels import UNSET, UnsetType


@dataclass
class Object:
	id: UUID
	title: str
	url: str
	is_active: bool
	created_at: datetime
	updated_at: datetime

	@classmethod
	def create(
		cls,
		title: str,
		url: str,
		is_active: bool,
	) -> Self:
		now = datetime.now(UTC)
		return cls(
			id=uuid4(),
			title=title,
			url=url,
			is_active=is_active,
			created_at=now,
			updated_at=now,
		)

	def update(
		self,
		*,
		title: str | UnsetType = UNSET,
		url: str | UnsetType = UNSET,
		is_active: bool | UnsetType = UNSET,
	) -> None:
		if title is not UNSET:
			self.title = title
		if url is not UNSET:
			self.url = url
		if is_active is not UNSET:
			self.is_active = is_active
		self._touch()

	def _touch(self):
		self.updated_at = datetime.now(UTC)
