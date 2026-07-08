# package-notes.md

프로젝트 구성/배포에 대한 메모.

## 원본 (Canvas → 리팩토링)

- 원본: Claude Design Canvas 단일 HTML (`Canvas.dc.html`) — React(DCLogic) + Three.js.
- 원본은 **프론트에서 정답을 생성**(`hider`, `heading`)하고 클라이언트에서 비교했음.
- 리팩토링: 정답 생성/검증을 **서버로 이동**, 프론트는 표시/제출만 담당.
- 디자인(색상·그림자·애니메이션·3D 씬)은 인라인 스타일 → `css/style.css`,
  Three.js 씬 코드는 거의 그대로 `js/captcha.js` 로 이식.

## 동물 에셋

- 각 동물 폴더에 8방향 프레임 `dir0.png ~ dir7.png`.
- 원본의 `rabbit2` 프레임을 `rabbit/` 으로 매핑해 사용.
- 스프라이트 시트도 지원 (`js/captcha.js` 의 `ANIMALS`, `frameMap`).
- 백엔드는 `/target` 에서 정답 방향 프레임을 **불투명 이미지**로만 서빙
  (기본 경로: `../frontend/assets/animals`, `CAPTCHA_ASSETS_DIR` 로 변경 가능).

## 의존성

- Backend: `fastapi`, `uvicorn[standard]`, `pydantic`, `python-multipart`
  (requirements.txt).
- Frontend: 순수 정적 파일. Three.js 는 CDN(r128) 사용 → 빌드 도구 불필요.

## 실행 포트

- 프론트 정적 서버: **5500**
- API 서버: **8000**
- CORS 는 5500 → 8000 을 허용하도록 설정됨 (`CAPTCHA_ALLOWED_ORIGINS`).

## GitHub 업로드

```bash
cd captcha-project
git init
git add .
git commit -m "feat: forest village captcha (frontend/backend split, API-based verify)"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

- `.gitignore` 가 `.venv/`, `__pycache__/`, `.DS_Store`, `*.log` 등을 제외함.
- 동물 PNG(40장)는 저장소에 포함됨. 용량이 문제가 되면 Git LFS 고려.

## 알려진 프로토타입 한계 (의도된 단순화)

- 저장소가 In-Memory 라 서버 재시작 시 challenge/token/실패카운트가 초기화됨.
  멀티 워커에서는 공유되지 않음 → 운영 시 Redis 필요.
- 오브젝트(어느 곳에 숨었는지) 정답은 서버가 검증하지만, 프로토타입에서는
  어떤 오브젝트를 클릭해도 동물이 빼꼼함. 운영에서는 서버가 “peek” 을 게이팅.
- `/target` 이미지는 서명/만료가 없음 → 운영에서는 서명 URL 권장.
