# ⑦ 날씨 안전 CAPTCHA 🐱🌦️ (선 연결형)

날씨 카드와 **행동·준비물 카드를 선으로 연결**하는 캡챠. **5단계 × 5문제 = 총 25문제.**

## 단계 구성
| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 연결(connect) | 날씨 1개와 행동 연결 |
| 2 | 연결(connect) | 날씨 2개와 행동 연결 |
| 3 | 연결(connect) | 날씨와 준비물 연결 |
| 4 | 연결(connect) | 위험 행동 제외, 안전 행동만 연결 |
| 5 | 연결(connect) | 복합 날씨의 여러 필요를 준비물에 연결 |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5400
```
API: `/api/weather-safety` · 테이블 `weather_session` / `weather_attempt` · DB 없이 메모리 폴백 동작.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5400/api/weather-safety' });</script>
```
