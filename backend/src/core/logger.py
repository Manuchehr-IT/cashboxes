import logging
import logging.config
from typing import Any


class _HealthCheckFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return "/health" not in record.getMessage()

LOGGING_CONFIG: dict[str, Any] = {
	"version": 1,
	"disable_existing_loggers": False,
	"formatters": {
		"standard": {
			"format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
			"datefmt": "%Y-%m-%d %H:%M:%S",
		},
		"detailed": {
			"format": "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
			"datefmt": "%Y-%m-%d %H:%M:%S",
		},
	},
	"handlers": {
		"console": {
			"class": "logging.StreamHandler",
			"level": "INFO",
			"formatter": "standard",
			"stream": "ext://sys.stdout",
		},
		"file": {
			"class": "logging.handlers.RotatingFileHandler",
			"level": "DEBUG",
			"formatter": "detailed",
			"filename": "logs/app.log",
			"maxBytes": 10 * 1024 * 1024,  # 10 MB
			"backupCount": 5,
			"encoding": "utf8",
		},
	},
	"root": {
		"handlers": ["console", "file"],
		"level": "DEBUG",
	},
}

def setup_logging():
	logging.config.dictConfig(LOGGING_CONFIG)
	access_logger = logging.getLogger("uvicorn.access")
	# Идемпотентно — setup_logging может вызываться повторно (reload/factory)
	if not any(isinstance(f, _HealthCheckFilter) for f in access_logger.filters):
		access_logger.addFilter(_HealthCheckFilter())
