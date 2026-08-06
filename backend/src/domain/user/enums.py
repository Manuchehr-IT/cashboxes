from enum import StrEnum

class IdentityProvider(StrEnum):
	TELEGRAM = "telegram"
	MAX = "max"

class CashAccessScope(StrEnum):
	"""
	Какие кассы видит пользователь в отчётах: только основные, только неосновные, или все.
	Не применяется к админам — они всегда видят все кассы, как и с доступом к объектам.
	"""
	MAIN = "main"
	NON_MAIN = "non_main"
	ALL = "all"
