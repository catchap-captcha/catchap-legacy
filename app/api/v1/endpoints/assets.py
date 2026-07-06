from fastapi import APIRouter

from app.schemas.classify import ClassifyRequest, ClassifyResponse
from app.services.classify_service import classify_stub

router = APIRouter(prefix="/assets", tags=["assets"])


@router.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    """이미지 분류 stub — 실제 AI 모델은 다음 단계에서 구현.

    요청을 받으면 항상 stub 응답을 반환한다.
    """
    return classify_stub(req)
