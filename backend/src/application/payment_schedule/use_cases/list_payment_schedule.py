import asyncio

from src.application.payment_schedule.dtos import (
	FailedObjectDTO,
	ListPaymentScheduleDTO,
	ObjectPaymentScheduleDTO,
	PaymentEntryDTO,
	PaymentScheduleEntryDTO,
)
from src.application.payment_schedule.queries import ListPaymentScheduleQuery
from src.domain.object.entities import Object
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCClient, OneCPaymentSchedule


class ListPaymentSchedule:
	def __init__(self, uow: UnitOfWork, onec_client: OneCClient):
		self.uow = uow
		self.onec_client = onec_client

	async def execute(self, query: ListPaymentScheduleQuery) -> ListPaymentScheduleDTO:
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
			*(self.onec_client.fetch_payment_schedule(obj.url, query.date_from, query.date_to) for obj in objects),
			return_exceptions=True,
		)

		return self._build_dto(objects, results)

	def _build_dto(
		self,
		objects: list[Object],
		results: list[list[OneCPaymentSchedule] | BaseException],
	) -> ListPaymentScheduleDTO:
		items: list[ObjectPaymentScheduleDTO] = []
		failed_objects: list[FailedObjectDTO] = []

		for obj, result in zip(objects, results, strict=True):
			if isinstance(result, BaseException):
				failed_objects.append(FailedObjectDTO(object_id=obj.id, object_title=obj.title))
				continue

			items.append(
				ObjectPaymentScheduleDTO(
					object_id=obj.id,
					object_title=obj.title,
					entries=[
						PaymentScheduleEntryDTO(
							kontragent=e.kontragent,
							contract=e.contract,
							plan=[PaymentEntryDTO(date=p.date, sum=p.sum) for p in e.plan],
							currency=e.currency,
							ost_start=e.ost_start,
							ost_end=e.ost_end,
							fact=[PaymentEntryDTO(date=f.date, sum=f.sum) for f in e.fact],
							phone=e.phone,
						)
						for e in result
					],
				)
			)

		return ListPaymentScheduleDTO(items=items, failed_objects=failed_objects)
