from fastapi import APIRouter, Depends, Query

from src.api.dependencies import require_admin_role
from src.application.logs.enums import LogLevel
from src.application.logs.use_cases import GetLogs

from . import schemas
from .dependencies import provide_get_logs
from .mappers import GetLogsMapper

router = APIRouter(prefix="/logs", tags=["Logs"], dependencies=[Depends(require_admin_role)])


@router.get("", response_model=schemas.LogsResponse)
async def get_logs_endpoint(
	get_logs: GetLogs = Depends(provide_get_logs),
	limit: int = Query(default=200, ge=1, le=5000),
	level: LogLevel | None = Query(default=None),
	q: str | None = Query(default=None),
):
	query = GetLogsMapper.to_query(limit=limit, level=level, q=q)
	result_dto = await get_logs.execute(query)
	return GetLogsMapper.to_response(result_dto)
