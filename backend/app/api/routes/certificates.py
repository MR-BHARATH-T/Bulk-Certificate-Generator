import io
import os
import pypdfium2 as pdfium
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.job_service import JobService
from app.services.storage_service import storage_service
from app.core.config import settings

router = APIRouter()

def export_certificate_file(file_path: str, base_filename: str, export_format: str = "pdf"):
    """
    Returns the certificate in the requested format (pdf, png, jpg, jpeg).
    For image formats, rasterizes the PDF using pypdfium2 at 300 DPI for print-quality sharpness.
    """
    fmt = (export_format or "pdf").lower().strip()
    if fmt == "pdf":
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"{base_filename}.pdf"
        )
    
    if fmt not in ("png", "jpg", "jpeg"):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format '{fmt}'. Supported formats: pdf, png, jpg, jpeg"
        )
        
    try:
        pdf = pdfium.PdfDocument(file_path)
        if len(pdf) == 0:
            raise HTTPException(status_code=500, detail="Certificate document has no pages")
        
        # 300 DPI scale factor: 300 / 72 ≈ 4.16666667
        page = pdf[0]
        pil_image = page.render(scale=300 / 72).to_pil()
        
        img_buffer = io.BytesIO()
        if fmt == "png":
            pil_image.save(img_buffer, format="PNG")
            media_type = "image/png"
            out_ext = "png"
        else: # "jpg" or "jpeg"
            if pil_image.mode in ("RGBA", "P"):
                pil_image = pil_image.convert("RGB")
            pil_image.save(img_buffer, format="JPEG", quality=95)
            media_type = "image/jpeg"
            out_ext = "jpg" if fmt == "jpg" else "jpeg"
            
        img_buffer.seek(0)
        return Response(
            content=img_buffer.getvalue(),
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{base_filename}.{out_ext}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export certificate as {fmt.upper()}: {str(e)}")

@router.get("/")
def list_certificates(query: str = None, limit: int = 50, db: Session = Depends(get_db)):
    """Lists and searches certificates across batches."""
    recipients = JobService.list_certificates(db, query=query, limit=limit)
    results = []
    job_cache = {}
    for rec in recipients:
        if rec.job_id not in job_cache:
            job_cache[rec.job_id] = JobService.get_job(db, rec.job_id)
        job = job_cache[rec.job_id]
        results.append({
            "id": rec.id.hex,
            "certificate_id": rec.certificate_id,
            "full_name": rec.full_name,
            "email": rec.email,
            "status": rec.status.value if hasattr(rec.status, "value") else str(rec.status),
            "job_id": rec.job_id.hex,
            "event_name": job.event_name if job else "Certificate",
            "organization_name": job.organization_name if job else "",
            "issue_date": job.issue_date.isoformat() if job and job.issue_date else None,
            "created_at": rec.created_at.isoformat() if rec.created_at else None,
            "has_file": bool(rec.storage_path and os.path.exists(os.path.join(settings.LOCAL_STORAGE_DIR, rec.storage_path)))
        })
    return results

@router.get("/{certificate_id}")
def get_certificate(certificate_id: str, request: Request, db: Session = Depends(get_db)):
    recipient = JobService.get_certificate_by_id(db, certificate_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    if recipient.status != "COMPLETED" or not recipient.storage_path:
        raise HTTPException(status_code=400, detail="Certificate is not ready or failed to generate")
        
    job = JobService.get_job(db, recipient.job_id)
    safe_rec_name = "".join(c for c in recipient.full_name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    safe_event_name = "".join(c for c in job.event_name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_') if job else "Certificate"
    formatted_filename = f"{safe_rec_name}_{safe_event_name}.pdf"

    try:
        base_url = str(request.base_url).rstrip('/')
        download_url = f"{base_url}/api/v1/certificates/{certificate_id}/download"
        view_url = f"{base_url}/api/v1/certificates/{certificate_id}/view"
        return {
            "certificate_id": recipient.certificate_id,
            "filename": formatted_filename,
            "download_url": download_url,
            "download_urls": {
                "pdf": f"{download_url}?format=pdf",
                "png": f"{download_url}?format=png",
                "jpg": f"{download_url}?format=jpg",
                "jpeg": f"{download_url}?format=jpeg"
            },
            "view_url": view_url,
            "expires_in": 3600
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not generate download link")

@router.get("/{certificate_id}/view")
def view_certificate_by_id(certificate_id: str, db: Session = Depends(get_db)):
    """Serves the PDF for inline browser viewing."""
    recipient = JobService.get_certificate_by_id(db, certificate_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    if recipient.status != "COMPLETED" or not recipient.storage_path:
        raise HTTPException(status_code=400, detail="Certificate is not ready or failed to generate")

    file_path = os.path.join(settings.LOCAL_STORAGE_DIR, recipient.storage_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        content_disposition_type="inline"
    )

@router.get("/{certificate_id}/download")
def download_certificate_by_id(
    certificate_id: str, 
    format: str = Query("pdf", description="Export format: pdf, png, jpg, jpeg"),
    db: Session = Depends(get_db)
):
    """Downloads certificate with friendly filename formatted as [RecipientName]_[EventName].[ext]"""
    recipient = JobService.get_certificate_by_id(db, certificate_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    if recipient.status != "COMPLETED" or not recipient.storage_path:
        raise HTTPException(status_code=400, detail="Certificate is not ready or failed to generate")

    job = JobService.get_job(db, recipient.job_id)
    safe_rec_name = "".join(c for c in recipient.full_name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    safe_event_name = "".join(c for c in job.event_name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_') if job else "Certificate"
    base_filename = f"{safe_rec_name}_{safe_event_name}"

    # Read file from local storage
    file_path = os.path.join(settings.LOCAL_STORAGE_DIR, recipient.storage_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return export_certificate_file(file_path, base_filename, format)

@router.get("/download/{job_id}/{filename}")
def download_local_certificate(
    job_id: str, 
    filename: str, 
    format: str = Query("pdf", description="Export format: pdf, png, jpg, jpeg")
):
    """Serves the generated certificate file from the local disk in the requested format."""
    file_path = os.path.join(settings.LOCAL_STORAGE_DIR, job_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    base_filename = os.path.splitext(filename)[0]
    return export_certificate_file(file_path, base_filename, format)

@router.delete("/{certificate_id}", status_code=status.HTTP_200_OK)
def delete_certificate(certificate_id: str, db: Session = Depends(get_db)):
    """Hard deletes the individual certificate record and generated PDF from disk."""
    success = JobService.delete_certificate(db, certificate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"message": "Certificate permanently deleted", "certificate_id": certificate_id}

