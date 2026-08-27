"""add report permissions to users

Revision ID: 78e5e6ae6a5a
Revises: e66c842b727a
Create Date: 2026-08-10 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "78e5e6ae6a5a"
down_revision: Union[str, Sequence[str], None] = "e66c842b727a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column("can_view_cashboxes", sa.Boolean(), server_default="true", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("can_view_counterparties", sa.Boolean(), server_default="true", nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "can_view_counterparties")
    op.drop_column("users", "can_view_cashboxes")
