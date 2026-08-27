from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.api.dependencies import get_current_user, require_admin_role
from src.api.v1.user import schemas
from src.api.v1.user.dependencies import (
	provide_create_user,
	provide_delete_user,
	provide_get_user,
	provide_list_users,
	provide_set_user_password,
	provide_update_user,
)
from src.api.v1.user.mappers import (
	CreateUserMapper,
	DeleteUserMapper,
	GetUserMapper,
	ListUsersMapper,
	SetUserPasswordMapper,
	UpdateUserMapper,
	UserMapper,
	UserWithPasswordMapper,
)
from src.application.user.use_cases import CreateUser, DeleteUser, GetUser, ListUsers, SetUserPassword, UpdateUser
from src.domain.user.entities import User

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(require_admin_role)])


@router.post("", response_model=schemas.UserWithPasswordResponse, status_code=201)
async def create_user_endpoint(
	request: schemas.CreateUserRequest,
	create_user: CreateUser = Depends(provide_create_user),
):
	command = CreateUserMapper.to_command(request)
	result_dto = await create_user.execute(command)
	return UserWithPasswordMapper.to_response(result_dto)

@router.get("", response_model=schemas.ListUsersResponse)
async def list_users_endpoint(
	list_users: ListUsers = Depends(provide_list_users),
	limit: int = Query(default=100, ge=1, le=1000),
	offset: int = Query(default=0, ge=0),
	q: str | None = Query(default=None),
	sort: str | None = Query(default=None),
):
	query = ListUsersMapper.to_query(limit=limit, offset=offset, q=q, sort=sort)
	result_dto = await list_users.execute(query)
	return ListUsersMapper.to_response(result_dto)

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user_endpoint(
	user_id: UUID,
	get_user: GetUser = Depends(provide_get_user),
):
	query = GetUserMapper.to_query(id=user_id)
	result_dto = await get_user.execute(query)
	return UserMapper.to_response(result_dto)

@router.patch("/{user_id}", response_model=schemas.UserResponse)
async def update_user_endpoint(
	user_id: UUID,
	request: schemas.UpdateUserRequest,
	update_user: UpdateUser = Depends(provide_update_user),
):
	command = UpdateUserMapper.to_command(request, id=user_id)
	result_dto = await update_user.execute(command)
	return UserMapper.to_response(result_dto)

@router.delete("/{user_id}", status_code=204)
async def delete_user_endpoint(
	user_id: UUID,
	delete_user: DeleteUser = Depends(provide_delete_user),
	current_user: User = Depends(get_current_user),
):
	command = DeleteUserMapper.to_command(user_id=user_id, actor_id=current_user.id)
	await delete_user.execute(command)

@router.patch("/{user_id}/password", status_code=204)
async def set_user_password_endpoint(
	user_id: UUID,
	request: schemas.SetUserPasswordRequest,
	set_user_password: SetUserPassword = Depends(provide_set_user_password),
	current_user: User = Depends(get_current_user),
):
	command = SetUserPasswordMapper.to_command(request, user_id=user_id, actor_id=current_user.id)
	await set_user_password.execute(command)
