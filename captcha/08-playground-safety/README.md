# ⑧ 놀이터 안전 CAPTCHA 🐱🛝 (캐릭터 드래그형)

놀이터 장면에서 **아이 캐릭터를 안전한 위치로 드래그**하는 캡챠. **5단계 × 5문제 = 총 25문제.**

## 단계 구성
| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 좌표 드래그(place) | 안전한 위치로 아이 옮기기 |
| 2 | 좌표 드래그(place) | 위험 구역 2곳을 피해 이동 |
| 3 | 좌표 드래그(place) | 놀이기구별 안전 위치 찾기 |
| 4 | 좌표 드래그(place) | 움직이는 기구를 피해 이동 |
| 5 | 좌표 드래그(place) | 여러 위험을 피해 친구 곁으로 |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5500
```
API: `/api/playground-safety` · 테이블 `play_session` / `play_attempt` · DB 없이 메모리 폴백 동작.
캐릭터를 존 위로 끌어다 놓으면 `dropped_zone` 이 서버에서 정답 존과 비교됩니다. 드래그 궤적(`drag_path_json`)도 저장됩니다.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5500/api/playground-safety' });</script>
```
