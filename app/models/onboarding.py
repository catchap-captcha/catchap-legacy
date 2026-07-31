from datetime import datetime

from sqlalchemy import CHAR, JSON, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamps, UUIDPk


class StudentOnboarding(Base, UUIDPk, Timestamps):
    """가입 직후 온보딩(관심사 선택) 상태 — 학생당 1행.

    관심사는 별도 테이블 대신 JSON 배열로 둔다: 값의 정본이 EDU_SUBJECTS 6과목으로 고정
    (학생당 최대 6개)이고, 읽는 쪽이 언제나 '이 학생의 관심사 전체'라 조인·집계가 없다.
    **배열 순서 = 선호 우선순위**(먼저 고른 과목이 추천 상단) — 저장 시 순서를 보존한다.

    completed_at은 '온보딩 화면을 통과했다'는 표시다. 관심사를 하나도 안 고르고 건너뛰어도
    (interests=[]) 채운다 — 프론트는 이 값 하나로 온보딩 재노출 여부를 판정하고, 빈 배열은
    '아직 안 물어봤다'가 아니라 '물어봤고 안 골랐다'로 읽힌다. 나중에 설정에서 관심사를
    고쳐도 최초 완료 시각은 유지한다(온보딩 통과 시점의 기록).
    """

    __tablename__ = "student_onboarding"
    # 학생당 1행 — 동시 저장 요청이 행을 둘 만들지 못하게 DB에서 막는다.
    # 조회는 전부 student_id 단건이라 이 유니크 인덱스가 조회 인덱스도 겸한다.
    __table_args__ = (UniqueConstraint("student_id", name="uq_student_onboarding"),)

    # 소프트 참조(FK 없음) — 신규 테이블 규약(collation 정합 회피).
    student_id: Mapped[str] = mapped_column(CHAR(36))
    interests: Mapped[list] = mapped_column(JSON, default=list)  # ["수학","과학"] — 선택 순서
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class StudentJoinCode(Base, UUIDPk, Timestamps):
    """학교 발급 1회용 학생 가입 코드.

    - login_id: 학교 발급·전역 유일. 코드에 내장(활성화 시 학생 로그인 아이디가 됨).
    - code_hash: 원문 저장 금지, sha256만. 학생이 코드 입력 시 hash 비교.
    - 활성화(코드 소비) 시 used_at 설정 + StudentProfile 생성.
    """

    __tablename__ = "student_join_codes"

    organization_id: Mapped[str] = mapped_column(CHAR(36), index=True)
    class_id: Mapped[str | None] = mapped_column(CHAR(36), nullable=True, index=True)
    login_id: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    code_hash: Mapped[str] = mapped_column(String(64), index=True)
    class_label: Mapped[str | None] = mapped_column(String(60), nullable=True)
    # 기관이 등록 시 입력한 실명 — 활성화되면 StudentProfile.real_name 으로 복사
    real_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # 기관(선생님)이 입력한 성별 — 활성화 시 StudentProfile.gender 로 복사(아이가 고르지 않음)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    student_id: Mapped[str | None] = mapped_column(CHAR(36), nullable=True)  # 활성화 후 연결
    created_by: Mapped[str | None] = mapped_column(CHAR(36), nullable=True)


class ParentInviteCode(Base, UUIDPk, Timestamps):
    """학교 발급 학부모 초대 코드 (학생 1명 귀속·고엔트로피·만료·N회 허용).

    B1(무단 연결) 해소: 학부모는 이 코드로만 자녀에 연결. 임의 학생코드 추측 불가.
    """

    __tablename__ = "parent_invite_codes"

    student_id: Mapped[str] = mapped_column(CHAR(36), index=True)
    organization_id: Mapped[str] = mapped_column(CHAR(36), index=True)
    code_hash: Mapped[str] = mapped_column(String(64), index=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    max_uses: Mapped[int] = mapped_column(Integer, default=2)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[str | None] = mapped_column(CHAR(36), nullable=True)
