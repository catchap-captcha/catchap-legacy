# 🏛️ 공공기관 역할 연결

지역 공공기관의 역할을 연결하는 캡챠

- **DB 문제 타입**: `PUBLIC_OFFICE_MATCH`
- **API**: `/api/public-office`  ·  **포트**: `4803`
- **구성**: 5단계 × 5문제 = 25문제 (단계별 4개 이상 정답 시 통과)

## 5단계
1. 이름 매칭\n2. 역할 연결\n3. 상황별 선택\n4. 유사 기관 구분\n5. 여러 상황 해결

## 실행
```bash
# 루트(capcha.social)에서 의존성 설치 후
cd ../..            # capcha.social
npm run start:03
# → http://localhost:4803
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
