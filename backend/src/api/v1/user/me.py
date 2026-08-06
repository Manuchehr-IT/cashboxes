from fastapi import APIRouter, Depends

from src.api.dependencies import require_user
from src.api.v1.user import schemas
from src.domain.user.entities import User

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(require_user)])


@router.get("/me", response_model=schemas.UserResponse)
async def me_endpoint(current_user: User = Depends(require_user)):
	return schemas.UserResponse(
		id=current_user.id,
		username=current_user.username,
		is_active=current_user.is_active,
		is_admin=current_user.is_admin,
		cash_access_scope=current_user.cash_access_scope,
		created_at=current_user.created_at,
		updated_at=current_user.updated_at,
	)
