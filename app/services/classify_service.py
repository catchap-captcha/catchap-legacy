from app.schemas.classify import ClassifyRequest, ClassifyResponse


def classify_stub(_req: ClassifyRequest) -> ClassifyResponse:
    """실제 이미지 분류 모델 자리 — 향후 모델 서빙으로 교체.

    확장 지점: 모델 로딩, 전처리, 추론, 버전/지연시간 기록.
    """
    return ClassifyResponse()
