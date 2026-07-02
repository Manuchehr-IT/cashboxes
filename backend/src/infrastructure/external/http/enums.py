from enum import StrEnum

class HTTPMethod(StrEnum):
	GET = "get"
	POST = "post"
	PUT = "put"
	PATCH = "patch"
	DELETE = "delete"
