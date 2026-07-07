# ② 화재안전 CAPTCHA 🐱🔥

화재 상황에서 **올바른 행동과 이유를 연결**하고 **대피 순서**를 배우는 어린이 생활안전 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
02-fire-safety/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (포트 4800)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # 테이블 정의 (fire_session / fire_attempt)
│   ├── data/questions.js # 5단계 × 5문제 문제 은행
│   └── routes/captcha.js # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 데모 화면 (핑크 생활 테마)
    └── widget/           # catchap-safety.js / .css (공통 엔진)
```

## 단계 구성

| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 선택(single) | 불이 났을 때 할 안전 행동 고르기 |
| 2 | 선택(single) | 하면 안 되는 위험 행동 찾기 |
| 3 | 연결(connect) | 행동 ↔ 이유 선으로 연결 |
| 4 | 순서(order) | 화재 대피 순서 배열 |
| 5 | 선택(single) | 상황별 안전한 대처 판단 |

## 실행 방법
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:4800
```
MySQL 이 없어도 **메모리 폴백**으로 데모/채점이 동작합니다.

## API 프리픽스
`/api/fire-safety` · `start` / `attempt` / `verify` / `token/:token` / `health`

## 통과 기준
- 단계별 4/5 이상, 전체 20/25 이상.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>
  CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:4800/api/fire-safety' });
</script>
```
