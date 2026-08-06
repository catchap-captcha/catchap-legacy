# catchap-legacy — 지난 작업 보관소

**읽기 전용입니다.** 여기서 새 작업을 하지 않습니다.

2026-08-06 저장소를 재설계하면서, **더 이상 쓰지 않는 브랜치를 하나도 버리지 않고**
여기로 옮겨 뒀습니다. **커밋 해시·작성자·날짜가 전부 그대로**입니다.

```
이름 규칙   <원래-저장소>/<원래-브랜치이름>
보기        catchap-frontend/ms   ← catchap-frontend 에 있던 ms 브랜치
```

---

## 왜 지우지 않고 옮겼나

브랜치는 커밋을 가리키는 **이름표**일 뿐입니다. 작업 저장소에서 이름표를 치우면
목록이 깨끗해지지만, **그 안의 커밋이 어디에도 없으면 영영 사라집니다.**

그래서 **먼저 여기로 옮기고, 해시가 같은지 확인한 뒤에** 원래 이름을 지웠습니다.
19개를 옮길 때도, 나중에 하나를 더 옮길 때도 **지우기 직전에 다시 대조**해서
하나라도 안 맞으면 멈추게 했습니다.

## 되살리는 법

```bash
git remote add legacy https://github.com/catchap-captcha/catchap-legacy.git
git fetch legacy
git switch -c 되살리기 legacy/catchap-frontend/ms
```

★그냥 들여다보기만 할 거면 이렇게 합니다.

```bash
git log legacy/catchap-backend/th-before
git show legacy/catchap-backend/th-before:app/main.py
```

★**옛 작업을 지금 `main` 에 넣고 싶다면** 통째로 병합하지 마세요.
`main` 이 훨씬 앞서 있어서 **되돌아갑니다.** 필요한 부분만 새 브랜치에 옮겨
PR 로 올리는 것이 맞습니다.

```bash
git switch -c feature/<요약> main       # main 에서 시작
# legacy 에서 필요한 부분만 가져와 얹기
```

---

## 무엇이 들어 있나 — 33개

### catchap-backend (11)

```
th-after                290커밋  8/6   ★main 에 흡수됨 (고유 0개)
th                      145커밋  7/16
th-middleteamproject    145커밋  7/16
th-before               136커밋  7/14  ★1차 MVP
sw                      277커밋  7/29
fix/escalation-record   281커밋  7/30
feat/gen-job-sweeper    218커밋  7/21
my                      221커밋  7/31  ★관심사 온보딩 — main 에 다른 설계로 있음
archive/sw-forest-captcha-20260713   7커밋  7/13
develop · ms              1커밋  6/29  초기 세팅
```

### catchap-frontend (10)

```
th-after                287커밋  8/6   ★main 에 흡수됨
th · th-middleteamproject  119커밋  7/16
th-before               108커밋  7/14
ms  7커밋 · jy-backup 6커밋 · my 5커밋 · sw 5커밋   6/30~7/13
develop · main-초기세팅   1커밋  6/29  ★빈 파일 140개짜리 뼈대
```

### catchap-captcha (5)

```
ms-behavior-shadow        8커밋  7/24  ★sw-captcha 에 전부 흡수됨
jy 2커밋 · th 1커밋 · my 1커밋 · main-초기세팅 1커밋
```

### catchap-service (7)

이 저장소의 **원래 이름이 `catchap-service`** 였습니다. 그때 있던 브랜치입니다.

```
th 2커밋 · ms 6커밋 · jy 6커밋 · sw 4커밋 · my 2커밋 · develop 1커밋 · main 1커밋
7/7 ~ 7/13
```

---

## 지금 쓰는 저장소는 여기가 아닙니다

```
catchap-backend      백엔드 API
catchap-frontend     화면
catchap-captcha      캡차 (교육형 위젯 · 공개 캡차 API)
catchap-behavior-ai  행동 기반 봇 판별 AI
catchap-infra        쿠버네티스 매니페스트와 인프라 문서
```
