"""온보딩(관심사) 요청 스키마."""

from pydantic import BaseModel, Field

# 관심사 최대 개수 — 카테고리 정본이 6과목(EDU_SUBJECTS)이라 전부 골라도 6개다.
# 값 자체의 유효성(6과목 소속·중복 정리)은 서비스에서 400으로 돌려준다.
MAX_INTERESTS = 6


class InterestsUpdate(BaseModel):
    """관심사 저장 — 배열 순서가 곧 선호 우선순위다.

    빈 배열은 '건너뛰기'로 받는다(온보딩은 완료 처리, 추천은 인기순 폴백)."""

    interests: list[str] = Field(default_factory=list, max_length=MAX_INTERESTS)
