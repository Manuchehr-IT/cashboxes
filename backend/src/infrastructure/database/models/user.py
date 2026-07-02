import uuid
from sqlalchemy import UUID, Boolean, ForeignKey, PrimaryKeyConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.database import Base, IdMixin, TimestampMixin


class UserObjectModel(Base):
	__tablename__ = "user_objects"

	user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
	object_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("objects.id", ondelete="CASCADE"))

	__table_args__ = (
		PrimaryKeyConstraint("user_id", "object_id", name="pk_user_object"),
	)

class UserModel(Base, IdMixin, TimestampMixin):
	__tablename__ = "users"

	username: Mapped[str] = mapped_column(String, nullable=False)
	password_hash: Mapped[str] = mapped_column(String, nullable=False)

	is_active: Mapped[bool] = mapped_column(Boolean, server_default="true", nullable=False)
	is_admin: Mapped[bool] = mapped_column(Boolean, server_default="false", nullable=False)

	# Связи
	objects: Mapped[list[UserObjectModel]] = relationship(
		lazy="selectin",
		cascade="all, delete-orphan",
	)

	__table_args__ = (
		UniqueConstraint("username", name="uq_user_username"),
	)
