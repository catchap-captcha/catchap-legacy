# 🌳 어린이 숲속 마을 캡차 (Forest Village CAPTCHA)

3D 숲속 마을에서 **숨어 있는 동물을 찾아 같은 방향으로 돌려 맞추는** 아이 친화적 CAPTCHA 프로토타입입니다.
원래 [Claude Design](https://claude.ai/design) Canvas 로 만든 단일 HTML 프로토타입을,
**프론트엔드 / 백엔드를 분리**하고 **API 로 정답을 생성·검증**하도록 리팩토링했습니다.

> 팀 프로젝트용 프로토타입입니다. 운영 수준의 완전한 보안 구현은 아니지만,
> 실서비스로 확장할 수 있도록 구조를 설계했습니다.

---

## ✨ 주요 기능

- Three.js 기반 3D 숲속 마을 배경 (나무 / 집 / 버섯집)
- 오브젝트 클릭 → 확대(줌인) → 뒤에서 동물이 빼꼼
- 동물 5종 랜덤 등장: 강아지 · 토끼 · 닭 · 판다 · 카피바라
- 좌/우 버튼으로 8방향 회전, 확인 버튼으로 제출
- 오답 시 문제 폐기 후 자동으로 새 문제
- 성공 시 성공 화면 + `captcha_token` 발급
- 로그인 5회 실패 후 `captcha_required` 를 반환하는 mock 로그인

---

## 🧱 기술 스택

| 영역 | 스택 |
|------|------|
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Frontend | HTML, CSS, JavaScript, Three.js (r128) |
| 통신 | `fetch` (JSON) |
| 저장소 | 1차: In-Memory (dict) · 확장: Redis / DB |

---

## 📁 폴더 구조

```
captcha-project/
├── backend/
│   ├── main.py               # FastAPI 앱 · 엔드포인트 · CORS
│   ├── models.py             # Pydantic 요청/응답 모델
│   ├── captcha_service.py    # 캡차 로직 + 저장소 추상화(Store)
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js            # fetch 래퍼 (서버 URL 을 아는 유일한 곳)
│   │   ├── captcha.js        # Three.js 씬 엔진 (정답을 모름)
│   │   └── app.js            # 흐름 제어 (API ↔ 엔진 ↔ DOM)
│   └── assets/animals/
│       ├── dog/  rabbit/  chicken/  panda/  capybara/   # dir0.png ~ dir7.png
│
├── README.md
├── .gitignore
└── package-notes.md
```

---

## 🚀 실행 방법

### 1) 백엔드

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- API 서버: http://localhost:8000
- 문서(Swagger): http://localhost:8000/docs

### 2) 프론트엔드 (정적 서버)

```bash
cd frontend
python3 -m http.server 5500
```

- 브라우저: http://localhost:5500

> ⚠️ `index.html` 을 파일(`file://`)로 바로 열면 CORS / 이미지 로딩이 막힙니다.
> 반드시 정적 서버(:5500)로 띄워 주세요.

---

## 🔌 API 설명

### `POST /api/captcha/challenge`
새 캡차 문제를 생성합니다. **정답은 응답에 포함되지 않습니다.**

```jsonc
// 응답
{
  "challenge_id": "uuid",
  "animal": "rabbit",
  "objects": ["tree", "house", "mushroom"],
  "start_direction": 3,     // 초기 방향(정답 아님)
  "expires_in": 120
}
```

### `GET /api/captcha/{challenge_id}/target`
찾아야 할 동물의 **목표 포즈 이미지(불투명 리소스)** 를 PNG 로 반환합니다.
사람은 이 그림을 보고 방향을 맞추지만, **방향 숫자(index)는 URL/응답 어디에도 노출되지 않습니다.**
→ 사용자가 원하는 “서버에서 이미지 합성 / 리소스 토큰” 구조의 프로토타입 구현입니다.

### `POST /api/captcha/verify`
사용자의 답을 서버에 저장된 정답과 비교합니다. **성공/실패와 무관하게 challenge 는 1회용으로 폐기됩니다.**

```jsonc
// 요청
{ "challenge_id": "uuid", "selected_object": "house", "selected_direction": 5 }

// 성공
{ "success": true, "captcha_token": "temporary-token" }

// 오답
{ "success": false, "message": "new_challenge_required" }
```

### `POST /api/auth/login`
회원 DB 없는 mock 로그인. `account` 기준으로 실패 횟수를 세고, **5회 이상 실패하면 `captcha_required: true`**.
그 이후에는 유효한 `captcha_token` 이 있어야 로그인 시도가 가능합니다.

```jsonc
// 요청
{ "account": "test@example.com", "password": "x", "captcha_token": null }

// 5회 실패 후
{ "success": false, "captcha_required": true, "failed_attempts": 5, "message": "captcha_required" }
```

테스트용 계정: `test@example.com / password123`, `child@forest.kr / 1234`

---

## 🔐 보안 설계 요약

| 항목 | 구현 |
|------|------|
| 정답을 프론트에 두지 않음 | 정답은 서버 `ChallengeRecord` 에만 저장, 응답 모델에 없음 |
| challenge_id | UUID4 |
| 1회성 challenge | verify 시 성공/실패 무관하게 삭제 |
| 만료 시간 | 기본 120초 (`CHALLENGE_TTL_SECONDS`, 60~120초 권장) |
| 오답 시 폐기 | verify 에서 즉시 삭제 → 재사용 불가 |
| 성공 시 토큰 | `captcha_token` 발급 (짧은 TTL, 1회용) |
| captcha_token 수명 | 기본 120초 (`CAPTCHA_TOKEN_TTL_SECONDS`) |
| 로그인 실패 관리 | `account_key` 기준 카운트, 5회 → captcha_required |
| 방향 정답 노출 방지 | 목표 포즈를 불투명 이미지(`/target`)로만 전달 |

**추후 확장 지점 (코드 주석에 표시):**
- `Store` 인터페이스만 구현하면 In-Memory → **Redis / DB** 로 교체 가능
- `account_key` 에 **IP / 디바이스 지문** 결합 가능 (`f"{account}|{ip}"`)
- `/target` 을 **서명·만료 URL** 또는 **서버 사이드 씬 합성**으로 강화 가능
- 오브젝트 정답도 서버에서 “빼꼼(peek)” 응답으로 게이팅 가능

---

## 🧭 8방향 정의

```
0 정면   1 왼쪽 앞 대각선   2 왼쪽   3 왼쪽 뒤 대각선
4 뒤     5 오른쪽 뒤 대각선 6 오른쪽 7 오른쪽 앞 대각선
```

동물 에셋은 **개별 PNG(`dir0~7.png`)** 와 **스프라이트 시트** 를 모두 지원합니다
(`frontend/js/captcha.js` 의 `ANIMALS` 설정 + `frameMap`). 예:

```js
rabbit: { id:'rabbit', name:'토끼', type:'spritesheet',
          path:'assets/animals/rabbit/sheet.png', columns:4, rows:2,
          frameMap:[0,1,2,3,4,5,6,7] }
```

---

## 🛠️ 추후 개선 사항

- [ ] In-Memory → Redis(challenge/token TTL) 이전
- [ ] `/target` 서명 URL + 오브젝트 정답 서버 게이팅
- [ ] 서버 사이드 씬 합성(봇이 이미지 인덱스를 읽지 못하게)
- [ ] Rate limiting / IP·디바이스 기반 위험도 점수
- [ ] 실제 회원 DB + 비밀번호 해싱, JWT 세션
- [ ] 접근성(키보드 조작, 스크린리더), 다국어

---

## 📦 GitHub 업로드 방법

`package-notes.md` 참고. 요약:

```bash
cd captcha-project
git init
git add .
git commit -m "feat: forest village captcha (frontend/backend split, API-based verify)"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
