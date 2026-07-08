# Backend — Forest Village CAPTCHA API

FastAPI 서버. 캡차 문제 생성/검증 + 로그인 실패 기반 captcha 요구를 담당합니다.

## 실행

```bash
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- 서버: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

## 파일

| 파일 | 역할 |
|------|------|
| `main.py` | FastAPI 앱, 엔드포인트, CORS, mock 유저, `/target` 이미지 서빙 |
| `models.py` | Pydantic 요청/응답 모델 (정답 필드는 응답에 **없음**) |
| `captcha_service.py` | 캡차 로직 + `Store` 저장소 추상화(`InMemoryStore`) |

## 엔드포인트

- `POST /api/captcha/challenge` — 새 문제(정답 미노출)
- `GET  /api/captcha/{id}/target` — 목표 포즈 이미지(불투명, 방향 index 미노출)
- `POST /api/captcha/verify` — 검증, 성공 시 `captcha_token`
- `POST /api/auth/login` — mock 로그인, 5회 실패 후 `captcha_required`
- `GET  /api/health` — 헬스체크

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `CAPTCHA_ALLOWED_ORIGINS` | `http://localhost:5500,http://127.0.0.1:5500` | CORS 허용 origin (콤마 구분) |
| `CAPTCHA_ASSETS_DIR` | `../frontend/assets/animals` | 동물 프레임 PNG 경로 (`/target` 서빙용) |

## 저장소 교체 (In-Memory → Redis/DB)

`captcha_service.py` 의 `Store` 인터페이스를 구현한 클래스를 만들고
`main.py` 에서 `CaptchaService(store=RedisStore())` 로 주입하면 됩니다.
다른 코드는 수정할 필요가 없습니다.

## 빠른 테스트 (curl)

```bash
# 1) 문제 생성
curl -s -X POST localhost:8000/api/captcha/challenge | python3 -m json.tool

# 2) 검증 (오답 예시)
curl -s -X POST localhost:8000/api/captcha/verify \
  -H 'Content-Type: application/json' \
  -d '{"challenge_id":"<id>","selected_object":"tree","selected_direction":0}'

# 3) 로그인 5회 실패 → captcha_required
for i in 1 2 3 4 5; do
  curl -s -X POST localhost:8000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"account":"a@b.com","password":"wrong"}'; echo
done
```
