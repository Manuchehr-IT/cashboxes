from datetime import date
from uuid import UUID

from src.application.payment_schedule.dtos import ListPaymentScheduleDTO
from src.application.payment_schedule.queries import ListPaymentScheduleQuery

from . import schemas


class ListPaymentScheduleMapper:
	@staticmethod
	def to_query(user_id: UUID, date_from: date | None, date_to: date | None) -> ListPaymentScheduleQuery:
		return ListPaymentScheduleQuery(user_id=user_id, date_from=date_from, date_to=date_to)

	@staticmethod
	def to_response(dto: ListPaymentScheduleDTO) -> schemas.ListPaymentScheduleResponse:
		return schemas.ListPaymentScheduleResponse(
			items=[
				schemas.ObjectPaymentScheduleResponse(
					object_id=item.object_id,
					object_title=item.object_title,
					entries=[
						schemas.PaymentScheduleEntryResponse(
							kontragent=e.kontragent,
							contract=e.contract,
							plan=[schemas.PaymentEntryResponse(date=p.date, sum=p.sum) for p in e.plan],
							currency=e.currency,
							ost_start=e.ost_start,
							ost_end=e.ost_end,
							fact=[schemas.PaymentEntryResponse(date=f.date, sum=f.sum) for f in e.fact],
							phone=e.phone,
						)
						for e in item.entries
					],
				)
				for item in dto.items
			],
			failed_objects=[
				schemas.FailedObjectResponse(object_id=f.object_id, object_title=f.object_title)
				for f in dto.failed_objects
			],
		)
