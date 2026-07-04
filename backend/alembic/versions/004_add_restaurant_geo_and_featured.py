"""add restaurant latitude, longitude, is_featured

Revision ID: 004
Revises: 003
Create Date: 2026-07-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("restaurants", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("restaurants", sa.Column("longitude", sa.Float(), nullable=True))
    op.add_column(
        "restaurants",
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("restaurants", "is_featured")
    op.drop_column("restaurants", "longitude")
    op.drop_column("restaurants", "latitude")
