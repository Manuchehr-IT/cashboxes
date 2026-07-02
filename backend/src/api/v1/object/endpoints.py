from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.api.dependencies import require_admin_role
from src.application.object.use_cases import CreateObject, DeleteObject, GetObject, ListObjects, UpdateObject

from . import schemas
from .dependencies import (
	provide_create_object,
	provide_delete_object,
	provide_get_object,
	provide_list_objects,
	provide_update_object,
)
from .mappers import (
	CreateObjectMapper,
	DeleteObjectMapper,
	GetObjectMapper,
	ListObjectsMapper,
	ObjectMapper,
	UpdateObjectMapper,
)

# Чтение и управление объектами — только админам.
router = APIRouter(prefix="/objects", tags=["Objects"], dependencies=[Depends(require_admin_role)])


@router.post("", response_model=schemas.ObjectResponse, status_code=201)
async def create_object_endpoint(
	request: schemas.CreateObjectRequest,
	create_object: CreateObject = Depends(provide_create_object),
):
	command = CreateObjectMapper.to_command(request)
	result_dto = await create_object.execute(command)
	return ObjectMapper.to_response(result_dto)

@router.get("", response_model=schemas.ListObjectsResponse)
async def list_objects_endpoint(
	list_objects: ListObjects = Depends(provide_list_objects),
	limit: int = Query(default=100, ge=1, le=1000),
	offset: int = Query(default=0, ge=0),
	q: str | None = Query(default=None),
	sort: str | None = Query(default=None),
	is_active: bool | None = Query(default=None),
):
	query = ListObjectsMapper.to_query(
		limit=limit,
		offset=offset,
		q=q,
		sort=sort,
		is_active=is_active,
	)
	result_dto = await list_objects.execute(query)
	return ListObjectsMapper.to_response(result_dto)

@router.get("/{object_id}", response_model=schemas.ObjectResponse)
async def get_object_endpoint(
	object_id: UUID,
	get_object: GetObject = Depends(provide_get_object),
):
	query = GetObjectMapper.to_query(id=object_id)
	result_dto = await get_object.execute(query)
	return ObjectMapper.to_response(result_dto)

@router.patch("/{object_id}", response_model=schemas.ObjectResponse)
async def update_object_endpoint(
	object_id: UUID,
	request: schemas.UpdateObjectRequest,
	update_object: UpdateObject = Depends(provide_update_object),
):
	command = UpdateObjectMapper.to_command(request, id=object_id)
	result_dto = await update_object.execute(command)
	return ObjectMapper.to_response(result_dto)

@router.delete("/{object_id}", status_code=204)
async def delete_object_endpoint(
	object_id: UUID,
	delete_object: DeleteObject = Depends(provide_delete_object),
):
	command = DeleteObjectMapper.to_command(id=object_id)
	await delete_object.execute(command)
