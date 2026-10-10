import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup - clear tables before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown

def test_create_job():
    response = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Test Event",
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [
                {"full_name": "John Doe", "email": "john@test.com"},
                {"full_name": "Jane Doe"}
            ]
        },
    )
    assert response.status_code == 202
    data = response.json()
    assert data["event_name"] == "Test Event"
    assert data["total_count"] == 2
    assert "id" in data
    assert data["status"] == "PENDING"

def test_create_job_invalid_data():
    response = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "", # Invalid: empty
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [] # Invalid: empty array
        },
    )
    assert response.status_code == 422 # Pydantic validation error

def test_get_job():
    # Create a job first
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Get Job Event",
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [{"full_name": "Test User"}]
        },
    )
    job_id = create_res.json()["id"]

    # Get the job
    get_res = client.get(f"/api/v1/jobs/{job_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == job_id
    assert len(data["recipients"]) == 1
    assert data["recipients"][0]["full_name"] == "Test User"

def test_download_zip_fails_when_processing():
    # Create a job first
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Zip Event",
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [{"full_name": "Test User"}]
        },
    )
    job_id = create_res.json()["id"]

    # Try to download zip (should fail because status is PENDING)
    get_res = client.get(f"/api/v1/jobs/{job_id}/download")
    assert get_res.status_code == 400
    assert "still processing" in get_res.json()["detail"].lower()
