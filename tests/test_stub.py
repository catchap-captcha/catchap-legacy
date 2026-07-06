from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_api_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200


def test_classify_stub():
    res = client.post("/api/v1/assets/classify", json={"asset_id": "a-1"})
    assert res.status_code == 200
    body = res.json()
    assert body["model_version"] == "stub-0.1.0"
    assert body["label"] == "unknown"
    assert body["confidence"] == 0.0
