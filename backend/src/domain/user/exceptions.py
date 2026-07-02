from typing import Any

from src.core.errors import ConflictError, ForbiddenError, NotFoundError


class UserNotFoundError(NotFoundError):
	code = "user_not_found"

	def __init__(self, **context: Any):
		super().__init__("User", **context)

class UserAlreadyExistsError(ConflictError):
	code = "user_already_exists"

	def __init__(self, **context: Any):
		self.context = context
		super().__init__("User already exists")

class UserObjectNotFoundError(NotFoundError):
	code = "user_object_not_found"

	def __init__(self, **context: Any):
		super().__init__("User object", **context)

class ObjectAccessNotFoundError(NotFoundError):
	code = "object_access_not_found"

	def __init__(self, **context: Any):
		super().__init__("Object access", **context)

class SelfAccessForbiddenError(ForbiddenError):
	code = "self_access_forbidden"

	def __init__(self) -> None:
		super().__init__("Cannot modify object access for yourself")

class AdminAccessForbiddenError(ForbiddenError):
	code = "admin_access_forbidden"

	def __init__(self) -> None:
		super().__init__("Cannot modify object access for an admin user")
