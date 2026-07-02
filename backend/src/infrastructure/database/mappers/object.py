from src.domain.object.entities import Object
from src.infrastructure.database.models import ObjectModel


class ObjectMapper:
	@staticmethod
	def to_domain(model: ObjectModel) -> Object:
		return Object(
			id=model.id,
			title=model.title,
			url=model.url,
			is_active=model.is_active,
			created_at=model.created_at,
			updated_at=model.updated_at
		)

	@staticmethod
	def to_model(obj: Object) -> ObjectModel:
		return ObjectModel(
			id=obj.id,
			title=obj.title,
			url=obj.url,
			is_active=obj.is_active,
			created_at=obj.created_at,
			updated_at=obj.updated_at,
		)
