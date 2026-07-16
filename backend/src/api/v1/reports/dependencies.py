from fastapi import Depends

from src.api.dependencies import get_onec_client, get_uow
from src.application.cashbox.use_cases import GetCashDetails, ListCashboxes
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCClient


async def provide_list_cashboxes(
	uow: UnitOfWork = Depends(get_uow),
	onec_client: OneCClient = Depends(get_onec_client),
) -> ListCashboxes:
	return ListCashboxes(uow, onec_client)

async def provide_get_cash_details(
	uow: UnitOfWork = Depends(get_uow),
	onec_client: OneCClient = Depends(get_onec_client),
) -> GetCashDetails:
	return GetCashDetails(uow, onec_client)
