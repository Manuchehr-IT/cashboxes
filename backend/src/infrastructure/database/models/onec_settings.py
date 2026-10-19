from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.database import Base, IdMixin, TimestampMixin


class OneCSettingsModel(Base, IdMixin, TimestampMixin):
	__tablename__ = "onec_settings"

	username: Mapped[str] = mapped_column(String, nullable=False, server_default="")
	password: Mapped[str] = mapped_column(String, nullable=False, server_default="")
