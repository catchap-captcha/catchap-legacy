"""학생 온보딩 — 상태 조회·관심사 저장·코스 카테고리·관심사 기반 추천.

검증 규약:
- 관심사 배열 순서 = 선호 우선순위(추천 정렬이 이 순서를 그대로 쓴다).
- 빈 배열 저장은 '건너뛰기' — 온보딩은 완료 처리되고 추천은 인기순으로 폴백한다.
- 카테고리/추천의 코스 가시성은 학생용 코스 목록(GET /courses)과 같다:
  활성 코스 + 활성 강의 1개 이상. 빈 코스는 어느 쪽에도 안 나온다.
"""

from tests.test_captcha_api import _instructor, auth
from tests.test_courses import _create_course
from tests.test_lectures import _student_token, _upload_lecture, media_dir  # noqa: F401 (fixture 재사용)


def _course_with_lecture(client, tok, *, title, subject):
    """추천·카테고리에 노출되는 코스 = 활성 강의가 담긴 코스."""
    course = _create_course(client, tok, title=title, subject=subject)
    r = _upload_lecture(client, tok, title=f"{title} 1강", subject=subject, course_id=course["id"])
    assert r.status_code == 200, r.text
    return course


def test_onboarding_status_before_and_after_interests(client, db, seed_org):
    tok = _student_token(client, seed_org)

    r = client.get("/api/v1/students/me/onboarding", headers=auth(tok))
    assert r.status_code == 200, r.text
    before = r.json()
    assert before["completed"] is False and before["completed_at"] is None
    assert before["interests"] == [] and before["next_step"] == "interests"
    assert before["categories"] == ["국어", "영어", "수학", "과학", "사회", "생활"]
    assert before["student"]["nickname"] == "테스트학생"

    # 저장 응답이 곧 갱신된 상태 — 프론트가 다시 조회할 필요가 없다
    r = client.post(
        "/api/v1/students/me/interests",
        json={"interests": ["수학", "과학", "수학"]},  # 중복은 서버가 정리
        headers=auth(tok),
    )
    assert r.status_code == 200, r.text
    after = r.json()
    assert after["interests"] == ["수학", "과학"] and after["interest_count"] == 2
    assert after["completed"] is True and after["completed_at"]
    # 관심사 단계는 끝났고, 아직 수강신청 전이라 다음 단계는 첫 코스
    assert after["next_step"] == "first_course"
    assert [s["done"] for s in after["steps"]] == [True, False]

    # 재조회해도 같은 상태(저장이 실제로 남는다)
    assert client.get("/api/v1/students/me/onboarding", headers=auth(tok)).json() == after


def test_interests_reorder_keeps_first_completed_at_and_rejects_unknown(client, db, seed_org):
    """설정에서 관심사를 고쳐도 '온보딩 통과 시각'은 그대로. 6과목 밖 값은 400."""
    tok = _student_token(client, seed_org)
    first = client.post(
        "/api/v1/students/me/interests", json={"interests": ["수학"]}, headers=auth(tok)
    ).json()

    again = client.post(
        "/api/v1/students/me/interests", json={"interests": ["과학", "수학"]}, headers=auth(tok)
    ).json()
    assert again["interests"] == ["과학", "수학"]
    assert again["completed_at"] == first["completed_at"]

    r = client.post(
        "/api/v1/students/me/interests", json={"interests": ["체육"]}, headers=auth(tok)
    )
    assert r.status_code == 400 and "체육" in r.json()["detail"]
    # 거절된 요청이 기존 관심사를 덮어쓰지 않는다
    assert client.get("/api/v1/students/me/onboarding", headers=auth(tok)).json()["interests"] == [
        "과학", "수학",
    ]

    # 6개 초과는 스키마에서 거절(422) — 카테고리가 6과목뿐이다
    assert client.post(
        "/api/v1/students/me/interests",
        json={"interests": ["국어", "영어", "수학", "과학", "사회", "생활", "국어"]},
        headers=auth(tok),
    ).status_code == 422


def test_interests_empty_means_skipped(client, db, seed_org):
    """건너뛰기 = 빈 배열 저장. 온보딩은 완료(재노출 안 함)지만 추천은 폴백으로 흐른다."""
    tok = _student_token(client, seed_org)
    r = client.post("/api/v1/students/me/interests", json={"interests": []}, headers=auth(tok))
    assert r.status_code == 200
    assert r.json()["completed"] is True and r.json()["interests"] == []


