import io
import zipfile
import pypdfium2 as pdfium
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.job import JobCreate, JobResponse, JobDetailResponse
from app.schemas.recipient import RecipientResponse
from app.services.job_service import JobService
from app.models.job import JobStatus
from app.models.recipient import Recipient, RecipientStatus
from app.services.storage_service import storage_service

router = APIRouter()

@router.get("/", response_model=list[JobResponse])
def list_jobs(limit: int = 20, db: Session = Depends(get_db)):
    return JobService.list_jobs(db, limit=limit)

def _process_job_background():
    try:
        from app.workers.job_worker import JobWorker
        worker = JobWorker()
        while True:
            processed = worker.process_next_batch()
            if not processed:
                break
    except Exception as e:
        print(f"Background processing error: {e}")

@router.post("/", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_job(job_in: JobCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        job = JobService.create_job(db, job_in)
        # Trigger background processing automatically so jobs complete immediately
        background_tasks.add_task(_process_job_background)
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
def download_certificates_zip(
    job_id: str, 
    format: str = Query("pdf", description="Export format: pdf, png, jpg, jpeg"),
    db: Session = Depends(get_db)
):
    job = JobService.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.status in [JobStatus.PENDING, JobStatus.PROCESSING]:
        raise HTTPException(status_code=400, detail="Job is still processing")
        
    successful_recipients = (
        db.query(Recipient)
        .filter(
            Recipient.job_id == JobService._to_uuid(job_id),
            Recipient.status == RecipientStatus.COMPLETED,
            Recipient.storage_path.isnot(None)
        )
        .all()
    )
    
    if not successful_recipients:
        raise HTTPException(status_code=404, detail="No successful certificates found for this job")
        
    fmt = (format or "pdf").lower().strip()
    if fmt not in ("pdf", "png", "jpg", "jpeg"):
        raise HTTPException(status_code=400, detail=f"Unsupported format '{fmt}'. Supported formats: pdf, png, jpg, jpeg")

    # Generate ZIP in memory
    zip_buffer = io.BytesIO()
    used_filenames = set()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, rec in enumerate(successful_recipients, 1):
            try:
                pdf_bytes = storage_service.download_file(rec.storage_path)
                safe_name = "".join(c for c in rec.full_name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_') or f"recipient_{idx}"
                safe_event = "".join(c for c in job.event_name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_') or "certificate"
                base_fname = f"{safe_name}_{safe_event}"

                if fmt == "pdf":
                    ext = "pdf"
                    file_content = pdf_bytes
                else:
                    pdf = pdfium.PdfDocument(pdf_bytes)
                    page = pdf[0]
                    # Render high resolution 300 DPI
                    pil_image = page.render(scale=300 / 72).to_pil()
                    img_io = io.BytesIO()
                    if fmt == "png":
                        pil_image.save(img_io, format="PNG")
                        ext = "png"
                    else:
                        if pil_image.mode in ("RGBA", "P"):
                            pil_image = pil_image.convert("RGB")
                        pil_image.save(img_io, format="JPEG", quality=95)
                        ext = "jpg" if fmt == "jpg" else "jpeg"
                    file_content = img_io.getvalue()

                filename = f"{base_fname}.{ext}"
                if filename in used_filenames:
                    filename = f"{base_fname}_{idx}.{ext}"
                used_filenames.add(filename)

                zip_file.writestr(filename, file_content)
            except Exception as e:
                print(f"Failed to include recipient {rec.id} in zip: {e}")
                
    zip_buffer.seek(0)
    zip_bytes = zip_buffer.getvalue()
    
    headers = {
        'Content-Disposition': f'attachment; filename="certificates_{job_id[:8]}_{fmt}.zip"',
        'Content-Length': str(len(zip_bytes))
    }
    
    return Response(
        content=zip_bytes, 
        media_type="application/zip", 
        headers=headers
    )

@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
def delete_job(job_id: str, db: Session = Depends(get_db)):
    """Hard deletes the batch job, all associated recipients, and generated PDF files."""
    success = JobService.delete_job(db, job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job and all associated certificates permanently deleted", "job_id": job_id}
