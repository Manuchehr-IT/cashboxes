from typing import Any, TypeVar

from sqlalchemy import Select, asc, desc
from sqlalchemy.orm import InstrumentedAttribute
from sqlalchemy.sql.elements import ColumnElement

from src.core.sorting import SortField

LIKE_ESCAPE = "\\"

def like_contains(value: str) -> str:
	"""
	Экранирует спецсимволы LIKE (`\\`, `%`, `_`) и оборачивает значение в `%...%`
	для поиска подстроки. Использовать вместе с `.ilike(pattern, escape=LIKE_ESCAPE)`,
	иначе введённые пользователем `%`/`_` сработают как wildcard.
	"""
	escaped = value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
	return f"%{escaped}%"


SelectT = TypeVar("SelectT", bound=Select[Any])
SortColumns = dict[str, InstrumentedAttribute[Any] | ColumnElement[Any]]

def apply_sort(stmt: SelectT, sort_columns: SortColumns, sort: list[SortField], default: ColumnElement[Any]) -> SelectT:  # noqa: UP047 -- SelectT is shared across repositories (object.py, user.py); PEP 695 `[T]` syntax can't be exported/reused across modules
	order_by: list[ColumnElement[Any]] = []
	for s in sort:
		col = sort_columns.get(s.field)
		if col is not None:
			order_by.append(desc(col) if s.desc else asc(col))
	return stmt.order_by(*order_by) if order_by else stmt.order_by(default)
