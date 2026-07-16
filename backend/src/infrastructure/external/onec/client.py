from datetime import date
from typing import Any, TypeVar
from urllib.parse import urlsplit, urlunsplit

import httpx
from pydantic import ValidationError

from src.core.errors import ExternalServiceRequestError
from src.infrastructure.external.http import HTTPClient, HTTPMethod

from .schemas import OneCCashbox, OneCCashDetail, OneCCashDetailsResponse, OneCResponse, OneCStatusResponse

ResponseT = TypeVar("ResponseT", bound=OneCStatusResponse)


class OneCClient:
	def __init__(self, http_client: HTTPClient, username: str, password: str):
		self.http_client = http_client
		self.auth = (username, password)

	async def fetch_cashboxes(self, url: str, date_from: date | None, date_to: date | None) -> list[OneCCashbox]:
		params = self._date_params(date_from, date_to)
		parsed = await self._fetch(url, params, OneCResponse)
		return parsed.data

	async def fetch_cash_details(
		self,
		url: str,
		cash_id: str,
		date_from: date | None,
		date_to: date | None,
	) -> list[OneCCashDetail]:
		details_url = self._sibling_url(url, "cashdetails")
		params = self._date_params(date_from, date_to)
		params["cashid"] = cash_id
		parsed = await self._fetch(details_url, params, OneCCashDetailsResponse)
		return parsed.data

	async def _fetch(self, url: str, params: dict[str, Any], response_model: type[ResponseT]) -> ResponseT:
		"""Единая точка похода в 1C: любой сбой (сеть, HTTP-статус, невалидный JSON/форма ответа,
		status != success) превращается в ExternalServiceRequestError, а не утекает наверх как
		сырое httpx/pydantic исключение без понятного сообщения."""
		try:
			response = await self.http_client.request(HTTPMethod.GET, url, params=params, auth=self.auth)
		except httpx.HTTPError as e:
			status_code = getattr(getattr(e, "response", None), "status_code", 0)
			raise ExternalServiceRequestError(service="1C", url=url, status_code=status_code) from e

		try:
			parsed = response_model.model_validate(response.json())
		except (ValueError, ValidationError) as e:
			raise ExternalServiceRequestError(service="1C", url=url, status_code=response.status_code) from e

		if parsed.status != "success":
			raise ExternalServiceRequestError(service="1C", url=url, status_code=response.status_code)

		return parsed

	@staticmethod
	def _sibling_url(url: str, name: str) -> str:
		"""Заменяет последний сегмент пути на `name`: .../hs/api/cashoborot -> .../hs/api/{name}.
		В Object.url хранится конкретный эндпоинт списка касс (имя последнего сегмента у каждого
		1C-инстанса может отличаться) — cashdetails лежит рядом с ним, а не внутри."""
		parts = urlsplit(url)
		path = parts.path.rstrip("/")
		parent_path = path.rsplit("/", 1)[0] if "/" in path else ""
		return urlunsplit((parts.scheme, parts.netloc, f"{parent_path}/{name}", "", ""))

	@staticmethod
	def _date_params(date_from: date | None, date_to: date | None) -> dict[str, Any]:
		params: dict[str, Any] = {}
		if date_from is not None:
			params["date_from"] = date_from.isoformat()
		if date_to is not None:
			params["date_to"] = date_to.isoformat()
		return params
