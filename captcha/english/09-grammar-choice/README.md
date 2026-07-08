# ⑨ Grammar Choice CAPTCHA 🐱📚

문장 빈칸에 맞는 **문법 요소를 골라 넣는** 캡챠. (기초 문법 학습)
**5단계 × 5문제 = 총 25문제.** 포트 **4800**, API `/api/grammar-choice`.

| 단계 | 문법 주제 | 예시 |
| --- | --- | --- |
| 1 | be동사 | I `am` a student. |
| 2 | 관사 a/an | I have `an` apple. |
| 3 | 복수형 | There are two `dogs`. |
| 4 | 대명사 | Tom is my friend. `He` is kind. |
| 5 | 현재형 동사 | She `likes` apples. |

- 보기 카드를 문장의 **빈칸으로 드래그**(또는 탭)해서 넣는 방식. 빈칸이 맥동하며 위치를 알려줌.
- 정답은 서버에만. 문법 유형(`grammar_type`)별로 어디서 헷갈리는지 분석 가능.
- 실행: `cp .env.example .env`(★ DB_PASSWORD) → `npm install` → `npm start`
- 수집: `grammar_type`, `target_answer`, `selected_answer`, `hovered_options_json`, `hesitation_time_ms`, `solve_time_ms` 등 (`grammar_attempt`).
