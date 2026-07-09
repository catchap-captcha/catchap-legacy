# CatChap · 사회(社會) 캡챠 10종

초등 사회 교과(지도·지역·문화유산·경제·생활안전)를 **캡챠(CAPTCHA)** 로 만든 프로젝트입니다.
디자인·구조는 `catchap.life`(생활안전 캡챠)와 동일하게 맞추되 **보라색(역사·사회) 테마**로 바꿨고,
각 캡챠는 **프론트엔드 + 백엔드(Express) + DB(MySQL)** 가 모두 연결된 **자기완결형 폴더**입니다.

한 캡챠 = **5단계 × 5문제 = 25문제**. 서버가 채점하고(프론트를 믿지 않음), 통과 시 검증 토큰을 발급합니다.

---

## 📁 폴더 구조

```
capcha.social/
├─ package.json                  # 루트: 의존성 + start:01~10 스크립트
├─ API_GUIDE.md                  # ★ API 따로 쓰는 방법 (임베드/서버검증)
├─ captcha/
│  ├─ _shared/                   # 공통 위젯·템플릿·생성/검증 스크립트
│  │  ├─ catchap-social.css      # 보라색 테마 위젯 스타일 (원본)
│  │  ├─ catchap-social.js       # 공통 위젯 엔진 (원본, 의존성 없음)
│  │  ├─ *.template.*            # 뼈대 파일 템플릿
│  │  ├─ generate.js             # 템플릿 → 10개 캡챠 뼈대 생성
│  │  ├─ validate.js             # 문제 은행 무결성 검사
│  │  └─ db-init-all.sql         # 10종 테이블 통합 생성 SQL
│  ├─ 01-map-symbol-find/        # 1. 우리 동네 지도 기호 찾기
│  ├─ 02-direction-compass/      # 2. 방위 맞추기
│  ├─ 03-public-office-match/    # 3. 공공기관 역할 연결
│  ├─ 04-cultural-heritage-match/# 4. 문화유산 사진 맞추기
│  ├─ 05-rural-city-sort/        # 5. 촌락과 도시 구분
│  ├─ 06-transport-timeline/     # 6. 교통수단 변화 순서
│  ├─ 07-local-festival-select/  # 7. 지역 축제 포스터 찾기
│  ├─ 08-community-problem-solve/# 8. 우리 지역 문제 해결
│  ├─ 09-digital-citizenship-solve/  # 9. 디지털 시민성 문제 해결
│  └─ 10-cpr-aed-safety-sequence/   # 10. 심폐소생술·AED 안전 순서 (1~3 이론, 4~5 사진)
```

각 캡챠 폴더는 동일한 구조입니다.

```
NN-name/
├─ package.json  .env.example  README.md
├─ frontend/
│  ├─ index.html                # 데모 페이지 (스크린샷의 보라색 화면)
│  ├─ widget/catchap-social.css # 위젯 스타일 (자기완결형 복사본)
│  ├─ widget/catchap-social.js  # 위젯 엔진 (자기완결형 복사본)
│  └─ assets/                   # (10번만) cpr/*.png, aed/*.png 실제 사진
└─ backend/
   ├─ server.js                 # Express 서버 (정적 프론트 + /api 라우트)
   ├─ routes/captcha.js         # start / attempt / verify / token / health
   ├─ data/questions.js         # ★ 문제 은행 (5단계 × 5문제)
   └─ db/{pool.js, schema.sql}  # MySQL 풀 + 스키마 자동 생성
```

---

## 🚀 실행 방법

### 1) 의존성 설치 (루트에서 한 번)
```bash
cd capcha.social
npm install
```

### 2) DB 비밀번호 설정 (선택 — 없어도 데모는 동작)
실행할 캡챠 폴더에서 `.env.example` 를 `.env` 로 복사하고 비밀번호를 입력하세요.
```bash
cd captcha/10-cpr-aed-safety-sequence
cp .env.example .env
#  .env 의  DB_PASSWORD=여기에_DB_비밀번호_입력  를 본인 MySQL 비밀번호로 수정
```
> `.env` 가 없거나 비밀번호가 틀리면 **자동으로 메모리 폴백**으로 동작합니다.
> (프론트 데모·채점·통과 판정은 정상, DB 저장만 생략)

### 3) 서버 실행
```bash
# 루트에서
npm run start:10        # → http://localhost:4810  (심폐소생술·AED)
npm run start:03        # → http://localhost:4803  (공공기관)
# ... start:01 ~ start:10
```
브라우저에서 열면 스크린샷과 같은 보라색 화면 안에 캡챠 위젯이 뜹니다.

포트: `01→4801, 02→4802, … 10→4810`

### DB를 미리 만들고 싶다면
```bash
mysql -u root -p < captcha/_shared/db-init-all.sql   # DB: catchap_social, 테이블 20개
```

---

## 🗄️ 데이터베이스

- DB 이름: **`catchap_social`** (10종 공유)
- 캡챠별 테이블 프리픽스로 분리: `map_`, `direction_`, `office_`, `heritage_`, `region_`, `transport_`, `festival_`, `community_`, `digital_`, `cpr_`
- 각 프리픽스마다 `*_session`(판 단위) / `*_attempt`(문제별 행동 로그) 2개 테이블
- `*_attempt` 는 모든 조작 유형(선택/순서/연결/분류/담기/좌표드래그/경로)의 수집 데이터를 담는 **통합 스키마**입니다.

---

## 🧩 문제 조작 유형 (위젯 엔진 공통)

| type | 조작 | 사용 예 |
| ---- | ---- | ---- |
| `single` | 보기 중 하나 탭(선택형) | 10 (1~3단계 이론·금지 행동) |
| `order` | 카드를 순서대로 배열(드래그) | 6·9, **10 (4~5단계 사진)** |
| `connect` | 왼쪽↔오른쪽 짝짓기(드래그) | 1·3·4·5·6·7·8·9 |
| `sort` | 여러 상자로 분류(드래그) | 1·2·4·5·6·8·9 |
| `pick` | 상자로 여러 개 담기(드래그) | 1·3·5·7·9 |
| `place` | 지도 위 핀 이동(드래그) | 2 (방위·위치 찾기) |

> · 1~9번은 4학년 심화·이모지 없음·드래그 중심으로 구성되어 있습니다.
> · 10번 4~5단계의 `order` 사진 카드는 올려주신 **심폐소생술·AED 안내 사진**을 쓰며, 카드의 "크게" 버튼으로 확대(라이트박스)할 수 있습니다.

---

## ✅ 개발용 스크립트
```bash
npm run validate   # 250문제 구조 무결성 검사(정답 참조·단계별 문제 수 등)
npm run gen        # 템플릿에서 뼈대 파일 재생성 (questions.js 는 건드리지 않음)
```

## 🔌 API를 따로 쓰려면
프론트를 자체 서비스에 심고 백엔드만 검증용으로 쓰는 방법은 **[API_GUIDE.md](API_GUIDE.md)** 를 보세요.
