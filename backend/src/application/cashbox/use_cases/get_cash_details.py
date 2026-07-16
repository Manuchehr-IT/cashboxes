from src.application.cashbox.dtos import CashDetailDTO
from src.application.cashbox.queries import GetCashDetailsQuery
from src.core.errors import ForbiddenError
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCClient


class GetCashDetails:
	def __init__(self, uow: UnitOfWork, onec_client: OneCClient):
		self.uow = uow
		self.onec_client = onec_client

	async def execute(self, query: GetCashDetailsQuery) -> list[CashDetailDTO]:
		async with self.uow:
			user = await self.uow.user.get(query.user_id)
			obj = await self.uow.obj.get(query.object_id)

			if not user.is_admin and not await self.uow.user_object.has_access(query.user_id, query.object_id):
				raise ForbiddenError()

		details = await self.onec_client.fetch_cash_details(obj.url, query.cash_id, query.date_from, query.date_to)

		return [
			CashDetailDTO(
				ddsname=d.ddsname,
				sump=d.sump,
				sumr=d.sumr,
				subkonto=d.subkonto,
				doc=d.doc,
				comment=d.comment,
			)
			for d in details
		]
