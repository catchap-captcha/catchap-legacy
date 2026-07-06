from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(
    title="CatChap AI Service (stub)",
    version="0.1.0",
    description="이미지 분류/행동 분석 AI 추론 서비스 — 현재는 stub. "
    "실제 모델 서빙은 다음 단계에서 구현한다.",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "catchap-ai-service", "model": "stub-0.1.0"}
