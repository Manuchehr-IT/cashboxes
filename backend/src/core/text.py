from typing import Annotated

from pydantic import BeforeValidator


def normalize_text(value: str | None) -> str | None:
	if value is None:
		return None
	return value.strip() or None

# Триммит строку и превращает пустую/пробельную строку в None на этапе валидации pydantic-модели.
SearchQuery = Annotated[str | None, BeforeValidator(normalize_text)]
