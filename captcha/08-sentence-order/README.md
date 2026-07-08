# ⑧ Sentence Order CAPTCHA 🐱📝

섞인 단어 카드를 **순서대로 배열해 영어 문장을 완성하는** 캡챠. (영어 어순 학습)
**5단계 × 5문제 = 총 25문제.** 포트 **4700**, API `/api/sentence-order`.

| 단계 | 유형 | 예시 |
| --- | --- | --- |
| 1 | 3단어 문장 (그림 힌트) | I like apples |
| 2 | 4단어 문장 | She has a cat |
| 3 | 5단어 문장 | I go to school today |
| 4 | 방해 단어 포함 | 필요 없는 단어는 트레이에 남기기 |
| 5 | 그림 없이 한국어 뜻만 | 뜻을 보고 어순 완성 |

- 단어 카드를 문장 칸으로 **드래그**(또는 탭 → 왼쪽 칸부터 자동). 칸의 카드 탭 → 트레이 복귀, 교체(swap) 지원.
- 정답 문장은 서버에만. 채점(`wrong_order_count`, `distractor_selected_count`)은 서버에서.
- 실행: `cp .env.example .env`(★ DB_PASSWORD) → `npm install` → `npm start`
- 수집: `target_sentence`, `selected_word_order_json`, `wrong_order_count`, `drag_order_json`, `drag_path_json`, `swap_count`, `regrab_count`, `solve_time_ms` 등 (`sentence_attempt`).
