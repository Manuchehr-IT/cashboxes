from datetime import date
from uuid import UUID

from src.application.cashbox.dtos import CashDetailDTO, ListCashboxesDTO
from src.application.cashbox.queries import GetCashDetailsQuery, ListCashboxesQuery

from . import schemas


class GetCashDetailsMapper:
	@staticmethod
	def to_query(
		user_id: UUID,
		object_id: UUID,
		cash_id: str,
		date_from: date | None,
		date_to: date | None,
	) -> GetCashDetailsQuery:
		return GetCashDetailsQuery(
			user_id=user_id,
			object_id=object_id,
			cash_id=cash_id,
			date_from=date_from,
			date_to=date_to,
		)

	@staticmethod
	def to_response(items: list[CashDetailDTO]) -> schemas.ListCashDetailsResponse:
		return schemas.ListCashDetailsResponse(
			items=[
				schemas.CashDetailResponse(
					ddsname=d.ddsname,
					sump=d.sump,
					sumr=d.sumr,
					subkonto=d.subkonto,
					doc=d.doc,
					comment=d.comment,
				)
				for d in items
			]
		)


class ListCashboxesMapper:
	@staticmethod
	def to_query(user_id: UUID, date_from: date | None, date_to: date | None) -> ListCashboxesQuery:
		return ListCashboxesQuery(user_id=user_id, date_from=date_from, date_to=date_to)

	@staticmethod
	def to_response(dto: ListCashboxesDTO) -> schemas.ListCashboxesResponse:
		return schemas.ListCashboxesResponse(
			items=[
				schemas.ObjectCashboxesResponse(
					object_id=item.object_id,
					object_title=item.object_title,
					cashboxes=[
						schemas.CashboxResponse(
							id=c.id,
							name=c.name,
							currency=c.currency,
							main=c.main,
							type=c.type,
							ost1=c.ost1,
							sump=c.sump,
							sumr=c.sumr,
							ost2=c.ost2,
						)
						for c in item.cashboxes
					],
				)
				for item in dto.items
			],
			failed_objects=[
				schemas.FailedObjectResponse(object_id=f.object_id, object_title=f.object_title)
				for f in dto.failed_objects
			],
		)
