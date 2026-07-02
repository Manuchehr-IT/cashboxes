from fastapi import Depends

from src.api.dependencies import get_uow
from src.application.object.use_cases import CreateObject, DeleteObject, GetObject, ListObjects, UpdateObject
from src.infrastructure.database import UnitOfWork


def provide_create_object(uow: UnitOfWork = Depends(get_uow)) -> CreateObject:
    return CreateObject(uow)


def provide_get_object(uow: UnitOfWork = Depends(get_uow)) -> GetObject:
    return GetObject(uow)


def provide_list_objects(uow: UnitOfWork = Depends(get_uow)) -> ListObjects:
    return ListObjects(uow)


def provide_update_object(uow: UnitOfWork = Depends(get_uow)) -> UpdateObject:
    return UpdateObject(uow)


def provide_delete_object(uow: UnitOfWork = Depends(get_uow)) -> DeleteObject:
    return DeleteObject(uow)
