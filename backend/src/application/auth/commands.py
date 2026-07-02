from pydantic import BaseModel


class AuthLoginCommand(BaseModel):
	username: str
	password: str
