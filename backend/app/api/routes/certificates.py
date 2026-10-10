import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.job_service import JobService
from app.services.storage_service import storage_service
from app.core.config import settings

router = APIRouter()

@router.get("/{certificate_id}")
def get_certificate(certificate_id: str, request: Request, db: Session = Depends(get_db)):
    recipient = JobService.get_certificate_by_id(db, certificate_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    if recipient.status != "COMPLETED" or not recipient.storage_path:
        raise HTTPException(status_code=400, detail="Certificate is not ready or failed to generate")
        
    try:
        # Use request.base_url to dynamically get the current host (e.g. localhost:8000)
        base_url = str(request.base_url).rstrip('/')
        url = storage_service.get_signed_url(recipient.storage_path, request_base_url=base_url)
        return {
            "certificate_id": recipient.certificate_id,
            "download_url": url,
            "expires_in": 3600 # mock expiration for local
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not generate download link")

@router.get("/download/{job_id}/{filename}")
def download_local_certificate(job_id: str, filename: str):
    """Serves the generated PDF file from the local disk."""
    file_path = os.path.join(settings.LOCAL_STORAGE_DIR, job_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )

