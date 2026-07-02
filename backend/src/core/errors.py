from typing import Any


class BaseError(Exception):
	code = "base_error"

	def __init__(self, message: str | None = None, **context: Any):
		self.message = message
		self.context = context
		super().__init__(message)

class DomainError(BaseError):
	code = "domain_error"

class AuthenticationFailedError(DomainError):
	code = "auth_failed"

	def __init__(self, reason: str):
		self.reason = reason
		super().__init__("Authentication failed")

class BadRequestError(DomainError):
	code = "bad_request"

class NotFoundError(DomainError):
	code = "not_found"

	def __init__(self, entity: str, **context: Any):
		self.entity = entity
		super().__init__(f"{entity} not found", entity=entity, **context)

class ConflictError(DomainError):
	code = "conflict"

class ForbiddenError(DomainError):
	code = "forbidden"


class InfrastructureError(BaseError):
	code = "infrastructure_error"

class ExternalServiceError(InfrastructureError):
	code = "external_service_error"

	def __init__(self, service: str, message: str, **context: Any):
		self.service = service
		super().__init__(f"[{service}] {message}", **context)

class ExternalServiceNotFoundError(ExternalServiceError):
	code = "external_service_not_found"

	def __init__(self, service: str, resource: str, **context: Any):
		self.resource = resource
		super().__init__(service, f"{resource} not found", resource=resource, **context)

class ExternalServiceConflictError(ExternalServiceError):
	code = "external_service_conflict"

	def __init__(self, service: str, resource: str, **context: Any):
		self.resource = resource
		super().__init__(service, f"{resource} conflict", resource=resource, **context)

class ExternalServiceRequestError(ExternalServiceError):
	code = "external_service_request_error"

	def __init__(self, service: str, url: str, status_code: int, **context: Any):
		self.status_code = status_code
		super().__init__(service, f"Request failed [{status_code}]: {url}", url=url, status_code=status_code, **context)
