from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.user.dtos import ObjectAccessDTO
from src.core.sorting import SortField
from src.domain.user.exceptions import ObjectAccessNotFoundError
from src.infrastructure.database.models import ObjectModel, UserObjectModel
from src.infrastructure.database.utils import SelectT, SortColumns, apply_sort


class UserObjectRepository:
	def __init__(self, session: AsyncSession):
		self.session = session

	async def _find_model(self, user_id: UUID, object_id: UUID) -> UserObjectModel | None:
		result = await self.session.execute(
			select(UserObjectModel).where(
				(UserObjectModel.user_id == user_id) &
				(UserObjectModel.object_id == object_id)
			)
		)
		return result.scalar_one_or_none()

	async def _get_model(self, user_id: UUID, object_id: UUID) -> UserObjectModel:
		model = await self._find_model(user_id, object_id)
		if not model:
			raise ObjectAccessNotFoundError(user_id=str(user_id), object_id=str(object_id))
		return model

	async def has_access(self, user_id: UUID, object_id: UUID) -> bool:
		model = await self._find_model(user_id, object_id)
		return model is not None

	async def add(self, user_id: UUID, object_id: UUID) -> None:
		await self.session.execute(
			insert(UserObjectModel).on_conflict_do_nothing(),
			{"user_id": user_id, "object_id": object_id},
		)
		await self.session.flush()

	async def remove(self, user_id: UUID, object_id: UUID) -> None:
		await self.session.execute(
			delete(UserObjectModel).where(
				UserObjectModel.user_id == user_id,
				UserObjectModel.object_id == object_id,
			)
		)
		await self.session.flush()

	async def add_batch(self, user_id: UUID, object_ids: list[UUID]) -> None:
		if not object_ids:
			return
		await self.session.execute(
			insert(UserObjectModel).on_conflict_do_nothing(),
			[{"user_id": user_id, "object_id": oid} for oid in object_ids],
		)

	async def delete_batch(self, user_id: UUID, object_ids: list[UUID]) -> None:
		if not object_ids:
			return
		await self.session.execute(
			delete(UserObjectModel).where(
				(UserObjectModel.user_id == user_id) &
				(UserObjectModel.object_id.in_(object_ids))
			)
		)

	async def get_object_ids_by_user(self, user_id: UUID) -> list[UUID]:
		result = await self.session.execute(
			select(UserObjectModel.object_id).where(UserObjectModel.user_id == user_id)
		)
		return list(result.scalars().all())

	def _apply_filters(self, stmt: SelectT, is_assigned: bool | None) -> SelectT:
		if is_assigned is True:
			stmt = stmt.where(UserObjectModel.object_id.isnot(None))
		elif is_assigned is False:
			stmt = stmt.where(UserObjectModel.object_id.is_(None))
		return stmt

	_SORT_COLUMNS: SortColumns = {
		"title": ObjectModel.title,
		"url": ObjectModel.url,
		"is_assigned": UserObjectModel.object_id.isnot(None),
	}

	async def list_all_with_access(
		self,
		user_id: UUID,
		limit: int,
		offset: int,
		sort: list[SortField],
		is_assigned: bool | None = None,
	) -> list[ObjectAccessDTO]:
		assigned_expr = UserObjectModel.object_id.isnot(None)
		stmt = (
			select(
				ObjectModel.id,
				ObjectModel.title,
				ObjectModel.url,
				assigned_expr.label("is_assigned"),
			)
			.outerjoin(
				UserObjectModel,
				(UserObjectModel.object_id == ObjectModel.id)
				& (UserObjectModel.user_id == user_id),
			)
			.where(ObjectModel.is_active == True)
		)
		stmt = self._apply_filters(stmt, is_assigned)
		stmt = apply_sort(stmt, self._SORT_COLUMNS, sort, ObjectModel.title.asc())
		stmt = stmt.limit(limit).offset(offset)
		result = await self.session.execute(stmt)
		return [
			ObjectAccessDTO(id=row.id, title=row.title, url=row.url, is_assigned=row.is_assigned)
			for row in result.all()
		]

	async def count_all_with_access(self, user_id: UUID, is_assigned: bool | None = None) -> int:
		stmt = (
			select(func.count())
			.select_from(ObjectModel)
			.outerjoin(
				UserObjectModel,
				(UserObjectModel.object_id == ObjectModel.id)
				& (UserObjectModel.user_id == user_id),
			)
			.where(ObjectModel.is_active == True)
		)
		stmt = self._apply_filters(stmt, is_assigned)
		result = await self.session.execute(stmt)
		return result.scalar_one()
