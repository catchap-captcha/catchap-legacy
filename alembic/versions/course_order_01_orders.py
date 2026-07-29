"""코스 결제 주문 테이블.

Revision ID: course_order_01
Revises: course_enroll_01
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "course_order_01"
down_revision: Union[str, None] = "course_enroll_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if "course_orders" in sa.inspect(op.get_bind()).get_table_names():
        return
    op.create_table(
        "course_orders",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("student_id", sa.CHAR(36), nullable=False),
        sa.Column("course_id", sa.CHAR(36), nullable=False),
        sa.Column("order_uid", sa.String(64), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("provider", sa.String(20), nullable=False, server_default="mock"),
        sa.Column("payment_key", sa.String(200), nullable=True),
        sa.Column("method", sa.String(30), nullable=True),
        sa.Column("paid_at", sa.DateTime(), nullable=True),
        sa.Column("fail_reason", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_order_student", "course_orders", ["student_id"])
    op.create_index("ix_order_course", "course_orders", ["course_id"])
    op.create_index("ix_order_uid", "course_orders", ["order_uid"], unique=True)
    op.create_index(
        "ix_order_student_course_status",
        "course_orders",
        ["student_id", "course_id", "status"],
    )


def downgrade() -> None:
    op.drop_index("ix_order_student_course_status", table_name="course_orders")
    op.drop_index("ix_order_uid", table_name="course_orders")
    op.drop_index("ix_order_course", table_name="course_orders")
    op.drop_index("ix_order_student", table_name="course_orders")
    op.drop_table("course_orders")
