# ① 교통안전 CAPTCHA 🐱🚸

교통 상황에서 **안전한 행동·경로·순서**를 고르는 어린이 생활안전 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
01-traffic-safety/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (프론트 서빙 + API, 포트 4700)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # 테이블 정의 (traffic_session / traffic_attempt)
│   ├── data/
│   │   └── questions.js  # 5단계 × 5문제 문제 은행
│   └── routes/
│       └── captcha.js    # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 스크린샷과 동일한 데모 화면 (핑크 생활 테마)
    └── widget/
        ├── catchap-safety.js   # 마운트형 위젯 (선택/순서/연결 공통 엔진)
        └── catchap-safety.css
```

## 단계 구성

| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 선택(single) | 안전한 교통 행동 고르기 |
| 2 | 선택(single) | 위험한 행동 찾기 |
| 3 | 선택(single) | 안전하게 있어야 할 위치 고르기 |
| 4 | 순서(order) | 길 건너기 행동 순서 배열 |
| 5 | 선택(single) | 복합 상황에서 가장 안전한 행동 판단 |

## 실행 방법

### 1. DB 비밀번호 설정
```bash
cp .env.example .env
```
`.env` 파일을 열어 **본인 MySQL 비밀번호**를 입력합니다.
```env
DB_PASSWORD=여기에_DB_비밀번호_입력    # ★★★ 여기 ★★★
```
> `.env` 없이 `backend/db/pool.js` 의 `DEFAULTS.password` 에 직접 넣어도 됩니다(비추천).

### 2. 설치 & 실행
```bash
npm install
npm start          # 개발 중 자동 재시작: npm run dev
```
- MySQL 이 켜져 있으면 서버가 뜰 때 `catchap_life` DB와 테이블이 **자동 생성**됩니다.
- MySQL 이 없어도 **메모리 폴백**으로 데모/채점이 그대로 동작합니다.
- 브라우저에서 **http://localhost:4700** 접속 → 캡챠 데모 확인.

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/api/traffic-safety/start` | 세션 시작 → 문제 25개(정답 제거) 반환 |
| POST | `/api/traffic-safety/attempt` | 문제 1개 제출 → 채점 + 행동데이터 저장 |
| POST | `/api/traffic-safety/verify` | 세션 종료 → 통과/실패 판정 + 토큰 발급 |
| GET | `/api/traffic-safety/token/:token` | 발급 토큰 유효성 확인 |
| GET | `/api/traffic-safety/health` | 헬스체크 |

정답은 서버(`data/questions.js`)에만 있고 프론트로 내려가지 않습니다(`sanitizeQuestion`). 채점은 전부 서버에서 합니다.

## 통과 기준
- 단계별: 5문제 중 **4문제 이상** 정답 (`STAGE_PASS_THRESHOLD`)
- 전체: 25문제 중 **20문제 이상** 정답 (`TOTAL_PASS_THRESHOLD`)

## 위젯을 다른 페이지에 붙이기
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>
  CatChapSafety.mount('#captcha-mount', {
    apiBase: 'http://localhost:4700/api/traffic-safety',
    onPass: (r) => console.log('통과 토큰:', r.token),
    onFail: (r) => console.log('실패', r),
  });
</script>
```
