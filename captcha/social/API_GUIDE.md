# CatChap 사회 캡챠 — API 사용 가이드

각 캡챠는 독립 실행되는 **REST API 서버**를 가집니다. 프론트 데모 없이 **API만 따로** 써서
① 내 서비스 페이지에 위젯을 임베드하거나 ② "사람인지" 통과 여부를 **서버끼리 검증**할 수 있습니다.

- 베이스 URL 형식: `http://<host>:<port>/api/<apiPath>`
- 캡챠별 `port` / `apiPath`

| # | 캡챠 | port | apiPath |
|---|------|------|---------|
| 01 | 지도 기호 찾기 | 4801 | `map-symbol` |
| 02 | 방위 맞추기 | 4802 | `direction` |
| 03 | 공공기관 역할 연결 | 4803 | `public-office` |
| 04 | 문화유산 사진 맞추기 | 4804 | `heritage` |
| 05 | 촌락과 도시 구분 | 4805 | `rural-city` |
| 06 | 교통수단 변화 순서 | 4806 | `transport` |
| 07 | 지역 축제 포스터 찾기 | 4807 | `festival` |
| 08 | 우리 지역 문제 해결 | 4808 | `community` |
| 09 | 디지털 시민성 문제 해결 | 4809 | `digital-citizenship` |
| 10 | 심폐소생술·AED 안전 순서 | 4810 | `cpr-aed` |

CORS 는 `*` 로 열려 있어 다른 도메인에서도 호출할 수 있습니다.

---

## 엔드포인트

### `POST /api/<apiPath>/start`
새 세션을 시작하고 **정답이 제거된** 문제 25개를 반환합니다.
```jsonc
// 응답
{
  "sessionId": "uuid",
  "captchaType": "CPR_AED_SAFETY_SEQUENCE",
  "totalStages": 5,
  "questionsPerStage": 5,
  "stagePassThreshold": 4,     // 단계별 통과: 5문제 중 4개 이상
  "totalPassThreshold": 20,    // 전체 통과: 25문제 중 20개 이상
  "questions": [ { "id": "l1-q1", "stage": 1, "type": "order", "prompt": "...", "cards": [...] }, ... ]
}
```
> `answer` / `answers` / `correctSequence` 등 **정답 필드는 절대 내려가지 않습니다.**

### `POST /api/<apiPath>/attempt`
문제 1개의 답을 제출하면 **서버가 채점**하고 행동 데이터를 저장합니다.
```jsonc
// 요청 (유형에 맞는 필드만 채우면 됨)
{
  "sessionId": "uuid",
  "questionId": "l1-q1",
  "selectedOption": "o1",              // single
  "sequence": ["c1","c2","c3"],        // order
  "pairs": { "a":"x", "b":"y" },        // connect
  "picked": ["i1","i2"],               // pick
  "bins":  { "i1":"chon", "i2":"do" },  // sort
  "metrics": { "solveTimeMs": 3200, "wrongAttemptCount": 0, "regrabCount": 1 }
}
// 응답 (정답 자체는 노출하지 않고 통계만)
{ "correct": true, "verdict": { "wrongOrderCount": 0 } }
```

### `POST /api/<apiPath>/verify`
세션을 마감하고 통과 여부를 판정합니다. 통과 시 **검증 토큰**을 발급합니다.
```jsonc
// 요청
{ "sessionId": "uuid" }
// 응답
{
  "passed": true,
  "totalCorrect": 22,
  "totalQuestions": 25,
  "stageResults": { "1": { "correct": 5, "answered": 5, "passed": true }, ... },
  "token": "발급된-검증-토큰 (실패 시 null)"
}
```

### `GET /api/<apiPath>/token/:token`
발급된 토큰이 유효한지(정말 통과했는지) **서버 간에** 확인합니다.
```jsonc
{ "valid": true }
```
> 토큰 검증은 DB가 연결되어 있어야 정확합니다(메모리 폴백에서는 재시작 시 사라짐).

### `GET /api/<apiPath>/health`
```jsonc
{ "ok": true, "db": "up" }
```

---

## 1) 위젯만 내 페이지에 임베드하기

두 파일(`catchap-social.css`, `catchap-social.js`)만 가져오고, 마운트할 때 `apiBase` 만 지정하면 됩니다.

```html
<link rel="stylesheet" href="/widget/catchap-social.css" />
<div id="captcha-mount"></div>
<script src="/widget/catchap-social.js"></script>
<script>
  CatChapSocial.mount('#captcha-mount', {
    apiBase: 'http://localhost:4810/api/cpr-aed',   // ← 원하는 캡챠 서버
    onProgress: (info) => { /* info.index, info.total, info.correct, info.stage */ },
    onPass: (result) => {
      // result.token 을 우리 서버로 보내 재검증하면 안전
      fetch('/my-backend/captcha-pass', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: result.token, type: result.captchaType }),
      });
    },
    onFail: (result) => { console.log('실패', result.totalCorrect); },
  });
</script>
```
> 10번(심폐소생술) 위젯은 카드 사진(`assets/cpr/*.png`, `assets/aed/*.png`)이 필요하므로
> 해당 서버(`http://localhost:4810`)가 정적 파일을 서빙하도록 두거나 이미지를 함께 복사하세요.

## 2) UI 없이 API로만 검증 흐름 돌리기

```bash
BASE=http://localhost:4810/api/cpr-aed
SID=$(curl -s -X POST $BASE/start | jq -r .sessionId)

curl -s -X POST $BASE/attempt -H 'Content-Type: application/json' \
  -d "{\"sessionId\":\"$SID\",\"questionId\":\"l1-q1\",\"sequence\":[\"c1\",\"c2\",\"c3\"]}"

curl -s -X POST $BASE/verify  -H 'Content-Type: application/json' \
  -d "{\"sessionId\":\"$SID\"}"        # → { passed, token, ... }
```

## 3) 우리 서버에서 토큰 재검증 (권장 패턴)

프론트가 준 `token` 을 그대로 믿지 말고, 우리 백엔드에서 캡챠 서버로 한 번 더 확인합니다.

```js
// 우리 백엔드 (예: Node/Express)
app.post('/my-backend/captcha-pass', async (req, res) => {
  const { token } = req.body;
  const r = await fetch(`http://localhost:4810/api/cpr-aed/token/${token}`);
  const { valid } = await r.json();
  if (!valid) return res.status(403).json({ error: '캡챠 미통과' });
  // valid === true → 사람으로 인정하고 다음 단계 진행
  res.json({ ok: true });
});
```

---

## 참고
- 채점은 100% 서버에서 이뤄지므로 프론트를 조작해도 통과할 수 없습니다.
- 문제 순서·보기 순서는 클라이언트에서 매번 섞여 정답이 위치로 새지 않습니다.
- 행동 데이터(풀이 시간·오답 수·드래그 궤적 등)는 `*_attempt` 테이블과 `metrics_json` 에 쌓입니다.
