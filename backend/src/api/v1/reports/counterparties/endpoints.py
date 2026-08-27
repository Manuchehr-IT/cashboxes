from fastapi import APIRouter, Depends

from src.api.dependencies import get_current_user, require_user
from src.application.counterparty.use_cases import ListCounterparties
from src.domain.user.entities import User

from . import schemas
from .dependencies import provide_list_counterparties
from .mappers import ListCounterpartiesMapper

router = APIRouter(prefix="/reports/counterparties", tags=["Reports"], dependencies=[Depends(require_user)])


@router.get("", response_model=schemas.ListCounterpartiesResponse)
async def list_counterparties_endpoint(
	list_counterparties: ListCounterparties = Depends(provide_list_counterparties),
	current_user: User = Depends(get_current_user),
):
	query = ListCounterpartiesMapper.to_query(user_id=current_user.id)
	result_dto = await list_counterparties.execute(query)
	return ListCounterpartiesMapper.to_response(result_dto)
