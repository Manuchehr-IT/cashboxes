from pydantic import RedisDsn, computed_field
from pydantic_settings import BaseSettings


class RedisSettings(BaseSettings):
	host: str
	port: int
	db: int
	username: str | None = None
	password: str | None = None

	@computed_field
	@property
	def dsn(self) -> RedisDsn:
		return RedisDsn.build(
			scheme="redis",
			username=self.username,
			password=self.password,
			host=self.host,
			port=self.port,
			path=str(self.db),
		)
