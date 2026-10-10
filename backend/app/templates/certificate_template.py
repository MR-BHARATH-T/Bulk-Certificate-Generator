import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def generate_certificate_pdf(
    full_name: str,
    event_name: str,
    organization_name: str,
    issue_date: datetime,
    certificate_id: str,
    description: str = None
) -> bytes:
    """
    Generates a PDF certificate in memory and returns the raw bytes.
    Uses basic fonts to avoid needing external font files for this example.
    """
    packet = io.BytesIO()
    
    # A4 landscape dimensions: 841.89 x 595.27 points
    c = canvas.Canvas(packet, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # Add a border
    c.setStrokeColor(colors.HexColor("#2C3E50"))
    c.setLineWidth(5)
    c.rect(0.5*inch, 0.5*inch, width - 1*inch, height - 1*inch)
    
    # Inner border
    c.setStrokeColor(colors.HexColor("#34495E"))
    c.setLineWidth(1)
    c.rect(0.6*inch, 0.6*inch, width - 1.2*inch, height - 1.2*inch)

    # Title
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(colors.HexColor("#2C3E50"))
    c.drawCentredString(width / 2.0, height - 2*inch, "CERTIFICATE OF COMPLETION")
    
    # Organization
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.HexColor("#7F8C8D"))
    c.drawCentredString(width / 2.0, height - 2.5*inch, f"Presented by {organization_name}")

    # "This is to certify that"
    c.setFont("Helvetica-Oblique", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2.0, height - 3.5*inch, "This is to certify that")
    
    # Name
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(colors.HexColor("#2980B9"))
    c.drawCentredString(width / 2.0, height - 4.2*inch, full_name)
    
    # "has successfully completed"
    c.setFont("Helvetica-Oblique", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2.0, height - 4.8*inch, "has successfully completed")
    
    # Event
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(colors.HexColor("#2C3E50"))
    c.drawCentredString(width / 2.0, height - 5.5*inch, event_name)
    
    # Description
    if description:
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2.0, height - 6.0*inch, description)
    
    # Date and Signature line
    c.setFont("Helvetica", 12)
    formatted_date = issue_date.strftime("%B %d, %Y")
    
    # Left side - Date
    c.drawString(1.5*inch, 1.5*inch, f"Date: {formatted_date}")
    c.line(1.5*inch, 1.4*inch, 3.5*inch, 1.4*inch)
    
    # Right side - Signature placeholder
    c.drawString(width - 3.5*inch, 1.5*inch, "Authorized Signature")
    c.line(width - 3.5*inch, 1.4*inch, width - 1.5*inch, 1.4*inch)
    
    # Certificate ID
    c.setFont("Courier", 10)
    c.setFillColor(colors.HexColor("#95A5A6"))
    c.drawString(0.8*inch, 0.8*inch, f"ID: {certificate_id}")
    
    c.showPage()
    c.save()
    
    packet.seek(0)
    return packet.getvalue()
