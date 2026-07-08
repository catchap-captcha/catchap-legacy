# ① Word Drag CAPTCHA 🐱🔤

그림을 보고 알맞은 **영어 단어를 드래그**하는 어린이 교육용 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
01-word-drag/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (프론트 서빙 + API)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # 테이블 정의 (행동 데이터 전부 수집)
│   ├── data/
│   │   └── questions.js  # 5단계 × 5문제 문제 은행
│   └── routes/
│       └── captcha.js    # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 스크린샷과 동일한 데모 화면
    └── widget/
        ├── catchap-word-drag.js   # 마운트형 위젯
        └── catchap-word-drag.css
```

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

- MySQL 이 켜져 있으면 서버가 뜰 때 `catchap_captcha` DB와 테이블이 **자동 생성**됩니다.
- 브라우저에서 **http://localhost:4000** 접속 → 캡챠 데모 확인.

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/api/word-drag/start` | 세션 시작 → 문제 25개(정답 제거) 반환 |
| POST | `/api/word-drag/attempt` | 문제 1개 제출 → 채점 + 행동데이터 저장 |
| POST | `/api/word-drag/verify` | 세션 종료 → 통과/실패 판정 + 토큰 발급 |
| GET | `/api/word-drag/token/:token` | 발급 토큰 유효성 확인 |
| GET | `/api/word-drag/health` | 헬스체크 |

정답은 서버(`data/questions.js`)에만 있고 프론트로 내려가지 않습니다 (`sanitizeQuestion`). 채점은 전부 서버에서 합니다.

## 수집되는 행동 데이터 (captcha_attempt 테이블)

`solve_time_ms`, `drag_start_time`, `drag_end_time`, `drag_path_json`, `drag_distance`,
`hover_time_ms`, `selected_word`, `first_selected_word`, `wrong_attempt_count`,
`regrab_count`, `hovered_words_json`, `wrong_word_type`(3단계),
`match_count`/`correct_match_count`/`drag_order_json`/`time_per_match_json`(4단계),
`selected_words_json`/`wrong_category_count`/`missed_correct_count`/`category_understanding_score`(5단계) 등.

## 통과 기준

- 단계별: 5문제 중 **4문제 이상** 정답 (`STAGE_PASS_THRESHOLD`)
- 전체: 25문제 중 **20문제 이상** 정답 (`TOTAL_PASS_THRESHOLD`)

`backend/data/questions.js` 하단에서 조정할 수 있습니다.

## 위젯을 다른 페이지에 붙이기

```html
<link rel="stylesheet" href="widget/catchap-word-drag.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-word-drag.js"></script>
<script>
  CatChapWordDrag.mount('#captcha-mount', {
    apiBase: 'http://localhost:4000/api/word-drag',
    onPass: (r) => console.log('통과 토큰:', r.token),
    onFail: (r) => console.log('실패', r),
  });
</script>
```
