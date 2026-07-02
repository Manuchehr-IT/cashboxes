from typing import Any

from src.core.errors import ConflictError, NotFoundError


class ObjectNotFoundError(NotFoundError):
	code = "object_not_found"

	def __init__(self, **context: Any):
		super().__init__("Object", **context)

class ObjectAlreadyExistsError(ConflictError):
	code = "object_already_exists"

	def __init__(self, **context: Any):
		self.context = context
		super().__init__("Object already exists")
