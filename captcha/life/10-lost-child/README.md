# ⑩ 미아 안전 CAPTCHA 🐱🗺️ (혼합형)

길을 잃었을 때 안전한 장소·경로를 찾는 캡챠. 단계마다 **조작 방식이 다르게 섞여** 있다.
**5단계 × 5문제 = 총 25문제.**

## 단계 구성 (조작 혼합)
| 단계 | 유형 | 내용 |
| --- | --- | --- |
| 1 | 선택(single) | 도움 받을 안전 장소 고르기 |
| 2 | 좌표 드래그(place) | 아이를 안전 장소로 이동 |
| 3 | 경로 드래그(route) | 위험 장소를 피해 목적지까지 |
| 4 | 선 연결(connect) | 도움 장소와 행동 연결 |
| 5 | 경로 드래그(route) | 복합 지도에서 안전한 길 그리기 |

## 실행
```bash
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:5700
```
API: `/api/lost-child` · 테이블 `lost_session` / `lost_attempt` · DB 없이 메모리 폴백 동작.

### route(경로) 채점 방식
아이 캐릭터를 드래그하며 지나간 **경로 좌표(route_path_json)** 를 서버가 받아,
`목적지 도달 && 위험구역 접촉 0` 이면 정답으로 판정합니다(`reached_dest`, `danger_touched_count` 저장).

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://localhost:5700/api/lost-child' });</script>
```
