from datetime import datetime
from app.templates.certificate_template import generate_certificate_pdf

class CertificateService:
    @staticmethod
    def create_certificate(
        full_name: str,
        event_name: str,
        organization_name: str,
        issue_date: datetime,
        certificate_id: str,
        description: str = None
    ) -> bytes:
        """
        Creates a certificate and returns PDF bytes.
        Validates basic constraints before generation.
        """
        if not full_name or not full_name.strip():
            raise ValueError("Full name cannot be empty")
            
        if not event_name or not event_name.strip():
            raise ValueError("Event name cannot be empty")
            
        return generate_certificate_pdf(
            full_name=full_name.strip(),
            event_name=event_name.strip(),
            organization_name=organization_name.strip(),
            issue_date=issue_date,
            certificate_id=certificate_id,
            description=description.strip() if description else None
        )
