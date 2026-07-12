"""add restaurant website_url

Revision ID: 005
Revises: 004
Create Date: 2026-07-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("restaurants", sa.Column("website_url", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("restaurants", "website_url")
