from src.domain.object.entities import Object

from .dtos import ObjectDTO


class ObjectMapper:
	@staticmethod
	def to_dto(obj: Object) -> ObjectDTO:
		return ObjectDTO(
			id=obj.id,
			title=obj.title,
			url=obj.url,
			is_active=obj.is_active,
			created_at=obj.created_at,
			updated_at=obj.updated_at
		)
