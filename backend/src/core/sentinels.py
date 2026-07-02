from enum import Enum


class UnsetType(Enum):
	"""Sentinel for "field not provided" in partial (PATCH) updates — distinct from an explicit None.

	Use as a default so the domain can tell "keep current value" (UNSET) apart from
	"set to null" (None). Compare by identity: `value is not UNSET`.
	"""
	UNSET = "UNSET"

UNSET = UnsetType.UNSET
