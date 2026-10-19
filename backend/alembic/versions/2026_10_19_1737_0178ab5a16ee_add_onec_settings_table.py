"""add onec settings table

Revision ID: 0178ab5a16ee
Revises: b36401b8b2de
Create Date: 2026-10-19 17:37:55.647605

"""

import os
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0178ab5a16ee"
down_revision: Union[str, Sequence[str], None] = "b36401b8b2de"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "onec_settings",
        sa.Column("username", sa.String(), nullable=False, server_default=""),
        sa.Column("password", sa.String(), nullable=False, server_default=""),
        sa.Column(
            "id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # Перенос текущих креденшлов 1C из .env в БД, чтобы не терять уже настроенный логин/пароль —
    # дальше они правятся только через API/UI, а не .env.
    op.execute(
        sa.text("INSERT INTO onec_settings (username, password) VALUES (:username, :password)").bindparams(
            username=os.environ.get("ONEC__USERNAME", ""),
            password=os.environ.get("ONEC__PASSWORD", ""),
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("onec_settings")
