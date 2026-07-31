"""학생 온보딩(관심사 선택) — student_onboarding

Revision ID: onboarding_interest_01
Revises: course_payment_pg_02
Create Date: 2026-07-31

가입 직후 관심사 선택 상태를 학생당 1행으로 보관한다. 관심사는 6과목 고정이라 별도
테이블 없이 JSON 배열(선택 순서 = 선호 우선순위)로 두고, completed_at은 '온보딩 화면을
통과했다'는 표시다(관심사를 안 고르고 건너뛴 경우도 채운다). student_id는 소프트 참조
(FK 없음) — 신규 테이블 규약(collation 정합).

멱등: 테이블이 이미 있으면(운영 DB에 선반영된 경우) 건너뛴다. 그런 환경에서는
`alembic stamp onboarding_interest_01`로 적용 표시만 하고 이 upgrade는 실행하지 않는다.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "onboarding_interest_01"
down_revision: Union[str, None] = "course_payment_pg_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    if "student_onboarding" in insp.get_table_names():
        return
    op.create_table(
        "student_onboarding",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("student_id", sa.CHAR(36), nullable=False),
        sa.Column("interests", sa.JSON(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        # 학생당 1행 — 동시 저장 요청이 행을 둘 만들지 못하게 DB에서 막는다.
        # 조회는 전부 student_id 단건이라 이 유니크 인덱스가 조회 인덱스도 겸한다.
        sa.UniqueConstraint("student_id", name="uq_student_onboarding"),
    )


def downgrade() -> None:
    op.drop_table("student_onboarding")
