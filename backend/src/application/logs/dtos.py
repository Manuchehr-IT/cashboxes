from pydantic import BaseModel


class LogsDTO(BaseModel):
	lines: list[str]
	total: int
