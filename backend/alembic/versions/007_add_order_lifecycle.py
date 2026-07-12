"""add real order lifecycle: status, driver, reject reason, stage timestamps

Revision ID: 007
Revises: 006
Create Date: 2026-07-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Authoritative lifecycle state, driven by merchant + driver actions.
    op.add_column(
        "orders",
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
    )
    op.add_column("orders", sa.Column("driver_name", sa.String(120), nullable=True))
    op.add_column("orders", sa.Column("rejected_reason", sa.String(200), nullable=True))
    # Audit trail — when each stage began.
    op.add_column("orders", sa.Column("accepted_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("ready_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("out_for_delivery_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("delivered_at", sa.DateTime(), nullable=True))
    op.create_index("ix_orders_status", "orders", ["status"])


def downgrade() -> None:
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_column("orders", "delivered_at")
    op.drop_column("orders", "out_for_delivery_at")
    op.drop_column("orders", "ready_at")
    op.drop_column("orders", "accepted_at")
    op.drop_column("orders", "rejected_reason")
    op.drop_column("orders", "driver_name")
    op.drop_column("orders", "status")
