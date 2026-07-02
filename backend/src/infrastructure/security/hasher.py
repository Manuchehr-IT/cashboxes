import hashlib
import hmac

import bcrypt


class Hasher:
	def hash_password(self, password: str) -> str:
		return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

	def verify_password(self, password: str, hashed_password: str) -> bool:
		return bcrypt.checkpw(password.encode(), hashed_password.encode())

	def hash_code(self, code: str) -> str:
		return hashlib.sha256(code.encode()).hexdigest()

	def verify_code(self, code: str, code_hash: str) -> bool:
		return hmac.compare_digest(code_hash, self.hash_code(code))
