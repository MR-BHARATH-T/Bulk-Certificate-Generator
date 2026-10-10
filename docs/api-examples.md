# API Examples & Contracts

## 1. Create a Generation Job

**Endpoint**: `POST /api/v1/jobs`

**Request Body**:
```json
{
  "event_name": "Python Mastery Workshop",
  "organization_name": "Tech Academy",
  "issue_date": "2026-10-15",
  "description": "Completed a 40-hour intensive bootcamp.",
  "idempotency_key": "req-123456",
  "recipients": [
    {
      "full_name": "Alice Smith",
      "email": "alice@example.com"
    },
    {
      "full_name": "Bob Jones",
      "email": "bob@example.com"
    },
    {
      "full_name": "", 
      "email": "invalid-no-name@example.com"
    }
  ]
}
```

**Response**: `202 Accepted`
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
  "status": "PENDING",
  "total_count": 3,
  "valid_count": 2,
  "invalid_count": 1,
  "message": "Job accepted for background processing.",
  "status_url": "/api/v1/jobs/a1b2c3d4-e5f6-7890-1234-56789abcdef0"
}
```
*Note: The recipient with an empty name is identified as invalid immediately during request validation or marked as failed in the DB during creation.*

## 2. Get Job Status

**Endpoint**: `GET /api/v1/jobs/{job_id}`

**Response**: `200 OK`
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
  "status": "PROCESSING",
  "event_name": "Python Mastery Workshop",
  "total_count": 3,
  "completed_count": 1,
  "failed_count": 1,
  "pending_count": 1,
  "percentage_completed": 66.67,
  "created_at": "2026-10-10T12:00:00Z",
  "completed_at": null,
  "recipients": [
    {
      "id": "r1...",
      "full_name": "Alice Smith",
      "status": "COMPLETED",
      "certificate_id": "CERT-123",
      "error_message": null
    },
    {
      "id": "r2...",
      "full_name": "",
      "status": "FAILED",
      "certificate_id": null,
      "error_message": "Name cannot be empty."
    }
  ]
}
```

## 3. Retrieve Individual Certificate

**Endpoint**: `GET /api/v1/certificates/{certificate_id}`

**Response**: `200 OK`
```json
{
  "certificate_id": "CERT-123",
  "download_url": "https://storage.supabase.co/object/sign/certificates/a1b2.../CERT-123.pdf?token=...",
  "expires_in": 3600
}
```

## 4. Download Job Certificates (ZIP)

**Endpoint**: `GET /api/v1/jobs/{job_id}/download`

**Response**: `200 OK` (Streamed binary ZIP file)
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="certificates_a1b2c3d4.zip"`

*Note: Returns 400 Bad Request if job is still processing, or 404 if no successful certificates exist.*
