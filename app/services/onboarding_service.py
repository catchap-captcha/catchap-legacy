"""학생 온보딩(관심사 선택·추천 근거) + 반 배정 이력(SIS enrollment) 기록.

종전의 온보딩(학생 가입코드·학부모 초대코드)은 학교·학부모 은퇴(0717~18)로 제거됐고,
지금 이 모듈의 '온보딩'은 **가입 직후 관심사 선택**이다(이메일 가입 학생 기준):
관심사 저장 → 코스 카테고리 → 관심사 기반 추천 코스가 한 흐름이라 계산을 여기 모은다.
배정 이력 기록은 기존 데이터의 학년도 절단 계산이 계속 읽어 그대로 남는다.
"""

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import (
    ClassAssignment,
    Course,
    CourseEnrollment,
    Lecture,
    StudentOnboarding,
    StudentProfile,
    User,
)
from app.services.captcha_service import EDU_SUBJECTS
from app.services.course_pricing import effective_course_price
from app.services.design_data import SUBJECT_META, SUBJECT_ORDER

# 관심사 카테고리 정본 = 교육 6과목. 코스도 과목 하나로 고정(코스=과목)이라
# '관심사 카테고리'와 '코스 카테고리'가 같은 축이고, 추천이 조건 없이 성립한다.
INTEREST_CATEGORIES = [s for s in SUBJECT_ORDER if s in EDU_SUBJECTS]
MAX_INTERESTS = len(INTEREST_CATEGORIES)

# 추천 응답 기본/최대 개수 — 온보딩 직후 카드 목록 한 화면 분량.
RECOMMEND_DEFAULT_LIMIT = 10
RECOMMEND_MAX_LIMIT = 50


class InvalidInterest(ValueError):
    """지원하지 않는 관심사 값 — 라우터가 400으로 바꾼다."""


def normalize_interests(raw: list[str]) -> list[str]:
    """공백 정리 → 중복 제거(첫 등장 순서 유지) → 6과목 소속 검증.

    순서를 유지하는 이유: 배열 순서가 선호 우선순위이고 추천 정렬이 이 순서를 쓴다.
    set()으로 정리하면 순서가 무너져 추천 결과가 요청마다 달라진다."""
    out: list[str] = []
    for item in raw:
        value = (item or "").strip()
        if not value:
            continue
        if value not in INTEREST_CATEGORIES:
            raise InvalidInterest(value)
        if value not in out:
            out.append(value)
    return out


def get_state(db: Session, student_id: str) -> StudentOnboarding | None:
    return (
        db.query(StudentOnboarding)
        .filter(StudentOnboarding.student_id == student_id)
        .first()
    )


def student_interests(db: Session, student_id: str) -> list[str]:
    """저장된 관심사 — 행이 없거나 값이 깨졌으면 빈 목록.

    JSON 컬럼이라 구데이터/수기 수정으로 리스트가 아닌 값이 들어올 수 있고, 그때
    추천이 500으로 죽는 대신 '관심사 없음'(인기순 폴백)으로 흐른다."""
    state = get_state(db, student_id)
    if state is None or not isinstance(state.interests, list):
        return []
    return [i for i in state.interests if i in INTEREST_CATEGORIES]


def save_interests(db: Session, student_id: str, interests: list[str]) -> StudentOnboarding:
    """관심사 저장(멱등 upsert) + 온보딩 완료 표시.

    completed_at은 처음 저장할 때만 찍는다 — 설정 화면에서 관심사를 고쳐도 '온보딩을
    통과한 시점'은 바뀌지 않는다. 동시 요청으로 unique 충돌이 나면 상대가 만든 행을
    다시 읽어 그 위에 쓴다(행 2개가 생기거나 500이 나가지 않게)."""
    state = get_state(db, student_id)
    if state is None:
        state = StudentOnboarding(student_id=student_id, interests=[])
        db.add(state)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            state = get_state(db, student_id)
            if state is None:  # 충돌 상대가 롤백된 극단 케이스 — 한 번 더 시도한다
                state = StudentOnboarding(student_id=student_id, interests=[])
                db.add(state)
    state.interests = list(interests)
    if state.completed_at is None:
        state.completed_at = datetime.now()  # created_at과 같은 로컬(KST) 규약
    db.commit()
    db.refresh(state)
    return state


def active_lecture_counts(db: Session, course_ids: list[str] | None = None) -> dict[str, int]:
    """코스별 활성 강의 수 — 코스마다 세면 N+1이라 한 번에 묶어 센다."""
    q = (
        db.query(Lecture.course_id, func.count(Lecture.id))
        .filter(Lecture.status == "active", Lecture.course_id.isnot(None))
    )
    if course_ids is not None:
        q = q.filter(Lecture.course_id.in_(course_ids or [""]))
    return {row[0]: int(row[1]) for row in q.group_by(Lecture.course_id).all()}


