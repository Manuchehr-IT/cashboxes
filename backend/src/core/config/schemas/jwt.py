from pydantic_settings import BaseSettings


class JWTSettings(BaseSettings):
	secret_key: str
	algorithm: str
	access_token_expire_minutes: int
	refresh_token_expire_days: int
