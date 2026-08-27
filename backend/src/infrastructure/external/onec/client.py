import logging
from datetime import date
from typing import Any, TypeVar
from urllib.parse import urlsplit, urlunsplit

import httpx
from pydantic import ValidationError

from src.core.errors import ExternalServiceRequestError
from src.infrastructure.external.http import HTTPClient, HTTPMethod

from .schemas import (
	OneCCashbox,
	OneCCashDetail,
	OneCCashDetailsResponse,
	OneCDebt,
	OneCDebtsResponse,
	OneCResponse,
	OneCStatusResponse,
)

logger = logging.getLogger(__name__)

ResponseT = TypeVar("ResponseT", bound=OneCStatusResponse)


class OneCClient:
	def __init__(self, http_client: HTTPClient, username: str, password: str):
		self.http_client = http_client
		self.auth = (username, password)

	async def fetch_cashboxes(self, url: str, date_from: date | None, date_to: date | None) -> list[OneCCashbox]:
		cashboxes_url = self._child_url(url, "cashoborot")
		params = self._date_params(date_from, date_to)
		parsed = await self._fetch(cashboxes_url, params, OneCResponse)
		return parsed.data

	async def fetch_cash_details(
		self,
		url: str,
		cash_id: str,
		date_from: date | None,
		date_to: date | None,
	) -> list[OneCCashDetail]:
		details_url = self._child_url(url, "cashdetails")
		params = self._date_params(date_from, date_to)
		params["cashid"] = cash_id
		parsed = await self._fetch(details_url, params, OneCCashDetailsResponse)
		return parsed.data

	async def fetch_debts(self, url: str) -> list[OneCDebt]:
		debts_url = self._child_url(url, "debts")
		parsed = await self._fetch(debts_url, {}, OneCDebtsResponse)
		return parsed.data

	async def _fetch(self, url: str, params: dict[str, Any], response_model: type[ResponseT]) -> ResponseT:
		"""Единая точка похода в 1C: любой сбой (сеть, HTTP-статус, невалидный JSON/форма ответа,
		status != success) превращается в ExternalServiceRequestError, а не утекает наверх как
		сырое httpx/pydantic исключение без понятного сообщения."""
		try:
			response = await self.http_client.request(HTTPMethod.GET, url, params=params, auth=self.auth)
		except httpx.HTTPError as e:
			status_code = getattr(getattr(e, "response", None), "status_code", 0)
			logger.error("1C request failed: %s params=%s: %s", url, params, e)
			raise ExternalServiceRequestError(service="1C", url=url, status_code=status_code) from e

		logger.debug("1C response: %s params=%s -> [%s] %s", url, params, response.status_code, response.text)

		try:
			parsed = response_model.model_validate(response.json())
		except (ValueError, ValidationError) as e:
			logger.error(
				"1C response is not valid JSON/schema: %s -> [%s] %s (%s)",
				url, response.status_code, response.text, e,
			)
			raise ExternalServiceRequestError(service="1C", url=url, status_code=response.status_code) from e

		if parsed.status != "success":
			logger.error(
				"1C reported non-success status: %s -> [%s] %s",
				url, response.status_code, response.text,
			)
			raise ExternalServiceRequestError(service="1C", url=url, status_code=response.status_code)

		return parsed

	@staticmethod
	def _child_url(url: str, name: str) -> str:
		"""Добавляет `name` последним сегментом пути: .../hs/api/ -> .../hs/api/{name}.
		Object.url хранит базовый префикс 1C-инстанса, а не готовый эндпоинт — cashoborot
		(список касс) и cashdetails (детализация) навешиваются на него по требованию."""
		parts = urlsplit(url)
		path = parts.path.rstrip("/")
		return urlunsplit((parts.scheme, parts.netloc, f"{path}/{name}", "", ""))

	@staticmethod
	def _date_params(date_from: date | None, date_to: date | None) -> dict[str, Any]:
		params: dict[str, Any] = {}
		if date_from is not None:
			params["date_from"] = date_from.isoformat()
		if date_to is not None:
			params["date_to"] = date_to.isoformat()
		return params
