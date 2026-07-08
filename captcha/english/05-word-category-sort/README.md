# ⑤ Word Category Sort CAPTCHA 🐱📦

영어 단어를 **주제(카테고리) 상자에 드래그해 분류하는** 어린이 교육용 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
05-word-category-sort/
├── package.json / .env.example   # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js                 # 포트 4400
│   ├── db/pool.js  (★ DB 비번), db/schema.sql (sort_session/attempt)
│   ├── data/questions.js         # 5단계 × 5문제 + 단어/이모지 맵
│   └── routes/captcha.js
└── frontend/
    ├── index.html
    └── widget/catchap-word-category-sort.{js,css}
```

## 5단계 구성

| 단계 | 유형 | 방식 | 화면 문구 |
| --- | --- | --- | --- |
| 1단계 | 한 카테고리 1개 | 카테고리 단어 1개를 상자에 | 동물 단어를 찾아 상자에 넣어보세요. |
| 2단계 | 한 카테고리 여러 개 | 조건에 맞는 단어 모두 | 같은 주제의 단어를 모두 찾아 상자에 넣어보세요. |
| 3단계 | 두 카테고리 분류 | 두 상자에 나눠 담기 | 단어를 알맞은 주제 상자에 넣어보세요. |
| 4단계 | 세 카테고리 분류 | 세 상자에 분류 | 각 단어가 어울리는 상자에 넣어보세요. |
| 5단계 | 방해 단어 제외 | 맞는 단어만 분류, 방해 단어는 남김 | 알맞은 단어만 골라 주제 상자에 넣어보세요. |

카테고리: 동물 / 과일 / 학용품, 방해 단어: 색깔(red/blue/green), 감정(happy).

## 조작
- 단어 칩을 상자로 **드래그**(마우스·터치)하거나, **탭 → 상자 탭**으로 분류.
- 상자 안 단어를 다시 트레이(단어 꾸러미)로 되돌릴 수 있고, `다시 담기` 로 초기화.
- 5단계에서는 방해 단어를 상자에 넣으면 실패 → 트레이에 남겨야 함.

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:4400
```
정답 매핑(word→category)은 서버에만 있고 프론트로는 단어+이모지만 내려갑니다. 채점은 전부 서버.
01~04 캡챠와 같은 `catchap_captcha` DB 를 공유하며 테이블은 `sort_` 로 분리됩니다.

## 채점
- 각 단어의 선택 상자를 정답 매핑과 비교.
- 통과: 올바르게 분류한 비율 ≥ 80% **그리고** 방해 단어를 하나도 넣지 않음.
- 단계별 5문제 중 4문제, 전체 25문제 중 20문제 (`questions.js` 에서 조정).

## 수집 데이터 (sort_attempt)
`categories_json`, `word_category_map_json`, `selected_category_map_json`,
`correct_words_json`, `selected_words_json`, `missed_correct_words_json`, `wrong_selected_words_json`, `distractor_words_json`,
`correct_sort_count`, `wrong_category_count`, `distractor_selected_count`, `missed_correct_count`,
`category_switch_count`, `regrab_count`, `drag_order_json`, `selection_order_json`, `solve_time_ms`.
