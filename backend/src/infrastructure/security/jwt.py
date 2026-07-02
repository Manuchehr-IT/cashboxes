from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from src.core.errors import AuthenticationFailedError


class JWTService:
	"""Сервис JWT токенов"""
	def __init__(self, secret_key: str, algorithm: str, access_token_expire_minutes: int, refresh_token_expire_days: int):
		self.secret_key = secret_key
		self.algorithm = algorithm
		self.access_token_expire_minutes = access_token_expire_minutes
		self.refresh_token_expire_days = refresh_token_expire_days

	def create_access_token(self, payload: dict[str, Any], expires_delta: timedelta | None = None) -> str:
		"""Создать access token"""
		to_encode = payload.copy()
		expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=self.access_token_expire_minutes))

		to_encode.update({"exp": expire, "type": "access"})
		encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
		return encoded_jwt

	def create_refresh_token(self, user_id: str) -> str:
		"""Создать refresh token"""
		expire = datetime.now(UTC) + timedelta(days=self.refresh_token_expire_days)
		payload: dict[str, Any] = {"sub": user_id, "exp": expire, "type": "refresh"}
		return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

	def verify_token(self, token: str, expected_type: str = "access") -> dict[str, Any]:
		"""Верифицировать токен"""
		if not token:
			raise AuthenticationFailedError("missing")

		try:
			payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], options={"verify_exp": True})
		except jwt.ExpiredSignatureError as e:
			raise AuthenticationFailedError("expired") from e
		except jwt.InvalidTokenError as e:
			raise AuthenticationFailedError("invalid") from e

		if payload.get("type") != expected_type:
			raise AuthenticationFailedError("invalid")

		return payload
