import io
import zipfile
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.job import JobCreate, JobResponse, JobDetailResponse
from app.schemas.recipient import RecipientResponse
from app.services.job_service import JobService
from app.models.job import JobStatus
from app.models.recipient import RecipientStatus
from app.services.storage_service import storage_service

router = APIRouter()

@router.post("/", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    try:
        job = JobService.create_job(db, job_in)
        # Note: Background processing is handled by the worker process.
        # But for a simple deployment we could trigger BackgroundTasks here if we had no worker.
        return job
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = JobService.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    recipients = JobService.get_job_recipients(db, job_id)
    
    response_data = job.__dict__.copy()
    response_data['recipients'] = recipients
    
    if job.total_count > 0:
        response_data['percentage_completed'] = round((job.completed_count / job.total_count) * 100, 2)
    else:
        response_data['percentage_completed'] = 0.0
        
    return response_data

@router.get("/{job_id}/recipients", response_model=list[RecipientResponse])
def get_job_recipients(job_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return JobService.get_job_recipients(db, job_id, skip=skip, limit=limit)

@router.get("/{job_id}/download")
def download_certificates_zip(job_id: str, db: Session = Depends(get_db)):
    job = JobService.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.status in [JobStatus.PENDING, JobStatus.PROCESSING]:
        raise HTTPException(status_code=400, detail="Job is still processing")
        
    recipients = JobService.get_job_recipients(db, job_id, limit=10000)
    successful_recipients = [r for r in recipients if r.status == RecipientStatus.COMPLETED and r.storage_path]
    
    if not successful_recipients:
        raise HTTPException(status_code=404, detail="No successful certificates found for this job")
        
    # Generate ZIP in memory
    # For very large jobs, this might consume too much memory and should be streamed differently or saved to disk temporarily.
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for rec in successful_recipients:
            try:
                pdf_bytes = storage_service.download_file(rec.storage_path)
                # Create a safe filename
                safe_name = "".join(c for c in rec.full_name if c.isalnum() or c in (' ', '-', '_')).strip()
                filename = f"{safe_name}_{rec.certificate_id}.pdf"
                zip_file.writestr(filename, pdf_bytes)
            except Exception as e:
                # If one fails to download, skip it or log it
                print(f"Failed to include {rec.id} in zip: {e}")
                
    zip_buffer.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="certificates_{job_id}.zip"'
    }
    
    return StreamingResponse(
        iter([zip_buffer.getvalue()]), 
        media_type="application/zip", 
        headers=headers
    )
