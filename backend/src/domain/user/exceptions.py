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

class SelfDeletionForbiddenError(ForbiddenError):
	code = "self_deletion_forbidden"

	def __init__(self) -> None:
		super().__init__("Cannot delete yourself")

class AdminDeletionForbiddenError(ForbiddenError):
	code = "admin_deletion_forbidden"

	def __init__(self) -> None:
		super().__init__("Cannot delete an admin user")

class AdminPasswordChangeForbiddenError(ForbiddenError):
	code = "admin_password_change_forbidden"

	def __init__(self) -> None:
		super().__init__("Cannot change the password of another admin user")

class CashAccessForbiddenError(ForbiddenError):
	code = "cash_access_forbidden"

	def __init__(self) -> None:
		super().__init__("Cannot access this cashbox with the current cash access scope")

class CashboxesAccessForbiddenError(ForbiddenError):
	code = "cashboxes_access_forbidden"

	def __init__(self) -> None:
		super().__init__("User does not have access to the cashboxes report")

class CounterpartiesAccessForbiddenError(ForbiddenError):
	code = "counterparties_access_forbidden"

	def __init__(self) -> None:
		super().__init__("User does not have access to the counterparties report")
