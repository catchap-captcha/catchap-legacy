# ⑥ Word Puzzle CAPTCHA 🐱🧩

섞인 알파벳을 **순서대로 배열해 영어 단어를 완성하는** 어린이 교육용 캡챠.
`Missing Letter`(④)보다 한 단계 어렵게, 철자 순서 인지 + 드래그 행동 데이터를 수집합니다.
**5단계 × 5문제 = 총 25문제.**

```
06-word-puzzle/
├── package.json / .env.example   # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js                 # 포트 4500
│   ├── db/pool.js  (★ DB 비번), db/schema.sql (puzzle_session/attempt)
│   ├── data/questions.js         # 5단계 × 5문제
│   └── routes/captcha.js
└── frontend/
    ├── index.html
    └── widget/catchap-word-puzzle.{js,css}
```

## 5단계 구성

| 단계 | 유형 | 방식 | 화면 문구 |
| --- | --- | --- | --- |
| 1단계 | 그림 + 3글자 | 섞인 알파벳 3개 순서 배열 | 그림을 보고 알파벳을 순서대로 놓아 단어를 완성해보세요. |
| 2단계 | 그림 + 4글자 | 4글자 단어 배열 | 알파벳을 바르게 옮겨 영어 단어를 완성해보세요. |
| 3단계 | 방해 알파벳 포함 | 필요 없는 글자 제외 후 완성 | 필요한 알파벳만 골라 단어를 완성해보세요. |
| 4단계 | 긴 단어 | 5~6글자 단어 배열 | 긴 단어도 차근차근 알파벳을 놓아 완성해보세요. |
| 5단계 | 그림 힌트 약화 | 카테고리 힌트만 보고 완성 | 힌트를 보고 알파벳을 순서대로 놓아 단어를 완성해보세요. |

## 조작
- 알파벳 카드를 정답 칸으로 **드래그**(마우스·터치)하거나, **탭하면 왼쪽 빈 칸부터** 채워집니다.
- 칸에 놓인 카드를 탭하면 트레이로 돌아가고, 다른 카드를 놓으면 자동 교체(swap).
- `다시 놓기` 로 초기화, 모든 칸이 차면 제출 가능.
- 3단계는 방해 알파벳을 칸에 넣지 않고 트레이에 남겨야 정답.

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:4500
```
정답 단어는 서버에만 있고 프론트로는 섞인 알파벳 + 칸 수만 내려갑니다. 채점은 전부 서버.
01~05 캡챠와 같은 `catchap_captcha` DB 를 공유하며 테이블은 `puzzle_` 로 분리됩니다.

## 수집 데이터 (puzzle_attempt)
`target_word`, `word_length`, `shuffled_letters_json`, `selected_letters_json`,
`letter_drag_order_json`, `wrong_order_count`, `swap_count`, `regrab_count`, `retry_count`,
`drag_path_json`, `solve_time_ms`, `completion_time_ms`,
`correct_letters_json`·`distractor_letters_json`·`distractor_selected_count`(3단계), `hint_used`(5단계).

## 통과 기준
선택한 알파벳 순서가 정답 단어와 정확히 일치. 단계별 5문제 중 4문제, 전체 25문제 중 20문제 (`questions.js` 에서 조정).
