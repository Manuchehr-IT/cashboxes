from fastapi import Depends

from src.api.dependencies import get_uow
from src.application.user.use_cases import GrantObjectAccess, ListUserObjects, RevokeObjectAccess, SyncUserObjects
from src.infrastructure.database import UnitOfWork


def provide_list_user_objects(uow: UnitOfWork = Depends(get_uow)) -> ListUserObjects:
	return ListUserObjects(uow)

def provide_sync_user_objects(uow: UnitOfWork = Depends(get_uow)) -> SyncUserObjects:
	return SyncUserObjects(uow)

def provide_grant_object_access(uow: UnitOfWork = Depends(get_uow)) -> GrantObjectAccess:
	return GrantObjectAccess(uow)

def provide_revoke_object_access(uow: UnitOfWork = Depends(get_uow)) -> RevokeObjectAccess:
	return RevokeObjectAccess(uow)
