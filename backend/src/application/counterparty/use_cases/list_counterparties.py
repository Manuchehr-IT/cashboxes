import asyncio

from src.application.counterparty.dtos import DebtDTO, FailedObjectDTO, ListCounterpartiesDTO, ObjectDebtsDTO
from src.application.counterparty.queries import ListCounterpartiesQuery
from src.domain.object.entities import Object
from src.domain.user.exceptions import CounterpartiesAccessForbiddenError
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCClient, OneCDebt


class ListCounterparties:
	def __init__(self, uow: UnitOfWork, onec_client: OneCClient):
		self.uow = uow
		self.onec_client = onec_client

	async def execute(self, query: ListCounterpartiesQuery) -> ListCounterpartiesDTO:
		async with self.uow:
			user = await self.uow.user.get(query.user_id)
			if not user.effective_can_view_counterparties:
				raise CounterpartiesAccessForbiddenError()

			if user.is_admin:
				objects = await self.uow.obj.list_active()
			else:
				object_ids = await self.uow.user_object.get_object_ids_by_user(query.user_id)
				objects = await self.uow.obj.list_active_by_ids(object_ids)

		# Внешние запросы к 1C выполняются после закрытия UoW, чтобы не держать
		# соединение с БД открытым на время (потенциально медленных) HTTP-вызовов.
		results = await asyncio.gather(
			*(self.onec_client.fetch_debts(obj.url) for obj in objects),
			return_exceptions=True,
		)

		return self._build_dto(objects, results)

	def _build_dto(
		self,
		objects: list[Object],
		results: list[list[OneCDebt] | BaseException],
	) -> ListCounterpartiesDTO:
		items: list[ObjectDebtsDTO] = []
		failed_objects: list[FailedObjectDTO] = []

		for obj, result in zip(objects, results, strict=True):
			if isinstance(result, BaseException):
				failed_objects.append(FailedObjectDTO(object_id=obj.id, object_title=obj.title))
				continue

			items.append(
				ObjectDebtsDTO(
					object_id=obj.id,
					object_title=obj.title,
					debts=[
						DebtDTO(
							acc_code=d.acc_code,
							acc_name=d.acc_name,
							kontr=d.kontr,
							manager=d.manager,
							contract=d.contract,
							debt=d.debt,
							currency=d.currency,
							vid_raschet=d.vid_raschet,
						)
						for d in result
					],
				)
			)

		return ListCounterpartiesDTO(items=items, failed_objects=failed_objects)
