from pydantic import BaseModel

from src.application.logs.enums import LogLevel


class GetLogsQuery(BaseModel):
	limit: int
	level: LogLevel | None
	q: str | None
