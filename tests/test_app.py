import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code in [200, 307]  # Allow both 200 and 307 for flexibility
    if response.status_code == 307:
        assert response.headers["location"] == "/static/index.html"

def test_not_found():
    response = client.get("/nonexistent")
    assert response.status_code == 404