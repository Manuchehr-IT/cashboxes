from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings


class DatabaseSettings(BaseSettings):
	name: str
	user: str
	password: str
	host: str
	port: int

	@computed_field
	@property
	def dsn(self) -> PostgresDsn:
		return PostgresDsn.build(
			scheme="postgresql",
			username=self.user,
			password=self.password,
			host=self.host,
			port=self.port,
			path=self.name,
		)

	@computed_field
	@property
	def async_dsn(self) -> str:
		dsn = self.dsn
		return str(dsn).replace("postgresql://", "postgresql+asyncpg://")

