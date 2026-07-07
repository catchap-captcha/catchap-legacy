# ④ 우리집 안전 CAPTCHA 🐱🏠 (드래그형)

집 안에서 **위험한 물건·장소를 찾아 상자로 드래그**하는 어린이 생활안전 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
04-home-safety/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (포트 5100)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # 테이블 정의 (home_session / home_attempt)
│   ├── data/questions.js # 5단계 × 5문제 문제 은행 (pick/sort)
│   └── routes/captcha.js # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 데모 화면 (핑크 생활 테마)
    └── widget/           # catchap-safety.js / .css (드래그 공통 엔진)
```

## 단계 구성 (전부 드래그)

| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 드래그 담기(pick) | 위험한 물건 1개를 상자로 끌어 담기 |
| 2 | 분류 드래그(sort) | 안전/위험 두 상자로 나눠 담기 |
| 3 | 드래그 치우기(pick) | 방 안 위험 물건을 안전 상자로 치우기 |
| 4 | 드래그 담기(pick) | 장소(욕실·부엌·거실…)별 위험한 곳 담기 |
| 5 | 다중 드래그(pick) | 위험한 것을 모두 찾아 담기 |

## 실행 방법
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5100
```
MySQL 이 없어도 **메모리 폴백**으로 데모/채점이 동작합니다.

## API 프리픽스
`/api/home-safety` · `start` / `attempt` / `verify` / `token/:token` / `health`

## 수집되는 행동 데이터 (home_attempt)
`drag_distance`, `drag_path_json`, `regrab_count`, `selection_order_json`,
`selected_items_json`, `wrong_selected_count`, `missed_count`(pick),
`selected_bins_json`, `wrong_sort_count`(sort) 등.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>
  CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5100/api/home-safety' });
</script>
```
