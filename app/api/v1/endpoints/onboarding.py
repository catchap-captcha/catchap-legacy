"""온보딩 API — 가입 직후 관심사 선택과 그 결과로 이어지는 코스 탐색(학생 전용).

  GET  /students/me/onboarding    온보딩 상태(완료 여부·관심사·다음 단계)
  POST /students/me/interests     관심사 저장(순서 = 선호 우선순위, 빈 배열 = 건너뛰기)
  GET  /courses/categories        코스 카테고리(6과목) + 과목별 코스·강의 수 + 내 선택 여부
  GET  /courses/recommended       관심사 기반 추천 코스(미선택·매칭 0건이면 인기순 폴백)

계산은 services/onboarding_service.py에 있다 — 카테고리 개수와 추천 목록이 학생용 코스
목록(GET /courses)과 같은 가시성 규칙(활성 코스 + 활성 강의 ≥ 1)을 쓰게 한 곳에 모았다.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import Principal, require_student
from app.db.session import get_db
from app.models import StudentProfile
from app.schemas.onboarding import InterestsUpdate
from app.services import onboarding_service
from app.services.onboarding_service import (
    INTEREST_CATEGORIES,
    RECOMMEND_DEFAULT_LIMIT,
    RECOMMEND_MAX_LIMIT,
    InvalidInterest,
)

router = APIRouter(tags=["onboarding"])


def _me(principal: Principal) -> StudentProfile:
    assert principal.student is not None
    return principal.student


@router.get("/students/me/onboarding")
def onboarding_status(
    principal: Principal = Depends(require_student), db: Session = Depends(get_db)
):
    """온보딩 상태 조회 — 첫 진입 화면을 띄울지, 어느 단계부터 보일지 판단하는 근거."""
    return onboarding_service.status_payload(db, _me(principal))


@router.post("/students/me/interests")
def save_interests(
    payload: InterestsUpdate,
    principal: Principal = Depends(require_student),
    db: Session = Depends(get_db),
):
    """관심사 저장 — 저장 후의 온보딩 상태를 그대로 돌려준다(프론트 재조회 불필요).

    배열 순서를 보존하고(선호 우선순위) 중복은 서버가 정리한다. 6과목 밖의 값은 400 —
    카테고리 정본이 서버에 있으므로 프론트가 임의 문자열을 심을 수 없다."""
    try:
        interests = onboarding_service.normalize_interests(payload.interests)
    except InvalidInterest as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=f"지원하지 않는 관심사입니다: {exc} (가능: {', '.join(INTEREST_CATEGORIES)})",
        )
    onboarding_service.save_interests(db, principal.id, interests)
    return onboarding_service.status_payload(db, _me(principal))


@router.get("/courses/categories")
def course_categories(
    only_with_courses: bool = Query(default=False),
    principal: Principal = Depends(require_student),
    db: Session = Depends(get_db),
):
    """코스 카테고리 조회 — 관심사 선택 화면과 카탈로그 필터가 함께 쓰는 목록.

    기본은 6과목 전부(코스 0개인 과목 포함). only_with_courses=true면 지금 볼 코스가
    있는 과목만 — 카탈로그 필터처럼 빈 칸을 보여 주면 안 되는 화면용이다."""
    selected = onboarding_service.student_interests(db, principal.id)
    return onboarding_service.category_rows(db, selected, only_with_courses=only_with_courses)


@router.get("/courses/recommended")
def recommended_courses(
    limit: int = Query(default=RECOMMEND_DEFAULT_LIMIT, ge=1, le=RECOMMEND_MAX_LIMIT),
    include_enrolled: bool = Query(default=False),
    principal: Principal = Depends(require_student),
    db: Session = Depends(get_db),
):
    """관심사 기반 추천 코스 — 관심사 우선순위 → 인기순 정렬.

    이미 신청한 코스는 기본으로 제외한다(내 코스에 이미 있다). 관심사가 없거나 매칭되는
    코스가 없으면 전체 인기순으로 폴백하고 응답의 fallback=true로 알린다."""
    return onboarding_service.recommend_courses(
        db, principal.id, limit=limit, include_enrolled=include_enrolled
    )
