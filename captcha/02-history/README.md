# ② 역사 영역 CAPTCHA 🐱🏛️ (빈칸/보기 선택형)

4학년 사회 **역사 영역** [4사06] : 우리 지역의 문화유산(의미·유형·가치, 박물관·유적지).
질문·빈칸에 **알맞은 답 카드 1개를 고르는** 캡챠. **5단계 × 5문제 = 총 25문제.** 1단계부터 난이도 상승.

| 단계 | 내용 | 보기 |
| --- | --- | --- |
| 1 | 아주 유명한 문화유산 | 2개 |
| 2 | 유형/무형 개념 | 3개 |
| 3 | 박물관·유적지·지역 | 3개 |
| 4 | 문화유산 이름·가치 | 4개 |
| 5 | 복합·관람 태도 | 5개 |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:5520
```
API `/api/history` · DB `catchap_quiz` · 테이블 `history_session` / `history_attempt` · DB 없이 메모리 폴백.
