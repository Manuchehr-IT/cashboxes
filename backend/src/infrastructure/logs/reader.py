from pathlib import Path


class LogReader:
	def __init__(self, path: str):
		self.path = Path(path)

	def read(self, limit: int, level: str | None, q: str | None) -> tuple[list[str], int]:
		"""Читает текущий лог-файл (без ротированных .1/.2/...), с фильтрами и хвостом
		в N строк. Файл максимум ~10 МБ (see core/logger.py) — читаем целиком, отдельная
		потоковая читалка избыточна для этого объёма."""
		if not self.path.exists():
			return [], 0

		lines = self.path.read_text(encoding="utf-8", errors="replace").splitlines()

		if level:
			needle = f" - {level.upper()} - "
			lines = [line for line in lines if needle in line]
		if q:
			needle_q = q.lower()
			lines = [line for line in lines if needle_q in line.lower()]

		total = len(lines)
		return lines[-limit:], total
