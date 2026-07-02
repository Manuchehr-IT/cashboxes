from fastapi import Depends

from src.api.dependencies import get_hasher, get_uow
from src.application.user.use_cases import CreateUser, DeleteUser, GetUser, ListUsers, UpdateUser
from src.infrastructure.database import UnitOfWork
from src.infrastructure.security.hasher import Hasher


def provide_create_user(
	uow: UnitOfWork = Depends(get_uow),
	hasher: Hasher = Depends(get_hasher),
) -> CreateUser:
	return CreateUser(uow, hasher)

def provide_get_user(uow: UnitOfWork = Depends(get_uow)) -> GetUser:
	return GetUser(uow)

def provide_list_users(uow: UnitOfWork = Depends(get_uow)) -> ListUsers:
	return ListUsers(uow)

def provide_update_user(uow: UnitOfWork = Depends(get_uow)) -> UpdateUser:
	return UpdateUser(uow)

def provide_delete_user(uow: UnitOfWork = Depends(get_uow)) -> DeleteUser:
	return DeleteUser(uow)
