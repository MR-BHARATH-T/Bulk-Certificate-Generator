import os
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.base_dir = settings.LOCAL_STORAGE_DIR
        # Ensure base directory exists
        os.makedirs(self.base_dir, exist_ok=True)

    def upload_pdf(self, job_id: str, recipient_id: str, pdf_bytes: bytes) -> str:
        """
        Saves a PDF to the local file system and returns the relative path.
        Path format: {job_id}/{recipient_id}.pdf
        """
        # Create job-specific directory
        job_dir = os.path.join(self.base_dir, job_id)
        os.makedirs(job_dir, exist_ok=True)
        
        path = os.path.join(job_id, f"{recipient_id}.pdf")
        full_path = os.path.join(self.base_dir, path)
        
        try:
            with open(full_path, "wb") as f:
                f.write(pdf_bytes)
            return path
        except Exception as e:
            print(f"Error saving to local storage: {e}")
            raise RuntimeError(f"Storage save failed: {str(e)}")
            
    def get_signed_url(self, path: str, request_base_url: str = "http://localhost:8000") -> str:
        """
        Returns a local download URL.
        (Since we are running locally, we just point to our own API endpoint).
        """
        # Path is in format job_id/recipient_id.pdf
        # We can route this to a local download endpoint
        return f"{request_base_url}/api/v1/certificates/download/{path}"
            
    def download_file(self, path: str) -> bytes:
        """
        Reads a file synchronously from local storage.
        Useful for zipping files together.
        """
        full_path = os.path.join(self.base_dir, path)
        try:
            with open(full_path, "rb") as f:
                return f.read()
        except Exception as e:
            print(f"Error reading from local storage: {e}")
            raise RuntimeError(f"Storage read failed: {str(e)}")

storage_service = StorageService()
