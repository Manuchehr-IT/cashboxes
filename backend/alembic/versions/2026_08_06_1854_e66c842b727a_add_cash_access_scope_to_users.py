"""add cash_access_scope to users

Revision ID: e66c842b727a
Revises: 2094bc610799
Create Date: 2026-08-06 18:54:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e66c842b727a"
down_revision: Union[str, Sequence[str], None] = "2094bc610799"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column("cash_access_scope", sa.String(), server_default="all", nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "cash_access_scope")
