from pydantic import BaseModel


class ClassifyRequest(BaseModel):
    asset_id: str | None = None
    file_url: str | None = None
    candidate_categories: list[str] | None = None


class ClassifyResponse(BaseModel):
    model_version: str = "stub-0.1.0"
    label: str = "unknown"
    confidence: float = 0.0
    latency_ms: int = 0
    message: str = "AI classification is not implemented yet."
