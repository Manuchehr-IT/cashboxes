from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.api.dependencies import get_current_user, require_admin_role
from src.api.v1.user.user_object.dependencies import (
	provide_grant_object_access,
	provide_list_user_objects,
	provide_revoke_object_access,
	provide_sync_user_objects,
)
from src.api.v1.user.user_object.mappers import (
	GrantObjectAccessMapper,
	ListUserObjectsMapper,
	RevokeObjectAccessMapper,
	SyncUserObjectsMapper,
)
from src.api.v1.user.user_object.schemas import ListUserObjectsResponse, SyncUserObjectsRequest
from src.application.user.use_cases import GrantObjectAccess, ListUserObjects, RevokeObjectAccess, SyncUserObjects
from src.domain.user.entities import User

router = APIRouter(
	prefix="/users/{user_id}/objects",
	tags=["User objects"],
	dependencies=[Depends(require_admin_role)],
)


@router.get("", response_model=ListUserObjectsResponse)
async def list_user_objects_endpoint(
	user_id: UUID,
	list_user_objects: ListUserObjects = Depends(provide_list_user_objects),
	limit: int = Query(default=100, ge=1, le=1000),
	offset: int = Query(default=0, ge=0),
	sort: str | None = Query(default=None),
	is_assigned: bool | None = Query(default=None),
):
	query = ListUserObjectsMapper.to_query(
		user_id=user_id,
		limit=limit,
		offset=offset,
		sort=sort,
		is_assigned=is_assigned,
	)
	result_dto = await list_user_objects.execute(query)
	return ListUserObjectsMapper.to_response(result_dto)


@router.put("", status_code=204)
async def sync_user_objects_endpoint(
	user_id: UUID,
	request: SyncUserObjectsRequest,
	sync_user_objects: SyncUserObjects = Depends(provide_sync_user_objects),
	current_user: User = Depends(get_current_user),
):
	command = SyncUserObjectsMapper.to_command(request, user_id=user_id, actor_id=current_user.id)
	await sync_user_objects.execute(command)


@router.post("/{object_id}", status_code=204)
async def grant_object_access_endpoint(
	user_id: UUID,
	object_id: UUID,
	grant_object_access: GrantObjectAccess = Depends(provide_grant_object_access),
	current_user: User = Depends(get_current_user),
):
	command = GrantObjectAccessMapper.to_command(user_id=user_id, object_id=object_id, actor_id=current_user.id)
	await grant_object_access.execute(command)


@router.delete("/{object_id}", status_code=204)
async def revoke_object_access_endpoint(
	user_id: UUID,
	object_id: UUID,
	revoke_object_access: RevokeObjectAccess = Depends(provide_revoke_object_access),
	current_user: User = Depends(get_current_user),
):
	command = RevokeObjectAccessMapper.to_command(user_id=user_id, object_id=object_id, actor_id=current_user.id)
	await revoke_object_access.execute(command)
