# ⑦ Word Memory Match CAPTCHA 🐱🃏

카드를 뒤집어 **그림 ↔ 영어 단어의 짝을 맞추는** 어린이 교육용 기억력 캡챠.
카드 선택 순서·재확인 횟수·오답 짝짓기·기억 유지 시간 같은 행동 데이터를 수집합니다.
**5단계 × 5문제 = 총 25문제.**

```
07-word-memory-match/
├── package.json / .env.example   # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js                 # 포트 4600
│   ├── db/pool.js  (★ DB 비번), db/schema.sql (memory_session/attempt)
│   ├── data/questions.js         # 5단계 × 5문제 (짝 정보 + 섞인 board)
│   └── routes/captcha.js         # start / match / attempt / verify
└── frontend/
    ├── index.html
    └── widget/catchap-word-memory-match.{js,css}
```

## 5단계 구성

| 단계 | 유형 | 방식 | 카드 수 |
| --- | --- | --- | --- |
| 1단계 | 1쌍 맞추기 | 그림 1 + 단어 1 | 2장 |
| 2단계 | 2쌍 맞추기 | 카드 뒤집어 짝 맞춤 | 4장 |
| 3단계 | 3쌍 카드 매칭 | 기억하며 짝 맞춤 | 6장 |
| 4단계 | 유사 단어 포함 | cat/cap, bear/pear 등 헷갈림 | 4장 |
| 5단계 | 시간 제한 + 4쌍 | 제한 시간 안에 모두 맞춤 | 8장 |

## 조작
- 카드를 눌러 뒤집고, 두 장을 열어 그림과 단어가 같은 뜻이면 짝 성공(카드 유지).
- 틀리면 잠시 후 다시 뒤집힘. 모든 짝을 맞추면 통과.
- 5단계는 제한 시간(⏰) 안에 8장(4쌍)을 모두 맞춰야 통과.

## 핵심: 짝 판정은 **서버 권위**
- `POST /match` 가 카드 2장의 짝 여부를 판정합니다. 카드의 짝 정보(`key`)는
  **클라이언트로 내려가지 않고** 서버 board 에만 있습니다 (id 로도 짝을 알 수 없음).
- 짝 진행 상태(맞춘 짝, 오답 수)를 서버가 세션별로 관리하고, `/attempt` 에서 통과를 판정합니다.

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:4600
```
01~06 캡챠와 같은 `catchap_captcha` DB 를 공유하며 테이블은 `memory_` 로 분리됩니다.

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/api/word-memory-match/start` | 세션 시작 → 문제(섞인 카드 board) 반환 |
| POST | `/api/word-memory-match/match` | 카드 2장 짝 판정 (서버) |
| POST | `/api/word-memory-match/attempt` | 문제 종료 → 통과 판정 + 행동데이터 저장 |
| POST | `/api/word-memory-match/verify` | 세션 종료 → 통과/실패 + 토큰 |
| GET | `/api/word-memory-match/token/:token` · `/health` | 토큰 확인 · 헬스체크 |

## 수집 데이터 (memory_attempt)
`target_pairs_json`, `matched_pairs_json`, `matched_count`, `wrong_pair_count`,
`card_open_order_json`, `opened_cards_json`, `card_open_count`, `reopen_count`, `memory_attempt_count`,
`first_open_time_ms`, `first_match_time_ms`, `hesitation_time_ms`, `solve_time_ms`,
`confused_pair_json`·`similar_word_pairs_json`(4단계), `time_limit_ms`·`remaining_time_ms`(5단계).

## 통과 기준
문제 = 모든 짝을 맞추면 통과(5단계는 제한 시간 내). 단계별 5문제 중 4문제, 전체 25문제 중 20문제.
