from datetime import date

from fastapi import APIRouter, Depends, Query

from src.api.dependencies import get_current_user, require_user
from src.application.payment_schedule.use_cases import ListPaymentSchedule
from src.domain.user.entities import User

from . import schemas
from .dependencies import provide_list_payment_schedule
from .mappers import ListPaymentScheduleMapper

router = APIRouter(prefix="/reports/payment-schedule", tags=["Reports"], dependencies=[Depends(require_user)])


@router.get("", response_model=schemas.ListPaymentScheduleResponse)
async def list_payment_schedule_endpoint(
	list_payment_schedule: ListPaymentSchedule = Depends(provide_list_payment_schedule),
	current_user: User = Depends(get_current_user),
	date_from: date | None = Query(default=None),
	date_to: date | None = Query(default=None),
):
	query = ListPaymentScheduleMapper.to_query(user_id=current_user.id, date_from=date_from, date_to=date_to)
	result_dto = await list_payment_schedule.execute(query)
	return ListPaymentScheduleMapper.to_response(result_dto)
