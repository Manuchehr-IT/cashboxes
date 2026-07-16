from pydantic_settings import BaseSettings


class OneCSettings(BaseSettings):
	username: str
	password: str
