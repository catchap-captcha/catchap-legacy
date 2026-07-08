# ⑥ 디지털 안전 CAPTCHA 🐱📱 (터치형)

스마트폰 화면 목업에서 **위험 요소를 직접 터치**해 찾는 캡챠. **5단계 × 5문제 = 총 25문제.**

## 단계 구성
| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 터치(touch) | 위험한 버튼 1개 터치 |
| 2 | 터치(touch 다중) | 개인정보 입력창 모두 찾기 |
| 3 | 터치(touch 다중, 채팅UI) | 낯선 사람의 위험한 말 찾기 |
| 4 | 터치(touch 다중) | 화면 속 위험 요소 모두 찾기 |
| 5 | 선택(single) | 가장 위험한 화면 고르기 |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5300
```
API: `/api/digital-safety` · 테이블 `digital_session` / `digital_attempt` · DB 없이 메모리 폴백 동작.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5300/api/digital-safety' });</script>
```
