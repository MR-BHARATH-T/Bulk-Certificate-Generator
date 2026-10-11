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

def test_delete_job():
    # Create a job first
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Delete Job Event",
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [{"full_name": "User To Delete"}]
        },
    )
    job_id = create_res.json()["id"]

    # Delete the job
    del_res = client.delete(f"/api/v1/jobs/{job_id}")
    assert del_res.status_code == 200
    assert "permanently deleted" in del_res.json()["message"].lower()

    # Verify it is deleted
    get_res = client.get(f"/api/v1/jobs/{job_id}")
    assert get_res.status_code == 404

def test_delete_certificate():
    # Create a job first
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Cert Delete Event",
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [{"full_name": "Cert User"}]
        },
    )
    job_data = create_res.json()
    job_id = job_data["id"]

    # Get job to retrieve recipient certificate_id
    get_job = client.get(f"/api/v1/jobs/{job_id}").json()
    cert_id = get_job["recipients"][0]["certificate_id"]

    # Delete certificate
    del_res = client.delete(f"/api/v1/certificates/{cert_id}")
    assert del_res.status_code == 200
    assert "permanently deleted" in del_res.json()["message"].lower()

    # Deleting non-existent should 404
    del_res_404 = client.delete(f"/api/v1/certificates/{cert_id}")
    assert del_res_404.status_code == 404

def test_download_format_validation():
    # Attempting to download with unsupported format should reject with 400
    res = client.get("/api/v1/certificates/NONEXISTENT/download?format=gif")
    # Non-existent cert returns 404 first
    assert res.status_code == 404

    # Processing job download with invalid format should fail
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Format Test Job",
            "organization_name": "Test Org",
            "issue_date": "2026-10-10",
            "recipients": [{"full_name": "Format User"}]
        },
    )
    job_id = create_res.json()["id"]
    res_job = client.get(f"/api/v1/jobs/{job_id}/download?format=invalid_fmt")
    assert res_job.status_code in (400, 422)

def test_create_job_large_batch():
    # Verify that batches exceeding the old 1000 limit (e.g. 1050 recipients) are accepted
    large_recipients = [{"full_name": f"Recipient {i}", "email": f"user{i}@test.com"} for i in range(1050)]
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Large Scale Summit",
            "organization_name": "Mega Organization",
            "issue_date": "2026-10-10",
            "recipients": large_recipients
        },
    )
    assert create_res.status_code == 202
    job_data = create_res.json()
    assert job_data["total_count"] == 1050
    assert job_data["status"] == "PENDING"


def test_completed_job_zip_download_formats():
    from app.workers.job_worker import JobWorker
    create_res = client.post(
        "/api/v1/jobs/",
        json={
            "event_name": "Cloud Architecture Summit",
            "organization_name": "Cloud Academy",
            "issue_date": "2026-10-12",
            "recipients": [{"full_name": "Samantha Reed", "email": "samantha@test.com"}]
        },
    )
    assert create_res.status_code == 202
    job_id = create_res.json()["id"]

    # Process job synchronously with worker using the test in-memory session factory
    worker = JobWorker(session_factory=TestingSessionLocal)
    worker.process_next_batch()

    # Test downloading ZIP in each of the 4 formats
    for fmt in ["pdf", "png", "jpg", "jpeg"]:
        res = client.get(f"/api/v1/jobs/{job_id}/download?format={fmt}")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/zip"
        assert f"_{fmt}.zip" in res.headers["content-disposition"]
        assert len(res.content) > 100