def _enrollment_counts(db: Session, course_ids: list[str]) -> dict[str, int]:
    """코스별 활성 수강 인원 — 관심사가 같은 코스들 사이의 인기순 정렬 근거."""
    rows = (
        db.query(CourseEnrollment.course_id, func.count(CourseEnrollment.id))
        .filter(
            CourseEnrollment.status == "active",
            CourseEnrollment.course_id.in_(course_ids or [""]),
        )
        .group_by(CourseEnrollment.course_id)
        .all()
    )
    return {row[0]: int(row[1]) for row in rows}


def enrolled_course_ids(db: Session, student_id: str) -> set[str]:
    return {
        row[0]
        for row in db.query(CourseEnrollment.course_id)
        .filter(
            CourseEnrollment.student_id == student_id,
            CourseEnrollment.status == "active",
        )
        .all()
    }


def _visible_courses(db: Session) -> list[Course]:
    """학생에게 보이는 코스 = 활성 코스 중 활성 강의가 1개 이상인 것.

    빈 코스를 감추는 규칙은 학생용 코스 목록(GET /courses)과 같다 — 카테고리 개수와
    추천 목록이 목록 화면과 어긋나면 '있다는데 없는 코스'가 된다."""
    courses = (
        db.query(Course)
        .filter(Course.status == "active")
        .order_by(Course.subject, Course.order_no, Course.created_at)
        .all()
    )
    counts = active_lecture_counts(db, [c.id for c in courses])
    return [c for c in courses if counts.get(c.id, 0) > 0]


def category_rows(db: Session, selected: list[str], *, only_with_courses: bool = False) -> list[dict]:
    """코스 카테고리 목록 — 6과목 고정 + 과목별 코스/강의 수 + 내 선택 여부.

    코스가 0개인 과목도 기본으로 내려준다: 온보딩의 관심사 선택 화면은 '지금 코스가
    있는 과목'이 아니라 6과목 전부를 보여 줘야 하고, 관심사는 나중에 열릴 코스의
    추천 근거로도 쓰인다. 카탈로그 필터처럼 빈 과목을 숨기려면 only_with_courses=true."""
    courses = _visible_courses(db)
    lecture_counts = active_lecture_counts(db, [c.id for c in courses])
    by_subject: dict[str, list[Course]] = {}
    for c in courses:
        by_subject.setdefault(c.subject, []).append(c)

    rows = []
    for subject in INTEREST_CATEGORIES:
        subject_courses = by_subject.get(subject, [])
        if only_with_courses and not subject_courses:
            continue
        meta = SUBJECT_META.get(subject, {})
        rows.append(
            {
                "key": subject,
                "label": subject,
                "color": meta.get("color"),
                "soft": meta.get("soft"),
                "icon": meta.get("icon"),
                "course_count": len(subject_courses),
                "lecture_count": sum(lecture_counts.get(c.id, 0) for c in subject_courses),
                "free_course_count": sum(
                    1 for c in subject_courses if effective_course_price(c) == 0
                ),
                # 이 학생이 관심사로 고른 카테고리인지 — 선택 화면의 초기 체크 상태
                "selected": subject in selected,
            }
        )
    return rows


def _course_card(
    c: Course,
    *,
    instructor_name: str | None,
    lecture_count: int,
    enrollment_count: int,
    enrolled: bool,
    reason: dict,
) -> dict:
    price = effective_course_price(c)
    return {
        "id": c.id,
        "title": c.title,
        "subject": c.subject,
        "description": c.description,
        "instructor_name": instructor_name,
        "lecture_count": lecture_count,
        "enrollment_count": enrollment_count,
        "enrolled": enrolled,
        "pricing": {
            "price": int(c.price or 0),
            "sale_price": c.sale_price,
            "sale_ends_at": c.sale_ends_at.isoformat() if c.sale_ends_at else None,
            "effective_price": price,
            "is_free": price == 0,
        },
        "reason": reason,
    }


