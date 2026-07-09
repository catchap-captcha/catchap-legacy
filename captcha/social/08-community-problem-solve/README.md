# 🤝 우리 지역 문제 해결

지역 문제를 발견하고 해결 과정을 배우는 캡챠

- **DB 문제 타입**: `COMMUNITY_PROBLEM_SOLVE`
- **API**: `/api/community`  ·  **포트**: `4808`
- **구성**: 5단계 × 5문제 = 25문제 (단계별 4개 이상 정답 시 통과)

## 5단계
1. 문제 인식\n2. 해결책 선택\n3. 기관 연결\n4. 해결 순서\n5. 주민 의견

## 실행
```bash
# 루트(capcha.social)에서 의존성 설치 후
cd ../..            # capcha.social
npm run start:08
# → http://localhost:4808
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
