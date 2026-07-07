# capcha_service — 초등 4학년 사회 드래그 CAPTCHA (sw)

초등 4학년 **사회 교과 3개 영역**을 드래그로 푸는 어린이용 CAPTCHA 서비스입니다.
한 번의 드래그로 **봇 탐지용 행동 데이터**(끌기 궤적·거리·다시연결 횟수 등)와
**학습 문제 풀이 결과**를 함께 수집합니다. 호스트 페이지의 `#captcha-mount`에
위젯을 얹고, 백엔드 API가 서버에서 채점합니다(정답은 프론트로 내려가지 않음).

## 모듈 (captcha/)

| 모듈 | 영역 | 성취기준 | 방식 | 포트 | API |
| --- | --- | --- | --- | --- | --- |
| `01-geography` | 지리 | 4사05·09·10 | 선 긋기(낱말↔뜻) | 5510 | `/api/geography` |
| `02-history` | 역사(문화유산) | 4사06 | 정답 카드 드래그 | 5520 | `/api/history` |
| `03-social` | 일반사회 | 4사07·08 | 선 긋기(개념↔뜻) | 5530 | `/api/social` |

- 각 모듈: **5단계 × 9문제 = 45문제**, 매 세션 단계별 5개씩 무작위 출제(난이도 오름차순), 총 25문제.
- 마우스·터치 모두 지원, HTTP-only 환경 동작(포인터 이벤트).

## 실행 (모듈별)
```bash
cd captcha/01-geography
cp .env.example .env      # DB_PASSWORD 입력
npm install
npm start                 # → http://localhost:5510
```
DB(MySQL) 미설정 시에도 메모리 폴백으로 데모 동작. DB는 `catchap_quiz` 하나에
모듈별 테이블 프리픽스(`geo_`/`history_`/`social_`)로 분리.

## 위젯 임베드
```html
<link rel="stylesheet" href="widget/catchap-safety.css" />
<div id="captcha-mount"></div>
<script src="widget/catchap-safety.js"></script>
<script>CatChapSafety.mount('#captcha-mount', { apiBase: 'http://<host>:5510/api/geography' });</script>
```
