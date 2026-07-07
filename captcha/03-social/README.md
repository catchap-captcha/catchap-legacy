# ③ 일반사회 영역 CAPTCHA 🐱⚖️ (선 연결형)

4학년 사회 **일반사회 영역** [4사07·08] : 경제활동(희소성·선택·생산·소비·교류), 민주주의·자치.
개념과 뜻을 **선으로 연결**하는 캡챠. **5단계 × 5문제 = 총 25문제.** 1단계부터 난이도 상승.

| 단계 | 내용 |
| --- | --- |
| 1 | 개념 1쌍 (보기 2개) |
| 2 | 2쌍 (보기 3개, 방해 1) |
| 3 | 3쌍 (딱 맞는 보기 3개) |
| 4 | 3쌍 (보기 4개, 방해 1) |
| 5 | 경제·민주주의 4쌍 (보기 5개, 방해 1) |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:5530
```
API `/api/social` · DB `catchap_quiz` · 테이블 `social_session` / `social_attempt` · DB 없이 메모리 폴백.
