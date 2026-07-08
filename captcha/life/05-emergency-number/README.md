# ⑤ 긴급 전화번호 CAPTCHA 🐱📞 (드래그형)

상황 카드를 **112·119 상자로 분류 드래그**하며 긴급 번호를 배우는 어린이 생활안전 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
05-emergency-number/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (포트 5200)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # 테이블 정의 (emergency_session / emergency_attempt)
│   ├── data/questions.js # 5단계 × 5문제 문제 은행 (sort/pick)
│   └── routes/captcha.js # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 데모 화면 (핑크 생활 테마)
    └── widget/           # catchap-safety.js / .css (드래그 공통 엔진)
```

## 단계 구성 (전부 드래그)

| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 분류 드래그(sort) | 상황 카드를 112/119/114 상자로 |
| 2 | 분류 드래그(sort) | 여러 상황을 112/119로 나눠 담기 |
| 3 | 분류 드래그(sort) | 상황 카드들을 112/119로 모두 분류 |
| 4 | 분류 드래그(sort) | '필요해요/필요없어요'로 나눠 담기 (장난전화 구분) |
| 5 | 드래그 담기(pick) | 복합 상황에서 알맞은 대처 카드 담기 |

## 실행 방법
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5200
```
MySQL 이 없어도 **메모리 폴백**으로 데모/채점이 동작합니다.

## API 프리픽스
`/api/emergency-number` · `start` / `attempt` / `verify` / `token/:token` / `health`

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>
  CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5200/api/emergency-number' });
</script>
```
