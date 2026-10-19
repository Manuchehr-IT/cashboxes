from fastapi import APIRouter, Depends

from src.api.dependencies import require_admin_role
from src.application.settings.use_cases import GetOneCSettings, UpdateOneCSettings

from . import schemas
from .dependencies import provide_get_onec_settings, provide_update_onec_settings
from .mappers import GetOneCSettingsMapper, OneCSettingsMapper, UpdateOneCSettingsMapper

# Настройки интеграции с 1C (логин/пароль) — только админам.
router = APIRouter(prefix="/settings", tags=["Settings"], dependencies=[Depends(require_admin_role)])


@router.get("/onec", response_model=schemas.OneCSettingsResponse)
async def get_onec_settings_endpoint(
	get_onec_settings: GetOneCSettings = Depends(provide_get_onec_settings),
):
	query = GetOneCSettingsMapper.to_query()
	result_dto = await get_onec_settings.execute(query)
	return OneCSettingsMapper.to_response(result_dto)

@router.patch("/onec", response_model=schemas.OneCSettingsResponse)
async def update_onec_settings_endpoint(
	request: schemas.UpdateOneCSettingsRequest,
	update_onec_settings: UpdateOneCSettings = Depends(provide_update_onec_settings),
):
	command = UpdateOneCSettingsMapper.to_command(request)
	result_dto = await update_onec_settings.execute(command)
	return OneCSettingsMapper.to_response(result_dto)
