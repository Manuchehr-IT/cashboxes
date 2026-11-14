from fastapi import Depends

from src.api.dependencies import get_onec_client, get_uow
from src.application.payment_schedule.use_cases import ListPaymentSchedule
from src.infrastructure.database import UnitOfWork
from src.infrastructure.external.onec import OneCClient


async def provide_list_payment_schedule(
	uow: UnitOfWork = Depends(get_uow),
	onec_client: OneCClient = Depends(get_onec_client),
) -> ListPaymentSchedule:
	return ListPaymentSchedule(uow, onec_client)
