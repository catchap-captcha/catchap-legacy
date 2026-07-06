# CatChap AI Service — Stub

## 현재 구현 범위 (1차)
- FastAPI 앱 + health check
- `POST /api/v1/assets/classify` — **stub 응답만 반환** (실제 AI 모델 없음)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/health` | 서비스 상태 (`model: stub-0.1.0`) |
| GET | `/api/v1/health` | v1 health |
| POST | `/api/v1/assets/classify` | 이미지 분류 stub |

### classify stub 응답
```json
{
  "model_version": "stub-0.1.0",
  "label": "unknown",
  "confidence": 0.0,
  "latency_ms": 0,
  "message": "AI classification is not implemented yet."
}
```

## 향후 구현 예정 (다음 단계)
- 이미지 분류 모델 서빙 (모델 로딩/전처리/추론 — `app/services/classify_service.py` 교체 지점)
- 행동 데이터 기반 이상 신호 보조 모델
- 모델 버전/지연시간/오분류 운영 지표 기록 (backend `model_versions`, `ai_predictions` 연동)
- CAPTCHA 판별 보조 추론

## 실행
```powershell
cd catchap-ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## 테스트
```powershell
.venv\Scripts\python.exe -m pytest tests -q
```
