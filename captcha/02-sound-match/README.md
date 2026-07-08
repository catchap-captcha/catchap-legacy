# ② Sound Match CAPTCHA 🐱🔊

영어 단어 **발음을 듣고 알맞은 그림을 고르는** 어린이 교육용 듣기 캡챠.
**5단계 × 5문제 = 총 25문제.** 실제 발음 오디오(.m4a) 포함.

```
02-sound-match/
├── package.json
├── .env.example          # ← .env 로 복사 후 DB 비밀번호 입력
├── scripts/
│   └── generate-audio.js # 오디오 생성기 (macOS say + afconvert)
├── backend/
│   ├── server.js         # Express 서버 (프론트/오디오 서빙 + API)
│   ├── db/
│   │   ├── pool.js       # ★ DB 비밀번호 넣는 곳 (주석 참고)
│   │   └── schema.sql    # sound_session / sound_attempt 테이블
│   ├── data/
│   │   └── questions.js  # 5단계 × 5문제 문제 은행
│   └── routes/
│       └── captcha.js    # start / attempt / verify / token API
└── frontend/
    ├── index.html        # 스크린샷과 동일한 데모 화면
    ├── assets/audio/     # 생성된 단어 발음 파일 (*.m4a) 24개
    └── widget/
        ├── catchap-sound-match.js
        └── catchap-sound-match.css
```

## 5단계 구성

| 단계 | 유형 | 방식 | 화면 문구 |
| --- | --- | --- | --- |
| 1단계 | 기본 듣기 선택 | 단어 듣고 2개 그림 중 선택 | 소리를 듣고 맞는 그림을 골라보세요. |
| 2단계 | 보기 수 증가 | 단어 듣고 4개 그림 중 선택 | 영어 단어를 잘 듣고 알맞은 그림을 선택해요. |
| 3단계 | 비슷한 발음 구분 | 비슷하게 들리는 단어 중 정답 선택 | 비슷한 소리를 잘 듣고 맞는 그림을 골라보세요. |
| 4단계 | 글자 힌트 제거 | 라벨 없이 그림만, 오디오 2회 제한 | 단어를 듣고 그림만 보고 맞혀보세요. |
| 5단계 | 연속 듣기 선택 | 단어 2~3개 듣고 순서대로 선택 | 소리를 듣고 순서대로 그림을 골라보세요. |

## 실행 방법

### 1. DB 비밀번호 설정
```bash
cp .env.example .env       # .env 열어 DB_PASSWORD 입력 (★★★)
```
> `.env` 없이 `backend/db/pool.js` 의 `DEFAULTS.password` 에 직접 넣어도 됩니다.
> Word Drag(01)과 같은 `catchap_captcha` DB 를 공유하며, 테이블은 `sound_` 로 분리됩니다.

### 2. 설치 & 실행
```bash
npm install
npm start                  # → http://localhost:4100
```
MySQL 이 켜져 있으면 기동 시 테이블이 자동 생성됩니다. (DB 없이도 메모리 폴백으로 데모 동작)

### 3. 오디오 (재)생성 — macOS
오디오 파일은 이미 `frontend/assets/audio/` 에 들어 있습니다. 다시 만들려면:
```bash
npm run gen:audio          # questions.js 의 모든 단어를 say + afconvert 로 .m4a 생성
```
> macOS 전용입니다. 다른 OS 이거나 파일이 없어도, 위젯이 브라우저 내장 영어 TTS(SpeechSynthesis)로 **자동 폴백**해 소리가 납니다.

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/api/sound-match/start` | 세션 시작 → 문제 25개(정답 제거) 반환 |
| POST | `/api/sound-match/attempt` | 문제 1개 제출 → 채점 + 행동데이터 저장 |
| POST | `/api/sound-match/verify` | 세션 종료 → 통과/실패 판정 + 토큰 발급 |
| GET | `/api/sound-match/token/:token` | 발급 토큰 유효성 확인 |
| GET | `/api/sound-match/health` | 헬스체크 |

정답(`answer`/`answerSequence`)은 서버에만 있고 프론트로 안 내려갑니다. 채점은 전부 서버.

## 수집되는 행동 데이터 (sound_attempt 테이블)

`target_word`, `selected_word`, `selected_image_id`, `audio_play_count`, `solve_time_ms`,
`time_after_audio_ms`, `first_select_time_ms`, `wrong_attempt_count`,
`confused_pair`·`wrong_word_type`·`hovered_option_json`(3단계),
`max_audio_play_reached`·`hesitation_time_ms`(4단계),
`target_sequence_json`·`selected_sequence_json`·`sequence_correct`·`selection_order_json`·`time_per_selection_json`·`wrong_order_count`(5단계) 등.

## 위젯 임베드

```html
<link rel="stylesheet" href="widget/catchap-sound-match.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-sound-match.js"></script>
<script>
  CatChapSoundMatch.mount('#captcha-mount', {
    apiBase: 'http://localhost:4100/api/sound-match',
    audioBase: 'http://localhost:4100/assets/audio',
    onPass: (r) => console.log('통과 토큰:', r.token),
  });
</script>
```
