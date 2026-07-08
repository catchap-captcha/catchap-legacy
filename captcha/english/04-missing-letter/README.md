# ④ Missing Letter CAPTCHA 🐱🔤

빠진 알파벳을 채워 **영어 단어를 완성하는** 어린이 교육용 캡챠.
**5단계 × 5문제 = 총 25문제.**

```
04-missing-letter/
├── package.json / .env.example   # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js                 # 포트 4300
│   ├── db/pool.js  (★ DB 비번), db/schema.sql (missing_session/attempt)
│   ├── data/questions.js         # 5단계 × 5문제
│   └── routes/captcha.js
└── frontend/
    ├── index.html
    └── widget/catchap-missing-letter.{js,css}
```

## 5단계 구성

| 단계 | 유형 | 방식 | 화면 문구 |
| --- | --- | --- | --- |
| 1단계 | 그림 힌트 + 쉬운 빈칸 | 그림 보고 빠진 알파벳 1개 (보기 2개) | 그림을 보고 빠진 알파벳을 골라보세요. |
| 2단계 | 보기 수 증가 | 보기 4개 중 빠진 알파벳 선택 | 빠진 알파벳을 찾아 단어를 완성해보세요. |
| 3단계 | 첫·끝 글자 채우기 | 단어의 처음/끝 알파벳 선택 | 단어의 처음이나 끝에 들어갈 알파벳을 골라보세요. |
| 4단계 | 여러 빈칸 채우기 | 빠진 알파벳 2개+ 순서대로 | 빠진 알파벳들을 순서대로 넣어 단어를 완성해보세요. |
| 5단계 | 힌트 약화 완성 | 그림 없이 카테고리 힌트로 완성 | 힌트를 보고 빠진 알파벳을 채워 단어를 완성해보세요. |

## 조작
- 보기 알파벳을 탭하면 **왼쪽 빈칸부터 자동으로** 채워집니다.
- 채워진 빈칸을 탭하면 지워지고, 빈칸을 탭하면 그 칸이 활성화됩니다.
- `지우기` 로 전체 초기화(재시도 카운트), 모든 빈칸이 차면 제출 가능.

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:4300
```
정답 단어는 서버에만 있고 프론트로는 빈칸 마스크(`masked`)만 내려갑니다. 채점은 전부 서버.
01~03 캡챠와 같은 `catchap_captcha` DB 를 공유하며 테이블은 `missing_` 로 분리됩니다.

## 수집 데이터 (missing_attempt)
`target_word`, `target_letter`, `blank_position`, `selected_letter`, `wrong_letters_json`,
`hovered_letters_json`, `first_select_time_ms`, `solve_time_ms`, `wrong_attempt_count`, `retry_count`,
`confused_letter_type`(3단계), `blank_positions_json`·`target_letters_json`·`selected_letters_json`·`letter_order_json`·`wrong_order_count`(4단계), `target_category`·`category_hint_used`(5단계).

## 통과 기준
단계별 5문제 중 4문제, 전체 25문제 중 20문제 (`questions.js` 에서 조정).
