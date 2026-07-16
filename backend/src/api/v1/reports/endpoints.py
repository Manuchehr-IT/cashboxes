from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.api.dependencies import get_current_user, require_user
from src.application.cashbox.use_cases import GetCashDetails, ListCashboxes
from src.domain.user.entities import User

from . import schemas
from .dependencies import provide_get_cash_details, provide_list_cashboxes
from .mappers import GetCashDetailsMapper, ListCashboxesMapper

router = APIRouter(prefix="/reports/cashboxes", tags=["Reports"], dependencies=[Depends(require_user)])


@router.get("", response_model=schemas.ListCashboxesResponse)
async def list_cashboxes_endpoint(
	list_cashboxes: ListCashboxes = Depends(provide_list_cashboxes),
	current_user: User = Depends(get_current_user),
	date_from: date | None = Query(default=None),
	date_to: date | None = Query(default=None),
):
	query = ListCashboxesMapper.to_query(user_id=current_user.id, date_from=date_from, date_to=date_to)
	result_dto = await list_cashboxes.execute(query)
	return ListCashboxesMapper.to_response(result_dto)


@router.get("/{object_id}/{cash_id}", response_model=schemas.ListCashDetailsResponse)
async def get_cash_details_endpoint(
	object_id: UUID,
	cash_id: str,
	get_cash_details: GetCashDetails = Depends(provide_get_cash_details),
	current_user: User = Depends(get_current_user),
	date_from: date | None = Query(default=None),
	date_to: date | None = Query(default=None),
):
	query = GetCashDetailsMapper.to_query(
		user_id=current_user.id,
		object_id=object_id,
		cash_id=cash_id,
		date_from=date_from,
		date_to=date_to,
	)
	items = await get_cash_details.execute(query)
	return GetCashDetailsMapper.to_response(items)
