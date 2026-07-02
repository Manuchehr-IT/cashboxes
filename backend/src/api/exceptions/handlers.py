import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from src.core.errors import BaseError

logger = logging.getLogger(__name__)

ERROR_STATUS_MAP = {
	"bad_request": 400,
	"auth_failed": 401,
	"forbidden": 403,
	"not_found": 404,
	"conflict": 409,
}

def get_http_status(error: BaseError) -> int:
	"""Get HTTP status for exception"""
	for cls in type(error).__mro__:
		code = getattr(cls, "code", None)
		if code is None:
			continue
		if status := ERROR_STATUS_MAP.get(code):
			return status

	return 500

def setup_exception_handlers(app: FastAPI):
	"""Регистрация обработчиков исключений"""

	@app.exception_handler(BaseError)
	async def handle_base_error(request: Request, exc: BaseError):  # pyright: ignore[reportUnusedFunction]
		"""Обработка всех бизнес-исключений"""
		status_code = get_http_status(exc)

		if status_code < 500:
			logger.info(f"Client error: {exc}")
		else:
			logger.error("Server error", exc_info=True)

		trace_id = getattr(request.state, "trace_id", None)

		return JSONResponse(
			status_code=status_code,
			content={
				"code": exc.code,
				"message": exc.message,
				"context": getattr(exc, "context", None),
				"trace_id": trace_id,
				"path": request.url.path,
			}
		)

	@app.exception_handler(HTTPException)
	async def handle_http_exception(request: Request, exc: HTTPException):  # pyright: ignore[reportUnusedFunction]
		logger.info(f"HTTP {exc.status_code}: {exc.detail}")

		trace_id = getattr(request.state, "trace_id", None)

		return JSONResponse(
			status_code=exc.status_code,
			content={
				"code": f"http_{exc.status_code}",
				"message": str(exc.detail),
				"trace_id": trace_id,
				"path": request.url.path,
			},
			headers=exc.headers
		)

	@app.exception_handler(Exception)
	async def handle_unexpected_error(request: Request, exc: Exception):  # pyright: ignore[reportUnusedFunction]
		logger.error(f"Unexpected error: {exc}", exc_info=True)

		trace_id = getattr(request.state, "trace_id", None)

		return JSONResponse(
			status_code=500,
			content={
				"code": "internal_error",
				"message": "Internal server error",
				"trace_id": trace_id,
				"path": request.url.path,
			}
		)