from pydantic_settings import BaseSettings


class StorageSettings(BaseSettings):
	dir: str

	@property
	def avatar_dir(self) -> str:
		return f"{self.dir}/avatars"
