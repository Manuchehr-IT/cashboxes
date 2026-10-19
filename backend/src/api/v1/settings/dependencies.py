from fastapi import Depends

from src.api.dependencies import get_uow
from src.application.settings.use_cases import GetOneCSettings, UpdateOneCSettings
from src.infrastructure.database import UnitOfWork


def provide_get_onec_settings(uow: UnitOfWork = Depends(get_uow)) -> GetOneCSettings:
	return GetOneCSettings(uow)


def provide_update_onec_settings(uow: UnitOfWork = Depends(get_uow)) -> UpdateOneCSettings:
	return UpdateOneCSettings(uow)
