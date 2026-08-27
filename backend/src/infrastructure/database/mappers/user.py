from src.domain.user.entities import User
from src.domain.user.enums import CashAccessScope
from src.domain.user.value_objects.object import UserObject
from src.infrastructure.database.models import UserModel, UserObjectModel


class UserMapper:
	@staticmethod
	def to_domain(model: UserModel) -> User:
		user = User(
			id=model.id,
			username=model.username,
			password_hash=model.password_hash,
			is_admin=model.is_admin,
			cash_access_scope=CashAccessScope(model.cash_access_scope),
			can_view_cashboxes=model.can_view_cashboxes,
			can_view_counterparties=model.can_view_counterparties,
			created_at=model.created_at,
			updated_at=model.updated_at,
			_objects=[
				UserObject(
					object_id=i.object_id
				)
				for i in model.objects
			]
		)
		return user

	@staticmethod
	def to_model(user: User) -> UserModel:
		return UserModel(
			id=user.id,
			username=user.username,
			password_hash=user.password_hash,
			is_admin=user.is_admin,
			cash_access_scope=user.cash_access_scope.value,
			can_view_cashboxes=user.can_view_cashboxes,
			can_view_counterparties=user.can_view_counterparties,
			created_at=user.created_at,
			updated_at=user.updated_at,
			objects=[
				UserObjectModel(
					user_id=user.id,
					object_id=i.object_id,
				)
				for i in user.objects
			]
		)
