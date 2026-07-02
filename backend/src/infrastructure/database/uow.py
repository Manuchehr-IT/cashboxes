from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from types import TracebackType
from typing import Self

from src.infrastructure.database.repositories import ObjectRepository, UserRepository, UserObjectRepository


class UnitOfWork:
	def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
		self._session_factory = session_factory
		self._session: AsyncSession | None = None

	async def __aenter__(self) -> Self:
		if self._session is not None:
			raise RuntimeError("Unit of Work already started")

		self._session = self._session_factory()
		await self._session.begin()

		self.user = UserRepository(self._session)
		self.obj = ObjectRepository(self._session)
		self.user_object = UserObjectRepository(self._session)

		return self

	async def __aexit__(
		self,
		exc_type: type[BaseException] | None,
		exc_val: BaseException | None,
		exc_tb: TracebackType | None,
	) -> None:
		if not self._session:
			return

		try:
			if exc_type:
				await self._session.rollback()
			else:
				await self._session.commit()
		finally:
			await self._session.close()
			self._session = None

	@property
	def session(self) -> AsyncSession:
		if self._session is None:
			raise RuntimeError("Unit of Work not started")
		return self._session

	def savepoint(self):
		"""SAVEPOINT within the active transaction; rolls back to here on error without aborting the UoW."""
		return self.session.begin_nested()
