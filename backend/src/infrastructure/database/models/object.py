from sqlalchemy import Boolean, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.database import Base, IdMixin, TimestampMixin


class ObjectModel(Base, IdMixin, TimestampMixin):
	__tablename__ = "objects"

	title: Mapped[str] = mapped_column(String, nullable=False)
	url: Mapped[str] = mapped_column(String, nullable=False)

	is_active: Mapped[bool] = mapped_column(Boolean, server_default="true", nullable=False)

	__table_args__ = (
		UniqueConstraint("title", name="uq_object_title"),
		UniqueConstraint("url", name="uq_object_url"),
	)
