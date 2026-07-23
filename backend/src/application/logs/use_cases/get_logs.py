from src.application.logs.dtos import LogsDTO
from src.application.logs.queries import GetLogsQuery
from src.infrastructure.logs.reader import LogReader


class GetLogs:
	def __init__(self, reader: LogReader):
		self.reader = reader

	async def execute(self, query: GetLogsQuery) -> LogsDTO:
		lines, total = self.reader.read(query.limit, query.level, query.q)
		return LogsDTO(lines=lines, total=total)
