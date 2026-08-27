"""
Create or verify the first admin user.

Usage:
    ADMIN_USERNAME=admin ADMIN_PASSWORD=secret python -m scripts.create_admin

The script is idempotent: if the user already exists as an admin it prints
a confirmation and exits successfully.
"""

import asyncio
import os
import sys

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from src.core.config import settings
from src.domain.user.entities import User
from src.infrastructure.database import UnitOfWork
from src.infrastructure.security.hasher import Hasher


async def main() -> None:
    username = os.getenv("ADMIN_USERNAME")
    password = os.getenv("ADMIN_PASSWORD")

    if not username:
        sys.exit("Error: set ADMIN_USERNAME env var")
    if not password:
        sys.exit("Error: set ADMIN_PASSWORD env var")

    engine = create_async_engine(settings.database.async_dsn, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    hasher = Hasher()
    uow = UnitOfWork(session_factory)

    try:
        async with uow:
            existing = await uow.user.find_by_username(username)

            if existing is not None:
                if existing.is_admin:
                    print(f"Admin '{username}' already exists — nothing to do.")
                else:
                    print(
                        f"User '{username}' exists but is NOT an admin. "
                        "Grant admin rights manually via the API or database."
                    )
                return

            password_hash = hasher.hash_password(password)
            user = User.create(
                username=username,
                password_hash=password_hash,
                is_admin=True,
            )
            await uow.user.add(user)

        print(f"Admin '{username}' created successfully.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
