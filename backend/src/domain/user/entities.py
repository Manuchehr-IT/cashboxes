from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Self
from uuid import UUID, uuid4

from src.core.sentinels import UNSET, UnsetType

from .enums import CashAccessScope
from .value_objects.object import UserObject


@dataclass
class User:
	id: UUID
	username: str
	password_hash: str
	is_active: bool
	is_admin: bool
	cash_access_scope: CashAccessScope
	created_at: datetime
	updated_at: datetime

	_objects: list[UserObject] = field(default_factory=list[UserObject])

	@classmethod
	def create(
		cls,
		username: str,
		password_hash: str,
		is_active: bool,
		is_admin: bool,
		cash_access_scope: CashAccessScope = CashAccessScope.ALL,
	) -> Self:
		now = datetime.now(UTC)
		return cls(
			id=uuid4(),
			username=username,
			password_hash=password_hash,
			is_active=is_active,
			is_admin=is_admin,
			cash_access_scope=cash_access_scope,
			created_at=now,
			updated_at=now,
		)

	def update(
		self,
		*,
		username: str | UnsetType = UNSET,
		is_active: bool | UnsetType = UNSET,
		is_admin: bool | UnsetType = UNSET,
		cash_access_scope: CashAccessScope | UnsetType = UNSET,
	) -> None:
		if username is not UNSET:
			self.username = username
		if is_active is not UNSET:
			self.is_active = is_active
		if is_admin is not UNSET:
			self.is_admin = is_admin
		if cash_access_scope is not UNSET:
			self.cash_access_scope = cash_access_scope
		self._touch()

	@property
	def effective_cash_access_scope(self) -> CashAccessScope:
		"""Админы всегда видят все кассы, независимо от собственного cash_access_scope —
		как и с доступом к объектам (is_admin обходит UserObject)."""
		return CashAccessScope.ALL if self.is_admin else self.cash_access_scope

	def set_password(self, password_hash: str) -> None:
		self.password_hash = password_hash
		self._touch()

	def grant_access(self, object_id: UUID) -> None:
		user_object = UserObject.create(object_id=object_id)
		if any(i.object_id == user_object.object_id for i in self._objects):
			raise ValueError(f"Object {user_object.object_id} already exists")

		self._objects.append(user_object)
		self._touch()

	def _touch(self):
		self.updated_at = datetime.now(UTC)

	@property
	def objects(self) -> tuple[UserObject, ...]:
		return tuple(self._objects)
