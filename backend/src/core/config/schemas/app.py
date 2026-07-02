
from pydantic import Field
from pydantic_settings import BaseSettings

from .enums import Environment


class AppSettings(BaseSettings):
	environment: Environment
	allowed_origins: list[str] = Field(default_factory=list)
	allowed_hosts: list[str] = Field(default_factory=list)

	title: str
	languages: list[str] = Field(default_factory=list)
	default_language: str

	@property
	def debug(self) -> bool:
		return self.environment in [Environment.LOCAL, Environment.DEVELOPMENT]
