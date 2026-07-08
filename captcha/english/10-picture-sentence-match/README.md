# ⑩ Picture Sentence Match CAPTCHA 🐱🖼️

그림을 보고 맞는 **영어 문장을 고르거나, 그림↔문장을 연결하는** 캡챠. (문장 이해력)
**5단계 × 5문제 = 총 25문제.** 포트 **4900**, API `/api/picture-sentence-match`.

| 단계 | 유형 | 방식 |
| --- | --- | --- |
| 1 | 문장 2개 중 선택 | 그림 1 + 문장 카드 선택 |
| 2 | 문장 3개 중 선택 | 보기 증가 |
| 3 | 유사 문장 4개 | 주어/동작/색깔이 살짝 다른 혼동 문장 |
| 4 | 그림 2 ↔ 문장 2 연결 | 문장 카드를 그림 옆 칸으로 드래그 |
| 5 | 그림 3 ↔ 문장 3 연결 | 다중 연결 |

- 문장 유형: 상태/행동/위치/소유/색깔 (`sentence_type` 태그로 분석).
- 정답(선택지 id·연결 맵)은 서버에만. 연결 채점은 `correct_match_count`/`wrong_match_count`.
- 실행: `cp .env.example .env`(★ DB_PASSWORD) → `npm install` → `npm start`
- 수집: `target_sentence`, `selected_sentence`, `target_map_json`, `selected_map_json`, `connection_path_json`, `first_select_time_ms`, `solve_time_ms` 등 (`picmatch_attempt`).
