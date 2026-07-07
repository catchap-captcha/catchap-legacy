# CatChap 생활안전 CAPTCHA Suite 🐱🏠

어린이 교육용 **생활·교육 캡챠 11종** 모음. `catchap.english` 스위트와 **동일한 언어(한국어 주석)·스택
(Node/Express + MySQL(mysql2) + 바닐라 JS 위젯)·폴더 구조**를 따른다. 각 캡챠는 독립 폴더로 묶여 있어
하나씩 붙여 나갈 수 있다. 캡챠마다 **조작 방식이 다르게 섞여** 있다.

```
captcha/
├── shared/                 # 공통 위젯 엔진 + 디자인 토큰
│   ├── catchap-safety.js   #   선택/순서/선연결/드래그담기/분류/터치/좌표드래그/경로 공통 엔진
│   ├── catchap-safety.css
│   └── theme.css
├── 01-traffic-safety/      # ① 교통안전     — 선택 + 순서배열
├── 02-fire-safety/         # ② 화재안전     — 선택 + 선연결 + 순서배열
├── 03-clean-hands/         # ③ 손씻기 위생   — 선택 + 순서배열
├── 04-home-safety/         # ④ 우리집 안전   — 드래그 담기·분류
├── 05-emergency-number/    # ⑤ 긴급 전화번호 — 분류 드래그
├── 06-digital-safety/      # ⑥ 디지털 안전   — 화면 터치(멀티) + 화면 비교
├── 07-weather-safety/      # ⑦ 날씨 안전     — 선 연결(날씨↔행동/준비물)
├── 08-playground-safety/   # ⑧ 놀이터 안전   — 캐릭터 좌표 드래그
├── 09-electric-safety/     # ⑨ 전기 안전     — 드래그 담기·분류
├── 10-lost-child/          # ⑩ 미아 안전     — 선택+캐릭터드래그+경로드래그+선연결
└── 11-flag-puzzle/         # ⑪ 세계 국기 퍼즐 — 실제 국기 이미지 조각 드래그 퍼즐
```

## 11종 요약

| # | 캡챠 | 시그니처 조작 | 포트 | API 프리픽스 |
| --- | --- | --- | --- | --- |
| ① | 교통안전 | 선택 + 순서배열 | 4700 | `/api/traffic-safety` |
| ② | 화재안전 | 선택 + 선연결 + 순서배열 | 4800 | `/api/fire-safety` |
| ③ | 손씻기 위생 | 선택 + 순서배열 | 4900 | `/api/clean-hands` |
| ④ | 우리집 안전 | 드래그 담기(pick) / 분류(sort) | 5100 | `/api/home-safety` |
| ⑤ | 긴급 전화번호 | 분류 드래그(sort) / 담기(pick) | 5200 | `/api/emergency-number` |
| ⑥ | 디지털 안전 | **화면 터치**(touch) + 화면 비교(single) | 5300 | `/api/digital-safety` |
| ⑦ | 날씨 안전 | **선 연결**(connect) | 5400 | `/api/weather-safety` |
| ⑧ | 놀이터 안전 | **캐릭터 좌표 드래그**(place) | 5500 | `/api/playground-safety` |
| ⑨ | 전기 안전 | 드래그 담기/분류(pick·sort) | 5600 | `/api/electric-safety` |
| ⑩ | 미아 안전 | 선택+**좌표드래그**+**경로드래그**(route)+선연결 | 5700 | `/api/lost-child` |
| ⑪ | 세계 국기 퍼즐 | **실제 이미지 퍼즐**(puzzle) — 국기 조각 드래그 | 5800 | `/api/flag-puzzle` |

> 포트 5000 은 macOS AirPlay 와 충돌해 건너뛰었다. (① `catchap.english` 4000~4600 뒤로 이어짐)

각 캡챠는 **5단계 × 5문제 = 25문제**, 서버 채점, 행동 데이터 수집, CatChap 핑크 "생활 안전" 디자인,
`#captcha-mount` 컨테이너에 꽂는 위젯 규약(`CatChapSafety.mount`)을 공통으로 따른다.

## 공통 규약

- **폴더 구조**: `backend/{server.js, db/, data/, routes/}` + `frontend/{index.html, widget/}`
- **DB**: 모두 같은 `catchap_life` DB 를 공유하고, 테이블 프리픽스로 분리
  (`traffic_*`, `fire_*`, `hands_*`).
- **DB 비밀번호**: 각 폴더의 `.env.example` → `.env` 복사 후 `DB_PASSWORD` 입력
  (또는 `backend/db/pool.js` 의 `DEFAULTS.password`). 위치는 `★★★` 주석 표시.
- **DB 없이도 동작**: MySQL 미설정 시 메모리 폴백으로 데모가 그대로 돌아가고,
  비밀번호를 넣으면 자동으로 영구 저장으로 전환된다.
- **정답 비노출**: 정답/채점 기준은 서버에만 두고(`sanitizeQuestion`) 채점도 서버에서 수행.
- **위젯 마운트**: `CatChapSafety.mount('#captcha-mount', { apiBase, onProgress, onPass, onFail })`

## 실행 (예: ① 교통안전)
```bash
cd 01-traffic-safety
cp .env.example .env      # DB_PASSWORD 입력 (★★★)
npm install
npm start                 # → http://localhost:4700
```
나머지 캡챠도 각 폴더에서 동일하게 실행한다 (포트만 다름: 4700 / 4800 / 4900).

## 위젯 상호작용 유형 (공통 엔진)

| type | 설명 | 수집 데이터(대표) |
| --- | --- | --- |
| `single` | 보기 중 하나 선택(탭) | `selected_action`, `first_select_time_ms`, `wrong_attempt_count` |
| `order` | 카드를 순서대로 배열(탭) | `selected_sequence_json`, `wrong_order_count`, `regrab_count` |
| `connect` | 왼쪽↔오른쪽 짝 연결(탭) | `selected_pairs_json`, `wrong_connection_count`, `reconnect_count` |
| `pick` | 아이템을 상자 하나로 **드래그**해 담기 | `selected_items_json`, `wrong_selected_count`, `missed_count`, `drag_path_json` |
| `sort` | 아이템을 여러 상자로 **드래그** 분류 | `selected_bins_json`, `wrong_sort_count`, `drag_distance`, `regrab_count` |
| `touch` | 화면에서 위험 요소를 **탭**해 다중 선택 | `selected_items_json`, `wrong_selected_count`, `missed_count`, `selection_order_json` |
| `place` | 캐릭터를 안전 구역으로 **좌표 드래그** | `dropped_zone`, `target_zone`, `drag_path_json`, `regrab_count` |
| `route` | 위험 구역을 피해 목적지까지 **경로 드래그** | `route_path_json`, `reached_dest`, `danger_touched_count` |
| `puzzle` | **실제 이미지**를 격자로 잘라 조각을 퍼즐판에 드래그 | `placements_json`, `distractor_selected_count`, `swap_count`, `completion_rate` |
