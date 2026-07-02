from pydantic import BaseModel


class SortField(BaseModel):
	field: str
	desc: bool

def parse_sort(sort: str | list[SortField] | None) -> list[SortField]:
	if sort is None:
		return []
	if isinstance(sort, list):
		return sort
	result: list[SortField] = []
	for raw in sort.split(","):
		raw = raw.strip()
		if not raw:
			continue
		is_desc = raw.startswith("-")
		result.append(SortField(field=raw.lstrip("-"), desc=is_desc))
	return result
