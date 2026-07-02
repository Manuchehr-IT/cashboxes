from src.domain.user.entities import User
from src.domain.user.value_objects.object import UserObject
from src.infrastructure.database.models import UserModel, UserObjectModel


class UserMapper:
	@staticmethod
	def to_domain(model: UserModel) -> User:
		user = User(
			id=model.id,
			username=model.username,
			password_hash=model.password_hash,
			is_active=model.is_active,
			is_admin=model.is_admin,
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
			is_active=user.is_active,
			is_admin=user.is_admin,
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
