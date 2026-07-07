# ⑨ 전기 안전 CAPTCHA 🐱🔌 (드래그형)

전기 주변 **위험 물건을 안전 상자로 드래그**하고 행동을 분류하는 캡챠. **5단계 × 5문제 = 총 25문제.**

## 단계 구성
| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 드래그 담기(pick) | 위험 물건 1개 치우기 |
| 2 | 드래그 담기(pick 다중) | 위험 물건 여러 개 치우기 |
| 3 | 드래그 담기(pick 다중) | 위험한 것만 골라 담기 |
| 4 | 분류 드래그(sort) | 전기 사용 행동 안전/위험 분류 |
| 5 | 드래그 담기(pick 다중) | 방 안 전기 위험 모두 정리 |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5600
```
API: `/api/electric-safety` · 테이블 `electric_session` / `electric_attempt` · DB 없이 메모리 폴백 동작.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5600/api/electric-safety' });</script>
```
