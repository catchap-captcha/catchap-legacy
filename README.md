# catchap-service — 교육형 문제은행 (정본)

CatChap 교육형 문제(1,344문항, 6과목)의 **원본 관리 지점**입니다.
문제 추가·수정·삭제는 **여기서만** 합니다.

## 구조 (A방식: 파일 원본 + DB 적재)

```
catchap-service/
  banks/            # 문제 원본(정본) — 과목 폴더 × topic별 파일, git 버전관리·리뷰·롤백
    kor/   (국어 325)  01_인물의마음.json  02_빈칸추론.json  … 13_십자말풀이.json
    eng/   (영어 250)  01_어순배열.json    …
    math/  (수학 153)  01_수와연산1.json   …
    sci/   (과학 91)   …
    soc/   (사회 250)  …
    life/  (생활 275)  …
  loader.py         # banks/<과목>/*.json → catchap-backend DB(questions) 적재(멱등)
  manifest.json     # 과목·topic별 문항 수 요약
```

- **원본**: `banks/<과목>/<번호>_<topic>.json`.
  `{ "subject":"국어", "topic":"인물의 마음", "questions":[ {"_order":N, ...문항}, ... ] }`
- **`_order`**: 은행 내 원래 순서(챕터 슬라이싱이 이 순서에 의존). topic이 리스트에
  섞여 있어도 로더가 `_order`로 정렬해 순서를 복원한다. **기존 문항의 `_order`는
  건드리지 말 것.** 새 문항은 `_order` 없이 추가하면 해당 과목 맨 뒤에 배치된다.
- 새 topic은 과목 폴더에 `NN_<topic>.json` 새 파일로 추가하면 로더가 자동 인식.
- **런타임**: 백엔드가 DB `questions` 테이블에서 조회(앱 시작 시 메모리 캐시).
  DB가 비면 백엔드 내장 파이썬 은행으로 폴백(무중단).

## 문제 편집 흐름

1. `banks/<과목>.json`의 `questions` 배열을 편집(추가/수정/삭제).
   - 필수 필드: `id`(전역 유일 슬러그), `type`, `topic`, `stage`, `prompt`, `hint`,
     `playable`, 그리고 유형별 정답 필드(`answer`/`answers`/…)·`explain`(해설).
2. 로더 실행 → DB 반영:
   ```
   # 백엔드 컨테이너에서(프로덕션):
   docker cp banks catchap-backend-api-1:/app/_banks
   docker cp loader.py catchap-backend-api-1:/app/loader.py
   docker exec catchap-backend-api-1 python /app/loader.py   # BANKS_DIR 조정 필요
   docker restart catchap-backend-api-1   # 앱 시작 시 DB 재로드
   ```
3. git 커밋 — 문제 변경 이력이 남는다(누가 언제 뭘 고쳤나 추적·롤백).

## 확장 (문제가 1만~2만 개가 될 때)

지금은 과목별 JSON. 규모가 커지면 이 폴더 내부만 진화시키면 되고(예: 문항별
개별 파일·검색 인덱스), 백엔드·교육형 API 인터페이스는 그대로다.
`questions` 테이블 기반이라 DB 조회 성능은 이미 확보돼 있다.

## 외부 API 제공

문제는 이미 **교육형 API**(백엔드 `/api/v1/captcha/v1/challenge`, site_key 인증)로
외부에 제공된다. catchap-service는 그 API가 서빙할 문제의 정본을 관리한다.
