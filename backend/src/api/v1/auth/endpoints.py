from fastapi import APIRouter, Depends

from src.application.auth.use_cases import AuthLogin

from . import schemas
from .dependencies import get_auth_login
from .mappers import AuthLoginMapper, AuthResultMapper

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=schemas.AuthResultResponse)
async def auth_login_endpoint(
	request: schemas.AuthLoginRequest,
	auth_login: AuthLogin = Depends(get_auth_login)
):
	command = AuthLoginMapper.to_command(request)
	result_dto = await auth_login.execute(command)
	return AuthResultMapper.to_response(result_dto)
