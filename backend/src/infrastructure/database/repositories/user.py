import builtins
from uuid import UUID

from sqlalchemy import func, select, exists
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.sorting import SortField
from src.domain.user.entities import User
from src.domain.user.exceptions import UserAlreadyExistsError, UserNotFoundError
from src.infrastructure.database.mappers.user import UserMapper
from src.infrastructure.database.models import UserModel
from src.infrastructure.database.utils import LIKE_ESCAPE, SelectT, SortColumns, apply_sort, like_contains


class UserRepository:
	def __init__(self, session: AsyncSession):
		self.session = session

	async def _find_model(self, id: UUID) -> UserModel | None:
		result = await self.session.execute(
			select(UserModel).where(UserModel.id == id)
		)
		return result.scalar_one_or_none()

	async def _get_model(self, id: UUID) -> UserModel:
		model = await self._find_model(id)
		if not model:
			raise UserNotFoundError(id=str(id))
		return model

	async def add(self, user: User) -> None:
		model = UserMapper.to_model(user)
		self.session.add(model)

		try:
			await self.session.flush()
		except IntegrityError as e:
			error_text = str(e.orig)
			if user.username and "uq_user_username" in error_text:
				raise UserAlreadyExistsError(username=user.username) from e
			raise

	async def exists(self, id: UUID) -> bool:
		result = await self.session.execute(
			select(exists().where(UserModel.id == id))
		)
		return bool(result.scalar())

	async def find(self, id: UUID) -> User | None:
		model = await self._find_model(id)
		return UserMapper.to_domain(model) if model else None

	async def find_by_username(self, username: str) -> User | None:
		result = await self.session.execute(
			select(UserModel).where(UserModel.username == username)
		)
		model = result.scalar_one_or_none()
		if model:
			return UserMapper.to_domain(model)

	async def get(self, id: UUID) -> User:
		model = await self._get_model(id)
		return UserMapper.to_domain(model)

	async def update(self, user: User) -> None:
		model = await self._get_model(user.id)
		model.username = user.username
		model.password_hash = user.password_hash
		model.is_active = user.is_active
		model.updated_at = user.updated_at

		try:
			await self.session.flush()
		except IntegrityError as e:
			error_text = str(e.orig)
			if user.username and "uq_user_username" in error_text:
				raise UserAlreadyExistsError(username=user.username) from e
			raise

	async def delete(self, id: UUID) -> None:
		model = await self._get_model(id)
		await self.session.delete(model)
		await self.session.flush()

	def _apply_filters(self, stmt: SelectT, q: str | None, is_active: bool | None) -> SelectT:
		if q:
			pattern = like_contains(q)
			stmt = stmt.where(
				UserModel.username.ilike(pattern, escape=LIKE_ESCAPE),
			)
		if is_active is not None:
			stmt = stmt.where(UserModel.is_active == is_active)
		return stmt

	_SORT_COLUMNS: SortColumns = {
		"username": UserModel.username,
		"is_active": UserModel.is_active,
		"created_at": UserModel.created_at,
	}

	async def list(self, limit: int, offset: int, q: str | None, sort: list[SortField], is_active: bool | None) -> list[User]:
		stmt = self._apply_filters(select(UserModel), q, is_active)
		stmt = apply_sort(stmt, self._SORT_COLUMNS, sort, UserModel.created_at.desc())
		stmt = stmt.limit(limit).offset(offset)
		result = await self.session.execute(stmt)
		return [UserMapper.to_domain(model) for model in result.scalars().all()]

	async def list_by_ids(self, ids: builtins.list[UUID]) -> builtins.list[User]:
		if not ids:
			return []
		result = await self.session.execute(
			select(UserModel).where(UserModel.id.in_(ids))
		)
		return [UserMapper.to_domain(m) for m in result.scalars().all()]

	async def count(self, q: str | None, is_active: bool | None) -> int:
		stmt = self._apply_filters(select(func.count()).select_from(UserModel), q, is_active)
		result = await self.session.execute(stmt)
		return result.scalar_one()
