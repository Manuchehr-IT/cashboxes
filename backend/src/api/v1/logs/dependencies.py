from src.application.logs.use_cases import GetLogs
from src.core.logger import LOG_FILE_PATH
from src.infrastructure.logs.reader import LogReader


def provide_get_logs() -> GetLogs:
	return GetLogs(LogReader(LOG_FILE_PATH))
