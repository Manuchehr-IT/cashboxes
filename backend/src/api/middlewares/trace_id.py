from collections.abc import Awaitable, Callable
from uuid import uuid4

from fastapi import Request, Response


async def trace_id_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
	request.state.trace_id = str(uuid4())
	response = await call_next(request)
	response.headers["X-Trace-Id"] = request.state.trace_id
	return response
