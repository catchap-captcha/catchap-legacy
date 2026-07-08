# CatChap CAPTCHA Suite 🐱

어린이 교육용 영어 캡챠 **10종** 모음 — 알파벳→단어→철자→문장→문법→독해 흐름. 각 캡챠는 독립 폴더로 묶여 있어 하나씩 붙여 나갈 수 있습니다.

```
captcha/
├── shared/                 # 공통 디자인 토큰 / 유틸 (선택)
├── 01-word-drag/           # ① Word Drag        — 그림 보고 영어 단어 드래그 ✅
├── 02-sound-match/         # ② Sound Match      — 소리 듣고 그림 고르기 (오디오 포함) ✅
├── 03-alphabet-trace/      # ③ Alphabet Trace   — 알파벳 따라 쓰고 완성하기 ✅
├── 04-missing-letter/      # ④ Missing Letter   — 빠진 알파벳 채워 단어 완성 ✅
├── 05-word-category-sort/  # ⑤ Word Category Sort — 단어를 주제별로 분류 ✅
├── 06-word-puzzle/         # ⑥ Word Puzzle      — 섞인 알파벳으로 단어 조립 ✅
├── 07-word-memory-match/   # ⑦ Word Memory Match — 카드 뒤집어 그림·단어 짝맞추기 ✅
├── 08-sentence-order/      # ⑧ Sentence Order   — 단어 카드로 영어 문장 만들기 ✅
├── 09-grammar-choice/      # ⑨ Grammar Choice   — 빈칸에 알맞은 문법 요소 넣기 ✅
└── 10-picture-sentence-match/ # ⑩ Picture Sentence Match — 그림에 맞는 문장 연결 ✅
```

## 10종 요약

| # | 캡챠 | 핵심 능력 | 포트 | API 프리픽스 |
| --- | --- | --- | --- | --- |
| ① | Word Drag | 그림↔단어 연결 (드래그) | 4000 | `/api/word-drag` |
| ② | Sound Match | 듣기 이해 (오디오) | 4100 | `/api/sound-match` |
| ③ | Alphabet Trace | 알파벳 쓰기 (캔버스) | 4200 | `/api/alphabet-trace` |
| ④ | Missing Letter | 철자 인지 (빈칸 채우기) | 4300 | `/api/missing-letter` |
| ⑤ | Word Category Sort | 의미 분류 (드래그 정렬) | 4400 | `/api/word-category-sort` |
| ⑥ | Word Puzzle | 철자 순서 조립 (드래그) | 4500 | `/api/word-puzzle` |
| ⑦ | Word Memory Match | 기억력 (카드 짝맞추기) | 4600 | `/api/word-memory-match` |
| ⑧ | Sentence Order | 영어 어순 (문장 조립) | 4700 | `/api/sentence-order` |
| ⑨ | Grammar Choice | 기초 문법 (빈칸 채우기) | 4800 | `/api/grammar-choice` |
| ⑩ | Picture Sentence Match | 문장 독해 (그림-문장 연결) | 4900 | `/api/picture-sentence-match` |

각 캡챠는 **5단계 × 5문제 = 25문제**, 서버 채점, 행동 데이터 수집, CatChap 디자인,
`#captcha-mount` 컨테이너에 꽂는 위젯 규약을 공통으로 따릅니다. 자세한 실행법은
각 폴더의 `README.md` 를 참고하세요.

## 공통 규약

- **폴더 구조**: `backend/{server.js, db/, data/, routes/}` + `frontend/{index.html, widget/}`
- **DB**: 모두 같은 `catchap_captcha` DB 를 공유하고, 테이블 프리픽스로 분리
  (`captcha_*`, `sound_*`, `trace_*`, `missing_*`, `sort_*`, `puzzle_*`, `memory_*`, `sentence_*`, `grammar_*`, `picmatch_*`).
- **DB 비밀번호**: 각 폴더의 `.env.example` → `.env` 복사 후 `DB_PASSWORD` 입력
  (또는 `backend/db/pool.js` 의 `DEFAULTS.password`). 위치는 `★★★` 주석 표시.
- **DB 없이도 동작**: MySQL 미설정 시 메모리 폴백으로 데모가 그대로 돌아가고,
  비밀번호를 넣으면 자동으로 영구 저장으로 전환됩니다.
- **정답 비노출**: 정답/채점 기준은 서버에만 두고 채점도 서버에서 수행.
- **위젯 마운트**: `CatChapXxx.mount('#captcha-mount', { apiBase, onProgress, onPass, onFail })`

## 실행 (예: ① Word Drag)
```bash
cd 01-word-drag
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:4000
```
나머지 캡챠도 각 폴더에서 동일하게 실행합니다 (포트만 다름: 4000~4900).
