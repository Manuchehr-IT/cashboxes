from uuid import UUID

from src.application.object.commands import CreateObjectCommand, DeleteObjectCommand, UpdateObjectCommand
from src.application.object.dtos import ListObjectsDTO, ObjectDTO
from src.application.object.queries import GetObjectQuery, ListObjectsQuery
from src.core.sorting import parse_sort

from . import schemas


class ObjectMapper:
	@staticmethod
	def to_response(dto: ObjectDTO) -> schemas.ObjectResponse:
		return schemas.ObjectResponse(
			id=dto.id,
			title=dto.title,
			url=dto.url,
			is_active=dto.is_active,
			created_at=dto.created_at,
			updated_at=dto.updated_at,
		)

class CreateObjectMapper:
	@staticmethod
	def to_command(request: schemas.CreateObjectRequest) -> CreateObjectCommand:
		return CreateObjectCommand(
			title=request.title,
			url=request.url,
			is_active=request.is_active,
		)

class GetObjectMapper:
	@staticmethod
	def to_query(id: UUID) -> GetObjectQuery:
		return GetObjectQuery(id=id)

class UpdateObjectMapper:
	@staticmethod
	def to_command(request: schemas.UpdateObjectRequest, id: UUID) -> UpdateObjectCommand:
		data = {name: getattr(request, name) for name in request.model_fields_set}
		return UpdateObjectCommand(id=id, **data)

class DeleteObjectMapper:
	@staticmethod
	def to_command(id: UUID) -> DeleteObjectCommand:
		return DeleteObjectCommand(id=id)

class ListObjectsMapper:
	@staticmethod
	def to_query(limit: int, offset: int, q: str | None, sort: str | None, is_active: bool | None) -> ListObjectsQuery:
		return ListObjectsQuery(
			limit=limit,
			offset=offset,
			q=q,
			sort=parse_sort(sort),
			is_active=is_active,
		)

	@staticmethod
	def to_response(dto: ListObjectsDTO) -> schemas.ListObjectsResponse:
		return schemas.ListObjectsResponse(
			items=[ObjectMapper.to_response(item) for item in dto.items],
			count=dto.count,
		)
