# ⑪ Flag Puzzle CAPTCHA 🐱🌍 (실제 이미지 퍼즐)

**실제 국기 사진(SVG)** 을 격자로 잘라, 아이가 **한글 국가명을 보고 조각을 드래그해 국기를 완성**하는
생활·세계문화 교육 캡챠. **5단계 × 5문제 = 총 25문제.**

다른 캡챠들과 달리 이모지가 아닌 **실제 이미지 데이터셋**(country-flags, 264개국 SVG)을 사용한다.
수집되는 조각 배치·드래그 궤적·방해 조각 선택 데이터는 추후 **모델 학습용 데이터셋**으로 쓸 수 있다.

```
11-flag-puzzle/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (포트 5800)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # flag_session / flag_attempt
│   ├── data/questions.js # 5단계 × 5문제 (국기·격자·방해조각 정의)
│   └── routes/captcha.js # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 데모 화면 (핑크 테마)
    ├── flags/            # ★ 실제 국기 SVG 20개국 (kr, jp, fr, us, ...)
    └── widget/           # catchap-safety.js / .css (puzzle 유형 포함 공통 엔진)
```

## 랜덤 문제 생성 (매 판 다름)

`/start` 를 호출할 때마다 `backend/data/questions.js` 의 `generateQuestionSet()` 이
**단계별 국가 풀(9~12개국)에서 5개국을 랜덤 추출**해 25문제를 새로 만든다.
- 국가 구성·출제 순서가 판마다 다름
- 방해 조각도 매번 **랜덤한 다른 나라** 국기에서 잘라옴
- 2단계의 빈칸 위치도 랜덤
- **조각 id 도 문제마다 섞어 배정** → id 규칙(`s0→p0`)이나 타 세션 정답 재사용으로 통과 불가
- 생성된 문제·정답은 세션별로 서버에만 보관되어 채점에 사용됨 (서버 재시작 시 세션 만료 → 410)

> 개발 편의용으로 `CAPTCHA_DEBUG=1` 환경변수를 켜면 `/start` 응답에 정답이 포함된다. **운영에선 켜지 말 것.**

## 동작 방식 (이미지 퍼즐)

- 국기 이미지를 `cols × rows` 격자로 나눠, 각 조각을 **CSS 크롭**(background-size/position)으로 렌더링.
- 화면 위에 **한글 국가명**(예: "한국")이 항상 표시되고, 아이는 섞인 조각을 퍼즐판 칸에 드래그.
- 방해 조각은 **다른 나라 국기에서 잘라 온 진짜 조각**이라 색·모양 구분 능력을 요구.
- 정답 배치(`answers = { slot: piece }`)는 서버에만 있고, 채점도 전부 서버에서 한다.
- 완성 시: **"정답이에요! 한국 국기를 완성했어요."**

## 단계 구성

| 단계 | 방식 | 격자 | 방해 조각 | 미리보기 |
| --- | --- | --- | --- | --- |
| 1 | 2조각 퍼즐 | 2×1 / 1×2 | 없음 | 있음 |
| 2 | 빠진 조각 넣기 | 2×2 (3칸 채움) | 3개 | 있음 |
| 3 | 4조각 퍼즐 | 2×2 | 없음 | 있음 |
| 4 | 방해 조각 포함 | 2×2 | 2개 | 있음 |
| 5 | 복합 퍼즐 | 3×2 (6조각) | 2개 | **없음** |

| 난이도 | 국가 |
| --- | --- |
| 쉬움 | 일본, 프랑스, 이탈리아, 독일, 네덜란드, 스페인 |
| 보통 | 한국, 캐나다, 미국, 브라질, 중국 |
| 어려움 | 영국, 호주 (+방해: 그리스, 튀르키예, 스웨덴, 스위스, 인도, 멕시코, 남아공) |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5800
```
API: `/api/flag-puzzle` · 테이블 `flag_session` / `flag_attempt` · DB 없이 메모리 폴백 동작.

## 수집되는 행동 데이터 (flag_attempt)
`target_country_code`, `target_country_name_ko`, `piece_count`,
`placements_json`(조각 배치), `selection_order_json`(어떤 조각부터 놓았는지),
`drag_path_json`(드래그 궤적), `drop 정확도 관련: wrong_placement_count`,
`distractor_selected_count`(방해 조각 선택), `missed_piece_count`, `swap_count`,
`regrab_count`, `completion_rate`, `solve_time_ms`, `is_correct` 등 — 스펙의 분석 항목 전체.

## 국기 이미지 추가/교체
`frontend/flags/` 에 SVG 를 넣고 `backend/data/questions.js` 에서
`gridPuzzle('국가코드', cols, rows)` 로 문제를 만들면 된다.
원본 데이터셋: `캣챱 문서/국기 이미지/country-flags-main` (264개국 SVG).

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5800/api/flag-puzzle' });</script>
```
