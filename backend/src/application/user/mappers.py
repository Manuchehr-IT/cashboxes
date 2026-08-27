from src.application.user.dtos import UserDTO, UserWithPasswordDTO
from src.domain.user.entities import User


class UserMapper:
	@staticmethod
	def to_dto(user: User) -> UserDTO:
		return UserDTO(
			id=user.id,
			username=user.username,
			is_admin=user.is_admin,
			cash_access_scope=user.cash_access_scope,
			can_view_cashboxes=user.can_view_cashboxes,
			can_view_counterparties=user.can_view_counterparties,
			created_at=user.created_at,
			updated_at=user.updated_at,
		)

class UserWithPasswordMapper:
	@staticmethod
	def to_dto(user: User, password: str) -> UserWithPasswordDTO:
		return UserWithPasswordDTO(
			user=UserMapper.to_dto(user),
			password=password,
		)
