from fastapi import Depends

from src.api.dependencies import get_onec_client, get_uow
from src.application.counterparty.use_cases import ListCounterparties
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCClient


async def provide_list_counterparties(
	uow: UnitOfWork = Depends(get_uow),
	onec_client: OneCClient = Depends(get_onec_client),
) -> ListCounterparties:
	return ListCounterparties(uow, onec_client)
