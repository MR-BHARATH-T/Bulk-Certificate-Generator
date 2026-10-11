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
        description: str = None,
        presentation_text: str = None,
        certificate_title: str = "Certificate of Completion",
        theme_key: str = "royal_gold",
        border_style: str = "classic_prestige",
        signatory_name: str = "Dr. Arthur Pendelton",
        signatory_title: str = "Dean of Computer Engineering",
        logo_url: str = None
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
            description=description.strip() if description else None,
            presentation_text=presentation_text.strip() if presentation_text else None,
            certificate_title=certificate_title.strip() if certificate_title else "Certificate of Completion",
            theme_key=theme_key.strip() if theme_key else "royal_gold",
            border_style=border_style.strip() if border_style else "classic_prestige",
            signatory_name=signatory_name.strip() if signatory_name else "Dr. Arthur Pendelton",
            signatory_title=signatory_title.strip() if signatory_title else "Dean of Computer Engineering",
            logo_url=logo_url.strip() if logo_url else None
        )
