from src.application.cashbox.dtos import CashDetailDTO
from src.application.cashbox.queries import GetCashDetailsQuery
from src.core.errors import ForbiddenError
from src.domain.user.enums import CashAccessScope
from src.domain.user.exceptions import CashAccessForbiddenError
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

			scope = user.effective_cash_access_scope

		details = await self.onec_client.fetch_cash_details(obj.url, query.cash_id, query.date_from, query.date_to)

		# Кассы, не подходящие под cash_access_scope, не попадают в список — но ссылку на
		# детализацию можно набрать вручную/по старой закладке, так что перепроверяем и тут.
		# Пустой ответ (нет движений за период) ничего не раскрывает, поэтому не блокируем его.
		if details and scope != CashAccessScope.ALL:
			is_main = details[0].main
			allowed = is_main if scope == CashAccessScope.MAIN else not is_main
			if not allowed:
				raise CashAccessForbiddenError()

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
