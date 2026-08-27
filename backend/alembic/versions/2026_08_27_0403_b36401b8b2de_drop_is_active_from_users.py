"""drop is_active from users

Revision ID: b36401b8b2de
Revises: 78e5e6ae6a5a
Create Date: 2026-08-27 04:03:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b36401b8b2de"
down_revision: Union[str, Sequence[str], None] = "78e5e6ae6a5a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("users", "is_active")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
    )
