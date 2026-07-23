from src.application.logs.dtos import LogsDTO
from src.application.logs.enums import LogLevel
from src.application.logs.queries import GetLogsQuery

from . import schemas


class GetLogsMapper:
	@staticmethod
	def to_query(limit: int, level: LogLevel | None, q: str | None) -> GetLogsQuery:
		return GetLogsQuery(limit=limit, level=level, q=q)

	@staticmethod
	def to_response(dto: LogsDTO) -> schemas.LogsResponse:
		return schemas.LogsResponse(lines=dto.lines, total=dto.total)
