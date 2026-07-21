from uuid import UUID

from src.application.user.commands import (
	CreateUserCommand,
	DeleteUserCommand,
	SetUserPasswordCommand,
	UpdateUserCommand,
)
from src.application.user.dtos import ListUsersDTO, UserDTO, UserWithPasswordDTO
from src.application.user.queries import GetUserQuery, ListUsersQuery
from src.core.sorting import parse_sort

from . import schemas


class UserMapper:
	@staticmethod
	def to_response(dto: UserDTO) -> schemas.UserResponse:
		return schemas.UserResponse(
			id=dto.id,
			username=dto.username,
			is_active=dto.is_active,
			is_admin=dto.is_admin,
			created_at=dto.created_at,
			updated_at=dto.updated_at,
		)

class UserWithPasswordMapper:
	@staticmethod
	def to_response(dto: UserWithPasswordDTO) -> schemas.UserWithPasswordResponse:
		return schemas.UserWithPasswordResponse(
			user=UserMapper.to_response(dto.user),
			password=dto.password,
		)

class CreateUserMapper:
	@staticmethod
	def to_command(request: schemas.CreateUserRequest) -> CreateUserCommand:
		return CreateUserCommand(
			username=request.username,
			is_active=request.is_active,
		)

class GetUserMapper:
	@staticmethod
	def to_query(id: UUID) -> GetUserQuery:
		return GetUserQuery(id=id)

class ListUsersMapper:
	@staticmethod
	def to_query(limit: int, offset: int, q: str | None, sort: str | None, is_active: bool | None) -> ListUsersQuery:
		return ListUsersQuery(
			limit=limit,
			offset=offset,
			q=q,
			sort=parse_sort(sort),
			is_active=is_active,
		)

	@staticmethod
	def to_response(dto: ListUsersDTO) -> schemas.ListUsersResponse:
		return schemas.ListUsersResponse(
			items=[UserMapper.to_response(item) for item in dto.items],
			count=dto.count,
		)

class UpdateUserMapper:
	@staticmethod
	def to_command(request: schemas.UpdateUserRequest, id: UUID) -> UpdateUserCommand:
		data = {name: getattr(request, name) for name in request.model_fields_set}
		return UpdateUserCommand(id=id, **data)

class DeleteUserMapper:
	@staticmethod
	def to_command(user_id: UUID, actor_id: UUID) -> DeleteUserCommand:
		return DeleteUserCommand(user_id=user_id, actor_id=actor_id)

class SetUserPasswordMapper:
	@staticmethod
	def to_command(request: schemas.SetUserPasswordRequest, user_id: UUID, actor_id: UUID) -> SetUserPasswordCommand:
		return SetUserPasswordCommand(user_id=user_id, actor_id=actor_id, password=request.password)