def test_course_categories_counts_and_selection(client, db, seed_org, media_dir):
    """6과목 고정 + 과목별 코스·강의 수. 강의 없는 코스는 세지 않는다."""
    itok = _instructor(client, db)
    _course_with_lecture(client, itok, title="수학 기초반", subject="수학")
    _create_course(client, itok, title="빈 과학 코스", subject="과학")  # 강의 0 → 미노출

    tok = _student_token(client, seed_org)
    rows = client.get("/api/v1/courses/categories", headers=auth(tok)).json()
    assert [r["key"] for r in rows] == ["국어", "영어", "수학", "과학", "사회", "생활"]
    by_key = {r["key"]: r for r in rows}
    assert by_key["수학"]["course_count"] == 1 and by_key["수학"]["lecture_count"] == 1
    assert by_key["수학"]["free_course_count"] == 1  # 기본 생성 코스는 무료(price=0)
    assert by_key["과학"]["course_count"] == 0  # 빈 코스는 학생 화면 규칙대로 제외
    assert by_key["수학"]["color"] and by_key["수학"]["icon"]  # 화면용 메타 동봉
    assert all(r["selected"] is False for r in rows)

    client.post("/api/v1/students/me/interests", json={"interests": ["수학"]}, headers=auth(tok))
    rows = client.get("/api/v1/courses/categories", headers=auth(tok)).json()
    assert {r["key"] for r in rows if r["selected"]} == {"수학"}

    # only_with_courses=true 는 지금 볼 코스가 있는 과목만(카탈로그 필터용)
    only = client.get(
        "/api/v1/courses/categories", params={"only_with_courses": True}, headers=auth(tok)
    ).json()
    assert [r["key"] for r in only] == ["수학"]


def test_recommended_courses_follow_interest_priority(client, db, seed_org, media_dir):
    """추천 정렬은 관심사 우선순위 우선 — 먼저 고른 과목의 코스가 위로 온다."""
    itok = _instructor(client, db)
    math = _course_with_lecture(client, itok, title="수학 기초반", subject="수학")
    social = _course_with_lecture(client, itok, title="사회 기초반", subject="사회")
    _course_with_lecture(client, itok, title="국어 기초반", subject="국어")  # 관심사 밖

    tok = _student_token(client, seed_org)
    client.post(
        "/api/v1/students/me/interests", json={"interests": ["사회", "수학"]}, headers=auth(tok)
    )
    body = client.get("/api/v1/courses/recommended", headers=auth(tok)).json()
    assert body["fallback"] is False and body["interests"] == ["사회", "수학"]
    assert [i["id"] for i in body["items"]] == [social["id"], math["id"]]  # 관심사 밖 코스는 제외
    top = body["items"][0]
    assert top["reason"]["kind"] == "interest" and top["reason"]["subject"] == "사회"
    assert top["lecture_count"] == 1 and top["instructor_name"] == "강사"
    assert top["pricing"]["is_free"] is True and top["enrolled"] is False

    # 관심사 순서를 뒤집으면 추천 순서도 뒤집힌다
    client.post(
        "/api/v1/students/me/interests", json={"interests": ["수학", "사회"]}, headers=auth(tok)
    )
    body = client.get("/api/v1/courses/recommended", headers=auth(tok)).json()
    assert [i["id"] for i in body["items"]] == [math["id"], social["id"]]

    assert len(client.get(
        "/api/v1/courses/recommended", params={"limit": 1}, headers=auth(tok)
    ).json()["items"]) == 1


def test_recommended_excludes_enrolled_and_falls_back_to_popular(client, db, seed_org, media_dir):
    """신청한 코스는 추천에서 빠지고, 관심사 매칭이 0건이면 전체 인기순 폴백."""
    itok = _instructor(client, db)
    math = _course_with_lecture(client, itok, title="수학 기초반", subject="수학")
    science = _course_with_lecture(client, itok, title="과학 기초반", subject="과학")

    tok = _student_token(client, seed_org)
    # 관심사 미선택 → 폴백(인기순). 아직 수강생이 없어 둘 다 0명이다.
    body = client.get("/api/v1/courses/recommended", headers=auth(tok)).json()
    assert body["fallback"] is True and body["interests"] == []
    assert {i["id"] for i in body["items"]} == {math["id"], science["id"]}
    assert body["items"][0]["reason"]["kind"] == "popular"

    assert client.post(f"/api/v1/courses/{math['id']}/enroll", headers=auth(tok)).status_code == 200
    body = client.get("/api/v1/courses/recommended", headers=auth(tok)).json()
    assert [i["id"] for i in body["items"]] == [science["id"]]  # 신청한 코스는 제외

    # include_enrolled=true 면 다시 포함되고, 수강 인원이 많은 코스가 위로
    body = client.get(
        "/api/v1/courses/recommended", params={"include_enrolled": True}, headers=auth(tok)
    ).json()
    assert [i["id"] for i in body["items"]] == [math["id"], science["id"]]
    assert body["items"][0]["enrolled"] is True and body["items"][0]["enrollment_count"] == 1

    # 관심사를 골랐지만 그 과목에 코스가 없으면(사회) 다시 폴백
    client.post("/api/v1/students/me/interests", json={"interests": ["사회"]}, headers=auth(tok))
    body = client.get("/api/v1/courses/recommended", headers=auth(tok)).json()
    assert body["fallback"] is True and [i["id"] for i in body["items"]] == [science["id"]]


def test_onboarding_requires_student_token(client, db, seed_org, media_dir):
    """운영·강사 토큰으로는 접근 불가(학생 전용) — 무인증은 401."""
    itok = _instructor(client, db)
    for path in (
        "/api/v1/students/me/onboarding",
        "/api/v1/courses/categories",
        "/api/v1/courses/recommended",
    ):
        assert client.get(path).status_code == 401
        assert client.get(path, headers=auth(itok)).status_code == 403
    assert client.post(
        "/api/v1/students/me/interests", json={"interests": []}, headers=auth(itok)
    ).status_code == 403
