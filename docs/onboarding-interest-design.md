# 가입 후 온보딩(관심사) · 코스 카테고리 · 추천 코스 — 설계/계약 (2026-07-31)

> **상태: 구현 완료.** 모델 `StudentOnboarding`(+ 마이그레이션 `onboarding_interest_01`) ·
> 서비스 `services/onboarding_service.py` · 라우터 `api/v1/endpoints/onboarding.py` ·
> 테스트 `tests/test_onboarding.py` 7건.
>
> 이름 주의: `docs/onboarding-security-design.md`의 '온보딩'은 **학교 발급 가입코드**(은퇴)다.
> 이 문서의 온보딩은 **이메일 가입 학생의 첫 진입 관심사 선택**으로, 서로 다른 기능이다.

## 1. 흐름

가입 → (온보딩) 관심사 선택 → 관심사 기반 추천 코스 → 첫 수강신청.

프론트는 진입 시 `GET /students/me/onboarding` 하나로 온보딩 화면을 띄울지 정한다
(`completed=false`면 띄운다). 관심사를 저장하면 응답이 곧 갱신된 상태라 재조회가 없다.

## 2. 저장 모델 — `student_onboarding` (학생당 1행)

| 컬럼 | 의미 |
| --- | --- |
| `student_id` | 학생(소프트 참조, unique) — 유니크 인덱스가 조회 인덱스도 겸한다 |
| `interests` | JSON 배열 `["수학","과학"]` — **순서 = 선호 우선순위** |
| `completed_at` | 온보딩 화면 통과 시각. 최초 저장에만 찍고 이후 수정에는 안 바꾼다 |

관심사를 별도 테이블로 쪼개지 않은 이유: 값의 정본이 6과목(`EDU_SUBJECTS`) 고정이라
학생당 최대 6개이고, 읽는 쪽이 언제나 "이 학생의 관심사 전체"라 조인·집계가 없다.
학생 간 관심사 집계(운영 통계)가 필요해지면 그때 정규화 테이블로 승격한다.

**건너뛰기**는 빈 배열 저장이다(`interests=[]` + `completed_at` 채움). 빈 배열은 "아직
안 물어봤다"가 아니라 "물어봤고 안 골랐다"로 읽힌다 — 그래야 온보딩이 재노출되지 않는다.

## 3. 가시성 규칙 (카테고리·추천 공통)

학생에게 보이는 코스 = **활성 코스 + 활성 강의 1개 이상**. 학생용 코스 목록
(`GET /courses`)과 같은 규칙이다 — 다르면 "카테고리에 3개라는데 목록엔 2개"가 된다.

## 4. API 계약

전부 학생 토큰 전용(`require_student`) — 강사·운영자 토큰은 403, 무인증은 401.

### `GET /api/v1/students/me/onboarding` — 온보딩 상태 조회

```jsonc
{
  "completed": false,            // 관심사 단계 통과 여부 = 온보딩 화면 노출 판정 근거
  "completed_at": null,
  "interests": [], "interest_count": 0,
  "categories": ["국어","영어","수학","과학","사회","생활"],  // 선택 가능한 값의 정본
  "enrolled_course_count": 0,
  "steps": [{"key":"interests","title":"관심사 선택","done":false},
            {"key":"first_course","title":"첫 코스 수강신청","done":false}],
  "next_step": "interests",      // 끝나지 않은 첫 단계(전부 끝나면 null)
  "student": {"id":"…","nickname":"하은","grade_band":"kindergarten"}
}
```

### `POST /api/v1/students/me/interests` — 관심사 저장

요청 `{"interests": ["수학","과학"]}` (최대 6개). 응답은 위 상태 payload와 같은 형태.
서버가 공백 정리·중복 제거(첫 등장 순서 유지)를 하고, 6과목 밖의 값은 **400**,
6개 초과는 스키마에서 **422**. 거절된 요청은 기존 관심사를 덮어쓰지 않는다.

### `GET /api/v1/courses/categories` — 코스 카테고리 조회

기본은 6과목 전부(코스 0개인 과목 포함 — 관심사 선택 화면은 6칸이 다 필요하다).
`?only_with_courses=true`면 지금 볼 코스가 있는 과목만(카탈로그 필터용).

```jsonc
[{"key":"수학","label":"수학","color":"#17B08C","soft":"#DFF6EE","icon":"ph-fill ph-plus-minus",
  "course_count":1,"lecture_count":4,"free_course_count":1,"selected":true}]
```

색·아이콘은 `design_data.SUBJECT_META` — 과목 색을 프론트에 중복 정의하지 않는다.

### `GET /api/v1/courses/recommended` — 관심사 기반 추천 코스

`?limit=`(1~50, 기본 10) `?include_enrolled=`(기본 false — 이미 신청한 코스는 내 코스에 있다).

정렬 = **관심사 우선순위 → 수강 인원 많은 순 → 과목 내 order_no → 등록 순**.
관심사가 없거나(건너뛰기) 고른 과목에 코스가 0건이면 **전체 인기순으로 폴백**하고
`fallback=true`로 알린다 — 온보딩 직후 빈 화면을 주지 않기 위해서다. 프론트는 이 값으로
문구를 바꾼다("관심사 기반 추천" ↔ "지금 인기 있는 코스").

```jsonc
{"interests":["사회","수학"], "fallback":false, "total":2,
 "items":[{"id":"…","title":"사회 기초반","subject":"사회","description":null,
           "instructor_name":"강사","lecture_count":1,"enrollment_count":0,"enrolled":false,
           "pricing":{"price":0,"sale_price":null,"sale_ends_at":null,
                      "effective_price":0,"is_free":true},
           "reason":{"kind":"interest","subject":"사회","label":"관심사로 고른 '사회' 코스예요"}}]}
```

`reason.kind`는 `interest` | `popular`. 가격은 `course_pricing.effective_course_price`
단일 정본을 쓴다(할인 만료 반영) — 추천 카드가 결제 화면과 다른 값을 보여 주지 않는다.

## 5. 성능

카테고리·추천 모두 코스 목록 1회 + (강의 수·수강 인원·강사명) 벌크 3회로 끝난다.
코스마다 세면 N+1이라 `active_lecture_counts`·`_enrollment_counts`로 묶었다 —
학생용 코스 목록이 이미 겪은 문제라 같은 방식으로 처음부터 막았다.
