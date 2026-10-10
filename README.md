# Bulk Certificate Generator

A complete, fault-tolerant system for generating bulk PDF certificates asynchronously. 

## Features
- **Async Processing**: Process thousands of certificates without blocking the API.
- **Fault-Tolerant**: Individual failures (e.g. invalid names, temporary storage issues) do not stop the entire batch.
- **Status Tracking**: Real-time progress monitoring via a dedicated dashboard.
- **Secure Storage**: Certificates are stored in private object storage, accessed via short-lived signed URLs.
- **Bulk Download**: Download a ZIP archive containing all successful certificates.

## Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL
- Supabase Project (for DB and Storage)

## Setup and Installation

### Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Unix/macOS
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to include your Supabase Database URL and Supabase Service Role Key.*
5. Run Database Migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the API Server:
   ```bash
   uvicorn app.main:app --reload
   ```
7. Start the Worker (in a new terminal):
   ```bash
   # Activate venv first

   Activate the correct backend virtual environment
   .\venv\Scripts\Activate.ps1

   python -m app.workers.job_worker
   ```

### Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Example Usage

### 1. Create a Job via API (cURL)
```bash
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Web Dev Bootcamp",
    "organization_name": "Tech Corp",
    "issue_date": "2026-10-10",
    "recipients": [
      {"full_name": "John Doe", "email": "john@example.com"},
      {"full_name": "Jane Smith"}
    ]
  }'
```

### 2. Check Job Status
```bash
curl http://localhost:8000/api/v1/jobs/<job-id>
```

### 3. Download ZIP
Navigate to `http://localhost:8000/api/v1/jobs/<job-id>/download` in your browser.

## Testing
Run tests from the `backend` directory using:
```bash
pytest
```
*Note: Ensure you configure a separate test database in your test configuration to avoid overwriting development data.*
