# 🧭 방위 맞추기

동서남북·방향 관계를 익히는 캡챠

- **DB 문제 타입**: `DIRECTION_COMPASS`
- **API**: `/api/direction`  ·  **포트**: `4802`
- **구성**: 5단계 × 5문제 = 25문제 (단계별 4개 이상 정답 시 통과)

## 5단계
1. 기본 방위\n2. 기준점 방향\n3. 장소의 방향\n4. 8방위\n5. 경로 완성

## 실행
```bash
# 루트(capcha.social)에서 의존성 설치 후
cd ../..            # capcha.social
npm run start:02
# → http://localhost:4802
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
