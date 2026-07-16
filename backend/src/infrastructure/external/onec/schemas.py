import re

from pydantic import BaseModel, ConfigDict

SUBKONTO_PATTERN = re.compile(r"^subkonto(\d+)$")

class OneCStatusResponse(BaseModel):
	status: str

class OneCCashbox(BaseModel):
	id: str
	name: str
	currency: str
	ost1: float
	sump: float
	sumr: float
	ost2: float


class OneCResponse(OneCStatusResponse):
	data: list[OneCCashbox] = []


class OneCCashDetail(BaseModel):
	"""1C отдаёт переменное число полей `subkonto1`, `subkonto2`, ... (может не быть ни одного) —
	они не объявлены явными полями, а собираются из "лишних" ключей через extra=allow."""
	model_config = ConfigDict(extra="allow")

	ddsname: str
	sump: float
	sumr: float
	doc: str
	comment: str = ""

	@property
	def subkonto(self) -> list[str]:
		numbered: list[tuple[int, str]] = []
		for key, value in (self.model_extra or {}).items():
			if (match := SUBKONTO_PATTERN.match(key)) and value:
				numbered.append((int(match.group(1)), str(value)))
		numbered.sort(key=lambda pair: pair[0])
		return [value for _, value in numbered]


class OneCCashDetailsResponse(OneCStatusResponse):
	data: list[OneCCashDetail] = []
