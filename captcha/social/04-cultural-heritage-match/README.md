# 🏯 문화유산 사진 맞추기

지역 문화유산을 알아보는 캡챠

- **DB 문제 타입**: `CULTURAL_HERITAGE_MATCH`
- **API**: `/api/heritage`  ·  **포트**: `4804`
- **구성**: 5단계 × 5문제 = 25문제 (단계별 4개 이상 정답 시 통과)

## 5단계
1. 문화유산 찾기\n2. 이름 연결\n3. 설명 연결\n4. 유형 분류\n5. 보존 방법

## 실행
```bash
# 루트(capcha.social)에서 의존성 설치 후
cd ../..            # capcha.social
npm run start:04
# → http://localhost:4804
```
DB 비밀번호는 이 폴더에 `.env`(→ `.env.example` 복사)로 넣습니다. 없으면 메모리 폴백으로 동작합니다.

## 폴더
```
frontend/index.html            데모 페이지(보라색 화면)
frontend/widget/               위젯 css·js
backend/server.js              Express 서버
backend/routes/captcha.js      start/attempt/verify/token/health
backend/data/questions.js      문제 은행
backend/db/{pool.js,schema.sql} MySQL 연결·스키마
```

자세한 API 사용법은 상위 [../../API_GUIDE.md](../../API_GUIDE.md) 참고.