def recommend_courses(
    db: Session,
    student_id: str,
    *,
    limit: int = RECOMMEND_DEFAULT_LIMIT,
    include_enrolled: bool = False,
) -> dict:
    """관심사 기반 추천 코스.

    정렬 = (관심사 우선순위, 수강 인원 많은 순, 과목 내 순서, 등록 순). 관심사를 안 골랐거나
    (건너뛰기) 고른 과목에 코스가 하나도 없으면 **전체 인기순으로 폴백**한다 — 온보딩 직후
    빈 화면을 주지 않기 위한 규칙이고, 응답의 fallback 플래그로 프론트가 문구를 바꾼다
    ("관심사 기반 추천" vs "인기 코스"). 이미 신청한 코스는 기본적으로 뺀다(내 코스에 있다)."""
    limit = max(1, min(int(limit or RECOMMEND_DEFAULT_LIMIT), RECOMMEND_MAX_LIMIT))
    interests = student_interests(db, student_id)
    courses = _visible_courses(db)
    enrolled = enrolled_course_ids(db, student_id)
    if not include_enrolled:
        courses = [c for c in courses if c.id not in enrolled]

    rank = {subject: i for i, subject in enumerate(interests)}
    matched = [c for c in courses if c.subject in rank]
    fallback = not matched
    picked = courses if fallback else matched

    course_ids = [c.id for c in picked]
    lecture_counts = active_lecture_counts(db, course_ids)
    enroll_counts = _enrollment_counts(db, course_ids)
    # 강사명 벌크 조회(N+1 회피) — instructor_id는 users로의 소프트 참조(FK 없음)
    names = {
        u.id: u.name
        for u in db.query(User).filter(User.id.in_({c.instructor_id for c in picked} or [""])).all()
    }

    picked.sort(
        key=lambda c: (
            rank.get(c.subject, len(rank)),          # 관심사 우선순위(폴백이면 전부 동률)
            -enroll_counts.get(c.id, 0),             # 인기순
            int(c.order_no or 0),                    # 과목 안에서의 지정 순서
            c.created_at or datetime.min,            # 안정 정렬(같은 순서면 등록 순)
        )
    )

    items = [
        _course_card(
            c,
            instructor_name=names.get(c.instructor_id),
            lecture_count=lecture_counts.get(c.id, 0),
            enrollment_count=enroll_counts.get(c.id, 0),
            enrolled=c.id in enrolled,
            reason=(
                {"kind": "popular", "subject": c.subject, "label": "지금 인기 있는 코스예요"}
                if fallback
                else {
                    "kind": "interest",
                    "subject": c.subject,
                    "label": f"관심사로 고른 '{c.subject}' 코스예요",
                }
            ),
        )
        for c in picked[:limit]
    ]
    return {
        "interests": interests,
        # true면 관심사 매칭이 아니라 전체 인기순 결과다(관심사 미선택 또는 매칭 0건)
        "fallback": fallback,
        "total": len(picked),
        "items": items,
    }


def status_payload(db: Session, student: StudentProfile) -> dict:
    """온보딩 상태 — 프론트는 completed 하나로 온보딩 화면 노출 여부를 판정한다.

    steps는 진행 표시용이다. 1) 관심사 선택(건너뛰기 포함, completed_at으로 판정)
    2) 첫 코스 수강신청. next_step은 아직 끝나지 않은 첫 단계이고, 전부 끝나면 None."""
    state = get_state(db, student.id)
    interests = student_interests(db, student.id)
    enrolled = enrolled_course_ids(db, student.id)
    interests_done = state is not None and state.completed_at is not None
    steps = [
        {"key": "interests", "title": "관심사 선택", "done": interests_done},
        {"key": "first_course", "title": "첫 코스 수강신청", "done": bool(enrolled)},
    ]
    return {
        # 온보딩(관심사 선택) 통과 여부 — 첫 수강신청은 여기 포함하지 않는다
        "completed": interests_done,
        "completed_at": state.completed_at.isoformat() if interests_done else None,
        "interests": interests,
        "interest_count": len(interests),
        "categories": INTEREST_CATEGORIES,
        "enrolled_course_count": len(enrolled),
        "steps": steps,
        "next_step": next((s["key"] for s in steps if not s["done"]), None),
        "student": {
            "id": student.id,
            "nickname": student.nickname,
            "grade_band": student.grade_band,
        },
    }


def record_class_assignment(db: Session, student: StudentProfile, new_class_id: str | None) -> None:
    """반 배정 이력 기록(SIS enrollment) — 배정이 바뀌는 모든 지점에서 호출한다.

    열린 행(ended_on IS NULL)을 오늘로 닫고, 새 반이 있으면 새 행을 연다.
    같은 반 재배정은 무시(이력 오염 방지). 시각은 KST 로컬(datetime.now()) 규약.
    교사 명단의 '학년도(배정 기간)' 학습시간 절단이 이 이력을 쓴다."""
    try:
        open_row = (
            db.query(ClassAssignment)
            .filter(ClassAssignment.student_id == student.id, ClassAssignment.ended_on.is_(None))
            .first()
        )
    except Exception:
        # 테이블이 아직 없으면(DDL 미적용 배포 창) 이력 기록만 건너뛴다 —
        # 배정 자체(class_id 변경)가 이력 때문에 실패하면 안 된다.
        db.rollback()
        return
    if open_row is not None and open_row.class_id == new_class_id:
        return  # 변화 없음
    now = datetime.now()
    if open_row is not None:
        open_row.ended_on = now
    if new_class_id:
        db.add(
            ClassAssignment(
                organization_id=student.organization_id,
                student_id=student.id,
                class_id=new_class_id,
                started_on=now,
            )
        )

# 혼동 문자(0/O, 1/I/L) 제외한 고엔트로피 알파벳


# --- 이하 은퇴(제품 전환 0717~18) ---
# 학생 가입코드 발급/활성화(generate_join_codes·reissue·check·activate_student)와
# 학부모 초대코드(issue_parent_invite·consume_parent_invite)는 학교·학부모 은퇴로
# 제거됐다 — 종전 코드는 git 이력 참고. 이 모듈에 남은 것은 반 배정 이력 기록뿐이다
# (기존 데이터의 학년도 절단 계산이 계속 읽는다).
