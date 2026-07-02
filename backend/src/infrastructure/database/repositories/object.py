from uuid import UUID

from sqlalchemy import func, select, exists
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.sorting import SortField
from src.domain.object.entities import Object
from src.domain.object.exceptions import ObjectAlreadyExistsError, ObjectNotFoundError
from src.infrastructure.database.mappers.object import ObjectMapper
from src.infrastructure.database.models import ObjectModel
from src.infrastructure.database.utils import LIKE_ESCAPE, SelectT, SortColumns, apply_sort, like_contains


class ObjectRepository:
	def __init__(self, session: AsyncSession):
		self.session = session

	async def _find_model(self, id: UUID) -> ObjectModel | None:
		result = await self.session.execute(
			select(ObjectModel).where(ObjectModel.id == id)
		)
		return result.scalar_one_or_none()

	async def _get_model(self, id: UUID) -> ObjectModel:
		model = await self._find_model(id)
		if not model:
			raise ObjectNotFoundError(id=str(id))
		return model

	async def add(self, obj: Object) -> None:
		model = ObjectMapper.to_model(obj)
		self.session.add(model)

		try:
			await self.session.flush()
		except IntegrityError as e:
			error_text = str(e.orig)
			if "uq_object_title" in error_text:
				raise ObjectAlreadyExistsError(title=obj.title) from e
			if "uq_object_url" in error_text:
				raise ObjectAlreadyExistsError(url=obj.url) from e
			raise

	async def exists(self, id: UUID) -> bool:
		result = await self.session.execute(
			select(exists().where(ObjectModel.id == id))
		)
		return bool(result.scalar())

	async def get(self, id: UUID) -> Object:
		model = await self._get_model(id)
		return ObjectMapper.to_domain(model)

	async def update(self, obj: Object) -> None:
		model = await self._get_model(obj.id)
		model.title = obj.title
		model.url = obj.url
		model.is_active = obj.is_active
		model.updated_at = obj.updated_at

		try:
			await self.session.flush()
		except IntegrityError as e:
			error_text = str(e.orig)
			if "uq_object_title" in error_text:
				raise ObjectAlreadyExistsError(title=obj.title) from e
			if "uq_object_url" in error_text:
				raise ObjectAlreadyExistsError(url=obj.url) from e
			raise

	async def delete(self, id: UUID) -> None:
		model = await self._get_model(id)
		await self.session.delete(model)
		await self.session.flush()

	def _apply_filters(self, stmt: SelectT, q: str | None, is_active: bool | None) -> SelectT:
		if q:
			pattern = like_contains(q)
			stmt = stmt.where(
				ObjectModel.title.ilike(pattern, escape=LIKE_ESCAPE),
			)
		if is_active is not None:
			stmt = stmt.where(ObjectModel.is_active == is_active)
		return stmt

	_SORT_COLUMNS: SortColumns = {
		"title": ObjectModel.title,
		"url": ObjectModel.url,
		"is_active": ObjectModel.is_active,
		"created_at": ObjectModel.created_at,
	}

	async def list(self, limit: int, offset: int, q: str | None, sort: list[SortField], is_active: bool | None) -> list[Object]:
		stmt = self._apply_filters(select(ObjectModel), q, is_active)
		stmt = apply_sort(stmt, self._SORT_COLUMNS, sort, ObjectModel.created_at.desc())
		stmt = stmt.limit(limit).offset(offset)
		result = await self.session.execute(stmt)
		return [ObjectMapper.to_domain(model) for model in result.scalars().all()]

	async def count(self, q: str | None, is_active: bool | None) -> int:
		stmt = self._apply_filters(select(func.count()).select_from(ObjectModel), q, is_active)
		result = await self.session.execute(stmt)
		return result.scalar_one()
