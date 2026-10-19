from pydantic_settings import BaseSettings, SettingsConfigDict

from .schemas import AppSettings, DatabaseSettings, JWTSettings, RedisSettings, StorageSettings


class Settings(BaseSettings):
	app: AppSettings
	database: DatabaseSettings
	jwt: JWTSettings
	redis: RedisSettings
	storage: StorageSettings

	model_config = SettingsConfigDict(
		extra="ignore",
		env_nested_delimiter="__",
		case_sensitive=False,
	)

settings = Settings() # pyright: ignore[reportCallIssue]
