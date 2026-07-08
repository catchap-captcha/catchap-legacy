# ③ 손씻기 위생 CAPTCHA 🐱🧼

**손 씻기 순서를 올바르게 배열**하며 위생 습관을 배우는 어린이 생활안전 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
03-clean-hands/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (포트 4900)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # 테이블 정의 (hands_session / hands_attempt)
│   ├── data/questions.js # 5단계 × 5문제 문제 은행
│   └── routes/captcha.js # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 데모 화면 (핑크 생활 테마)
    └── widget/           # catchap-safety.js / .css (공통 엔진)
```

## 단계 구성

| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 선택(single) | 손 씻는 올바른 행동 고르기 |
| 2 | 순서(order) | 2단계 순서 배열 (물 → 비누) |
| 3 | 순서(order) | 3단계 순서 배열 (물 → 비누 → 헹구기) |
| 4 | 선택(single) | 손 씻기에 안 맞는 행동 제외 |
| 5 | 순서(order) | 전체 5단계 순서 배열 |

## 실행 방법
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:4900
```
MySQL 이 없어도 **메모리 폴백**으로 데모/채점이 동작합니다.

## API 프리픽스
`/api/clean-hands` · `start` / `attempt` / `verify` / `token/:token` / `health`

## 통과 기준
- 단계별 4/5 이상, 전체 20/25 이상.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>
  CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:4900/api/clean-hands' });
</script>
```
