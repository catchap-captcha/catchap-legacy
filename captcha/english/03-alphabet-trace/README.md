# ③ Alphabet Trace CAPTCHA 🐱✏️

알파벳을 **따라 쓰고 완성하는** 어린이 교육용 캡챠. 캔버스에 손/마우스로 획을 그리면
서버가 **형태 유사도**를 채점합니다. **5단계 × 5문제 = 총 25문제.**

```
03-alphabet-trace/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── backend/
│   ├── server.js         # Express 서버 (포트 4200)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # trace_session / trace_attempt 테이블
│   ├── data/
│   │   ├── letters.js    # 알파벳 획 좌표 + 형태 채점 로직
│   │   └── questions.js  # 5단계 × 5문제 문제 은행
│   └── routes/
│       └── captcha.js    # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 스크린샷과 동일한 데모 화면
    └── widget/
        ├── catchap-alphabet-trace.js   # 캔버스 그리기 위젯
        └── catchap-alphabet-trace.css
```

## 5단계 구성

| 단계 | 유형 | 방식 | 대상 글자 | 화면 문구 |
| --- | --- | --- | --- | --- |
| 1단계 | 점선 따라쓰기 | 점선 위를 따라 그림 | L, T, I, O, C | 점선을 따라 알파벳을 그려보세요. |
| 2단계 | 흐린 글자 따라쓰기 | 흐린 글자 위에 그림 | A, B, D, E, F | 흐린 글자를 따라 알파벳을 완성해보세요. |
| 3단계 | 시작점·방향 | ● 시작점/화살표 방향대로 | L, T, C, E, H | 시작점에서 출발해서 화살표 방향대로 그려보세요. |
| 4단계 | 일부만 보고 완성 | 일부 획만 제공, 나머지 완성 | D, B, P, E, A | 빠진 부분을 그려 알파벳을 완성해보세요. |
| 5단계 | 보고 직접 쓰기 | 예시 보고 빈칸에 직접 | A, b, d, p, q | 위의 알파벳을 보고 빈칸에 직접 써보세요. |

> `b/d/p/q` 처럼 아이들이 헷갈리는 글자는 마지막 5단계에 배치했습니다.

## 실행 방법

### 1. DB 비밀번호 설정
```bash
cp .env.example .env       # .env 열어 DB_PASSWORD 입력 (★★★)
```
> `.env` 없이 `backend/db/pool.js` 의 `DEFAULTS.password` 에 직접 넣어도 됩니다.
> 01·02 캡챠와 같은 `catchap_captcha` DB 를 공유하며, 테이블은 `trace_` 로 분리됩니다.

### 2. 설치 & 실행
```bash
npm install
npm start                  # → http://localhost:4200
```
MySQL 이 켜져 있으면 기동 시 테이블이 자동 생성됩니다. (DB 없이도 메모리 폴백으로 동작)

## 채점 방식 (서버, `letters.js`)

- 각 알파벳은 0~100 정규화 좌표의 **획(stroke) 폴리라인**으로 정의됨.
- 사용자가 그린 경로를 받아 서버에서 계산:
  - `completion_rate` — 가이드 점을 지나간 비율
  - `guide_deviation` — 가이드 선에서 벗어난 평균 거리
  - `off_path_ratio` — 가이드 밖으로 벗어난 점 비율
  - `shape_similarity_score` — 완성도 × 경로 정확도 (0~1)
  - `direction_accuracy` — 첫 획 방향 일치도 (3단계)
- 통과 기준: `completion ≥ 0.55`, `deviation ≤ 20`, `off_path ≤ 0.45` (아이 친화적으로 관대)
- 따라쓰기 가이드 좌표는 어차피 화면에 보이는 정보라 클라이언트로 내려줘도 무방하며,
  **채점은 전적으로 서버에서** 합니다.

## 수집되는 행동 데이터 (trace_attempt 테이블)

`trace_path_json`, `stroke_order_json`, `stroke_count`, `start_position`, `end_position`,
`drawing_time_ms`, `pause_count`, `pause_duration_ms`, `retry_count`,
`completion_rate`, `guide_deviation`, `off_path_ratio`, `shape_similarity_score`,
`direction_accuracy`, `correct_start_point`,
`provided_part_type`(4단계), `letter_recognition_score`(5단계) 등.

## 통과 기준
- 단계별: 5문제 중 **4문제 이상** 통과
- 전체: 25문제 중 **18문제 이상** 통과 (그리기 난이도가 높아 완화, `questions.js` 에서 조정)

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-alphabet-trace.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-alphabet-trace.js"></script>
<script>
  CatChapAlphabetTrace.mount('#captcha-mount', {
    apiBase: 'http://localhost:4200/api/alphabet-trace',
    onPass: (r) => console.log('통과 토큰:', r.token),
  });
</script>
```
