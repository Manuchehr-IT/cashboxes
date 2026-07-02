from uuid import UUID

from src.application.user.commands import GrantObjectAccessCommand, RevokeObjectAccessCommand, SyncUserObjectsCommand
from src.application.user.dtos import ListUserObjectsDTO
from src.application.user.queries import ListUserObjectsQuery
from src.core.sorting import parse_sort
from . import schemas


class ListUserObjectsMapper:
	@staticmethod
	def to_query(
		user_id: UUID,
		limit: int,
		offset: int,
		sort: str | None,
		is_assigned: bool | None,
	) -> ListUserObjectsQuery:
		return ListUserObjectsQuery(
			user_id=user_id,
			limit=limit,
			offset=offset,
			sort=parse_sort(sort),
			is_assigned=is_assigned,
		)

	@staticmethod
	def to_response(dto: ListUserObjectsDTO) -> schemas.ListUserObjectsResponse:
		return schemas.ListUserObjectsResponse(
			items=[
				schemas.ObjectAccessResponse(
					id=item.id,
					title=item.title,
					url=item.url,
					is_assigned=item.is_assigned,
				)
				for item in dto.items
			],
			count=dto.count,
		)


class SyncUserObjectsMapper:
	@staticmethod
	def to_command(
		request: schemas.SyncUserObjectsRequest,
		user_id: UUID,
		actor_id: UUID,
	) -> SyncUserObjectsCommand:
		return SyncUserObjectsCommand(
			actor_id=actor_id,
			user_id=user_id,
			object_ids=request.object_ids,
		)

class GrantObjectAccessMapper:
	@staticmethod
	def to_command(user_id: UUID, object_id: UUID, actor_id: UUID) -> GrantObjectAccessCommand:
		return GrantObjectAccessCommand(actor_id=actor_id, user_id=user_id, object_id=object_id)

class RevokeObjectAccessMapper:
	@staticmethod
	def to_command(user_id: UUID, object_id: UUID, actor_id: UUID) -> RevokeObjectAccessCommand:
		return RevokeObjectAccessCommand(actor_id=actor_id, user_id=user_id, object_id=object_id)
