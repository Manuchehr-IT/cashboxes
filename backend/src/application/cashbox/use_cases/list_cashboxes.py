import asyncio

from src.application.cashbox.dtos import CashboxDTO, FailedObjectDTO, ListCashboxesDTO, ObjectCashboxesDTO
from src.application.cashbox.queries import ListCashboxesQuery
from src.domain.object.entities import Object
from src.domain.user.enums import CashAccessScope
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCCashbox, OneCClient


class ListCashboxes:
	def __init__(self, uow: UnitOfWork, onec_client: OneCClient):
		self.uow = uow
		self.onec_client = onec_client

	async def execute(self, query: ListCashboxesQuery) -> ListCashboxesDTO:
		async with self.uow:
			user = await self.uow.user.get(query.user_id)
			if user.is_admin:
				objects = await self.uow.obj.list_active()
			else:
				object_ids = await self.uow.user_object.get_object_ids_by_user(query.user_id)
				objects = await self.uow.obj.list_active_by_ids(object_ids)

		# Внешние запросы к 1C выполняются после закрытия UoW, чтобы не держать
		# соединение с БД открытым на время (потенциально медленных) HTTP-вызовов.
		results = await asyncio.gather(
			*(self.onec_client.fetch_cashboxes(obj.url, query.date_from, query.date_to) for obj in objects),
			return_exceptions=True,
		)

		return self._build_dto(objects, results, user.effective_cash_access_scope)

	def _build_dto(
		self,
		objects: list[Object],
		results: list[list[OneCCashbox] | BaseException],
		scope: CashAccessScope,
	) -> ListCashboxesDTO:
		items: list[ObjectCashboxesDTO] = []
		failed_objects: list[FailedObjectDTO] = []

		for obj, result in zip(objects, results, strict=True):
			if isinstance(result, BaseException):
				failed_objects.append(FailedObjectDTO(object_id=obj.id, object_title=obj.title))
				continue

			items.append(
				ObjectCashboxesDTO(
					object_id=obj.id,
					object_title=obj.title,
					cashboxes=[
						CashboxDTO(
							id=c.id, name=c.name, currency=c.currency, main=c.main, type=c.type,
							ost1=c.ost1, sump=c.sump, sumr=c.sumr, ost2=c.ost2,
						)
						for c in result
						if self._is_visible(c, scope)
					],
				)
			)

		return ListCashboxesDTO(items=items, failed_objects=failed_objects)

	@staticmethod
	def _is_visible(cashbox: OneCCashbox, scope: CashAccessScope) -> bool:
		if scope == CashAccessScope.MAIN:
			return cashbox.main
		if scope == CashAccessScope.NON_MAIN:
			return not cashbox.main
		return True
