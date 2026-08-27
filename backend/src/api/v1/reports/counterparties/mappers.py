from uuid import UUID

from src.application.counterparty.dtos import ListCounterpartiesDTO
from src.application.counterparty.queries import ListCounterpartiesQuery

from . import schemas


class ListCounterpartiesMapper:
	@staticmethod
	def to_query(user_id: UUID) -> ListCounterpartiesQuery:
		return ListCounterpartiesQuery(user_id=user_id)

	@staticmethod
	def to_response(dto: ListCounterpartiesDTO) -> schemas.ListCounterpartiesResponse:
		return schemas.ListCounterpartiesResponse(
			items=[
				schemas.ObjectDebtsResponse(
					object_id=item.object_id,
					object_title=item.object_title,
					debts=[
						schemas.DebtResponse(
							acc_code=d.acc_code,
							acc_name=d.acc_name,
							kontr=d.kontr,
							manager=d.manager,
							contract=d.contract,
							debt=d.debt,
							currency=d.currency,
							vid_raschet=d.vid_raschet,
						)
						for d in item.debts
					],
				)
				for item in dto.items
			],
			failed_objects=[
				schemas.FailedObjectResponse(object_id=f.object_id, object_title=f.object_title)
				for f in dto.failed_objects
			],
		)
