import io
import os
import math
import base64
from datetime import datetime, date
from PIL import Image
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader, simpleSplit

# Design Themes aligned 1:1 with frontend THEMES
THEMES = {
    "royal_gold": {
        "id": "royal_gold",
        "name": "Classic Navy & Gold",
        "bg": "#FCFCFA",
        "outerBorder": "#0F172A",
        "innerBorder": "#D4AF37",
        "cornerAccent": "#D4AF37",
        "primaryText": "#0F172A",
        "accentText": "#B45309",
        "nameColor": "#1E3A8A",
        "sealBg": "#0F172A",
        "sealRing": "#FEF3C7",
        "sealRibbon": "#B45309",
        "badgeText": "VERIFIED CREDENTIAL"
    },
    "emerald_prestige": {
        "id": "emerald_prestige",
        "name": "Emerald Prestige",
        "bg": "#F8FAF8",
        "outerBorder": "#064E3B",
        "innerBorder": "#10B981",
        "cornerAccent": "#059669",
        "primaryText": "#064E3B",
        "accentText": "#047857",
        "nameColor": "#065F46",
        "sealBg": "#064E3B",
        "sealRing": "#D1FAE5",
        "sealRibbon": "#065F46",
        "badgeText": "HONOR OF EXCELLENCE"
    },
    "crimson_honor": {
        "id": "crimson_honor",
        "name": "Crimson & Burgundy",
        "bg": "#FFFDFD",
        "outerBorder": "#881337",
        "innerBorder": "#E11D48",
        "cornerAccent": "#BE123C",
        "primaryText": "#881337",
        "accentText": "#BE123C",
        "nameColor": "#9F1239",
        "sealBg": "#881337",
        "sealRing": "#FFE4E6",
        "sealRibbon": "#881337",
        "badgeText": "OFFICIAL MERIT"
    },
    "sapphire_elite": {
        "id": "sapphire_elite",
        "name": "Sapphire & Steel",
        "bg": "#F8FAFC",
        "outerBorder": "#1E293B",
        "innerBorder": "#3B82F6",
        "cornerAccent": "#2563EB",
        "primaryText": "#0F172A",
        "accentText": "#2563EB",
        "nameColor": "#1D4ED8",
        "sealBg": "#1E293B",
        "sealRing": "#DBEAFE",
        "sealRibbon": "#1E3A8A",
        "badgeText": "AUTHENTICATED"
    },
    "monochrome_luxe": {
        "id": "monochrome_luxe",
        "name": "Monochrome Slate",
        "bg": "#FAFBFD",
        "outerBorder": "#1E293B",
        "innerBorder": "#64748B",
        "cornerAccent": "#475569",
        "primaryText": "#0F172A",
        "accentText": "#475569",
        "nameColor": "#0F172A",
        "sealBg": "#1E293B",
        "sealRing": "#F1F5F9",
        "sealRibbon": "#1E293B",
        "badgeText": "DISTINGUISHED"
    }
}

# ----------------------------------------------------------------------
# 1. BORDER FRAME TEMPLATES (Top-Bottom-Right-Left & Ornate Corners)
# ----------------------------------------------------------------------

def draw_victorian_corner_filigree(c, cx, cy, rotation_deg, scale, color):
    """
    Renders the exact Victorian Ornate Corner Filigree from CertificatePreview.jsx:
    SVG viewBox: 0 0 32 32
    d='M 2,16 C 2,8 8,2 16,2 M 2,24 C 2,12 12,2 24,2 M 2,30 C 2,16 16,2 30,2 M 2,2 L 8,8'
    """
    c.saveState()
    c.translate(cx, cy)
    c.rotate(rotation_deg)
    c.scale(scale, scale)
    c.setStrokeColor(color)
    c.setLineWidth(1.2)
    c.setLineCap(1)

    # Path 1: M 2,16 C 2,8 8,2 16,2
    p1 = c.beginPath()
    p1.moveTo(2, -16)
    p1.curveTo(2, -8, 8, -2, 16, -2)
    c.drawPath(p1, stroke=1, fill=0)

    # Path 2: M 2,24 C 2,12 12,2 24,2
    p2 = c.beginPath()
    p2.moveTo(2, -24)
    p2.curveTo(2, -12, 12, -2, 24, -2)
    c.drawPath(p2, stroke=1, fill=0)

    # Path 3: M 2,30 C 2,16 16,2 30,2
    p3 = c.beginPath()
    p3.moveTo(2, -30)
    p3.curveTo(2, -16, 16, -2, 30, -2)
    c.drawPath(p3, stroke=1, fill=0)

    # Path 4: M 2,2 L 8,8
    p4 = c.beginPath()
    p4.moveTo(2, -2)
    p4.lineTo(8, -8)
    c.drawPath(p4, stroke=1, fill=0)

    c.restoreState()

def draw_geometric_corner_star(c, cx, cy, size, color):
    """
    Renders 4-point geometric star accent from CertificatePreview.jsx:
    d='M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9Z'
    """
    c.saveState()
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(cx, cy + size)
    p.lineTo(cx + size * 0.22, cy + size * 0.22)
    p.lineTo(cx + size, cy)
    p.lineTo(cx + size * 0.22, cy - size * 0.22)
    p.lineTo(cx, cy - size)
    p.lineTo(cx - size * 0.22, cy - size * 0.22)
    p.lineTo(cx - size, cy)
    p.lineTo(cx - size * 0.22, cy + size * 0.22)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

def draw_heraldic_corner_bracket(c, cx, cy, rotation_deg, scale, color):
    """
    Renders Classical Corner Laurel Knots from CertificatePreview.jsx:
    d='M 4,4 H 22 M 4,4 V 22 M 4,4 L 14,14' and circle at (4,4, r=2)
    """
    c.saveState()
    c.translate(cx, cy)
    c.rotate(rotation_deg)
    c.scale(scale, scale)
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(2.0)
    c.setLineCap(1)

    c.line(4, -4, 24, -4)
    c.line(4, -4, 4, -24)
    c.line(4, -4, 15, -15)
    c.circle(4, -4, 2.5, fill=1, stroke=0)
    c.restoreState()

def draw_borders(c, width, height, border_style, theme_colors):
    """
    Draws the exact border frame template chosen by the user:
    - classic_prestige (Classic Heritage)
    - executive_frame (Executive Dual-Line)
    - architectural_gold (Architectural Gold)
    - royal_flourish (Royal Heraldic)
    - clean_minimal (Clean Minimalist)
    """
    outer_c = colors.HexColor(theme_colors["outerBorder"])
    inner_c = colors.HexColor(theme_colors["innerBorder"])
    accent_c = colors.HexColor(theme_colors["cornerAccent"])

    style = border_style or "classic_prestige"

    if style == "classic_prestige":
        # 1. Inset 18pt subtle single hairline (border border-opacity-40)
        c.setStrokeColor(inner_c)
        c.setLineWidth(0.8)
        c.rect(18, 18, width - 36, height - 36, stroke=1, fill=0)

        # 2. Inset 28pt double border (border-2 border-double border-opacity-70)
        c.setLineWidth(1.6)
        c.rect(28, 28, width - 56, height - 56, stroke=1, fill=0)
        c.setLineWidth(0.6)
        c.rect(32, 32, width - 64, height - 64, stroke=1, fill=0)

        # 3. Victorian Ornate Corner Filigrees at 4 corners
        f_scale = 1.15
        draw_victorian_corner_filigree(c, 28, height - 28, 0, f_scale, accent_c)       # Top-Left
        draw_victorian_corner_filigree(c, width - 28, height - 28, -90, f_scale, accent_c) # Top-Right
        draw_victorian_corner_filigree(c, 28, 28, 90, f_scale, accent_c)              # Bottom-Left
        draw_victorian_corner_filigree(c, width - 28, 28, 180, f_scale, accent_c)          # Bottom-Right

    elif style == "executive_frame":
        # Inset-3 outer border (opacity 30%)
        c.setStrokeColor(outer_c)
        c.setLineWidth(1.2)
        c.rect(18, 18, width - 36, height - 36, stroke=1, fill=0)

        # Inset-5 inner border (opacity 60%)
        c.setStrokeColor(inner_c)
        c.setLineWidth(1.2)
        c.rect(28, 28, width - 56, height - 56, stroke=1, fill=0)

        # Inset-6 dashed border (border border-dashed opacity-40)
        c.setLineWidth(0.8)
        c.setDash(4, 3)
        c.rect(35, 35, width - 70, height - 70, stroke=1, fill=0)
        c.setDash()

        # Modern Corner Square Knots (8x8 pt filled square)
        c.setFillColor(inner_c)
        sq = 7.5
        for sx, sy in [
            (28, height - 28),
            (width - 28, height - 28),
            (28, 28),
            (width - 28, 28)
        ]:
            c.rect(sx - sq/2, sy - sq/2, sq, sq, stroke=0, fill=1)

    elif style == "architectural_gold":
        # Top-bottom prominent horizontal rules with geometric corner stars
        c.setStrokeColor(inner_c)
        c.setLineWidth(2.4)
        c.line(55, height - 28, width - 55, height - 28)
        c.setLineWidth(1.8)
        c.line(55, 28, width - 55, 28)

        # Left-right subtle vertical side hairlines
        c.setLineWidth(1.0)
        c.line(36, 55, 36, height - 55)
        c.line(width - 36, 55, width - 36, height - 55)

        # 4 Corner Geometric Stars
        star_sz = 9.0
        draw_geometric_corner_star(c, 36, height - 28, star_sz, accent_c)
        draw_geometric_corner_star(c, width - 36, height - 28, star_sz, accent_c)
        draw_geometric_corner_star(c, 36, 28, star_sz, accent_c)
        draw_geometric_corner_star(c, width - 36, 28, star_sz, accent_c)

    elif style == "royal_flourish":
        # Triple fluted perimeter with heraldic corner brackets
        c.setStrokeColor(inner_c)
        c.setLineWidth(2.0)
        c.rect(22, 22, width - 44, height - 44, stroke=1, fill=0)

        c.setLineWidth(0.9)
        c.setDash(3, 2.5)
        c.rect(34, 34, width - 68, height - 68, stroke=1, fill=0)
        c.setDash()

        # Classical Corner Laurel Knots
        b_scale = 1.1
        draw_heraldic_corner_bracket(c, 24, height - 24, 0, b_scale, accent_c)
        draw_heraldic_corner_bracket(c, width - 24, height - 24, -90, b_scale, accent_c)
        draw_heraldic_corner_bracket(c, 24, 24, 90, b_scale, accent_c)
        draw_heraldic_corner_bracket(c, width - 24, 24, 180, b_scale, accent_c)

    else:  # clean_minimal
        # Open parchment with subtle top & bottom hairlines
        c.setStrokeColor(inner_c)
        c.setLineWidth(1.8)
        c.line(80, height - 32, width - 80, height - 32)
        c.setLineWidth(1.2)
        c.line(80, 36, width - 80, 36)

# ----------------------------------------------------------------------
# 2. REPUTED OFFICIAL SEAL MEDALLION (Pixel-for-Pixel matching SVG)
# ----------------------------------------------------------------------

# 36-Point Scalloped Gold Medallion Rosette Polygon Vertices (from SVG viewBox 0..120)
ROSETTE_SVG_VERTICES = [
    (60.0, 3.0), (64.58, 7.7), (69.9, 3.87), (73.59, 9.29), (79.5, 6.44), (82.19, 12.42),
    (88.5, 10.64), (90.11, 16.99), (96.64, 16.34), (97.12, 22.88), (103.66, 23.36), (103.01, 29.89),
    (109.36, 31.5), (107.58, 37.81), (113.56, 40.5), (110.71, 46.41), (116.13, 50.1), (112.3, 55.42),
    (117.0, 60.0), (112.3, 64.58), (116.13, 69.9), (110.71, 73.59), (113.56, 79.5), (107.58, 82.19),
    (109.36, 88.5), (103.01, 90.11), (103.66, 96.64), (97.12, 97.12), (96.64, 103.66), (90.11, 103.01),
    (88.5, 109.36), (82.19, 107.58), (79.5, 113.56), (73.59, 110.71), (69.9, 116.13), (64.58, 112.3),
    (60.0, 117.0), (55.42, 112.3), (50.1, 116.13), (46.41, 110.71), (40.5, 113.56), (37.81, 107.58),
    (31.5, 109.36), (29.89, 103.01), (23.36, 103.66), (22.88, 97.12), (16.34, 96.64), (16.99, 90.11),
    (10.64, 88.5), (12.42, 82.19), (6.44, 79.5), (9.29, 73.59), (3.87, 69.9), (7.7, 64.58),
    (3.0, 60.0), (7.7, 55.42), (3.87, 50.1), (9.29, 46.41), (6.44, 40.5), (12.42, 37.81),
    (10.64, 31.5), (16.99, 29.89), (16.34, 23.36), (22.88, 22.88), (23.36, 16.34), (29.89, 16.99),
    (31.5, 10.64), (37.81, 12.42), (40.5, 6.44), (46.41, 9.29), (50.1, 3.87), (55.42, 7.7)
]

def draw_official_seal(c, seal_x, seal_y, theme_colors):
    """
    Renders ReputedCertificateSeal from CertificatePreview.jsx:
    - 36-Point Scalloped Rosette (theme.innerBorder & theme.cornerAccent)
    - Outer Contrast Rim (theme.primaryText & #FEF3C7)
    - Concentric Beaded Gold Ring
    - Arched Inscriptions: '★ OFFICIAL EXCELLENCE ★' and 'AUTHENTIC CREDENTIAL'
    - Inner Metallic Disc (#0B132B)
    - Heraldic Laurel Leaves
    - 3D Faceted 8-Point Compass Star with 4 facet lighting tones
    - Lower Ribbon Banner with Flanking Tails & 'VERIFIED'
    """
    inner_c = colors.HexColor(theme_colors["innerBorder"])
    corner_c = colors.HexColor(theme_colors["cornerAccent"])
    primary_c = colors.HexColor(theme_colors["primaryText"])
    gold_ring_c = colors.HexColor("#FEF3C7")
    navy_disc_c = colors.HexColor("#0B132B")
    gold_star_c = colors.HexColor("#D4AF37")

    # Scaling factor from SVG 120x120 viewBox to ReportLab points
    s = 0.88  # Resulting diameter ~ 105 points

    c.saveState()
    # Translate to seal center and mirror Y so coordinates match SVG viewBox (0,0 at top-left)
    c.translate(seal_x, seal_y)
    c.scale(s, -s)
    # Center of SVG is at (60, 60), shift so (0,0) is center
    c.translate(-60, -60)

    # 1. 36-POINT SCALLOPED GOLD MEDALLION ROSETTE
    rosette_path = c.beginPath()
    rosette_path.moveTo(ROSETTE_SVG_VERTICES[0][0], ROSETTE_SVG_VERTICES[0][1])
    for vx, vy in ROSETTE_SVG_VERTICES[1:]:
        rosette_path.lineTo(vx, vy)
    rosette_path.close()
    c.setStrokeColor(corner_c)
    c.setLineWidth(1.2)
    c.setFillColor(inner_c)
    c.drawPath(rosette_path, fill=1, stroke=1)

    # 2. OUTER CONTRAST RIM
    c.setFillColor(primary_c)
    c.setStrokeColor(gold_ring_c)
    c.setLineWidth(1.2)
    c.circle(60, 60, 49, fill=1, stroke=1)

    # 3. CONCENTRIC BEADED GOLD RING
    c.setStrokeColor(gold_ring_c)
    c.setLineWidth(1.0)
    c.setDash(3, 2.5)
    c.circle(60, 60, 45.5, fill=0, stroke=1)
    c.setDash()

    # 5. INNER METALLIC CORE DISC
    c.setFillColor(navy_disc_c)
    c.setStrokeColor(gold_star_c)
    c.setLineWidth(1.4)
    c.circle(60, 60, 33, fill=1, stroke=1)
    # Dashed accent inner circle
    c.setLineWidth(0.8)
    c.setDash(2, 2)
    c.circle(60, 60, 30, fill=0, stroke=1)
    c.setDash()

    # 6. HERALDIC LAUREL LEAVES FLANKING CENTER
    c.setStrokeColor(gold_ring_c)
    c.setLineWidth(1.4)
    c.setLineCap(1)

    # Left Laurel Leaves
    lp1 = c.beginPath()
    lp1.moveTo(39, 58)
    lp1.curveTo(37, 50, 41, 42, 47, 38)
    c.drawPath(lp1, stroke=1, fill=0)
    lp2 = c.beginPath()
    lp2.moveTo(38, 54)
    lp2.curveTo(35, 52, 37, 49, 41, 51)
    c.drawPath(lp2, stroke=1, fill=0)
    lp3 = c.beginPath()
    lp3.moveTo(40, 47)
    lp3.curveTo(37, 45, 39, 42, 43, 45)
    c.drawPath(lp3, stroke=1, fill=0)
    lp4 = c.beginPath()
    lp4.moveTo(43, 41)
    lp4.curveTo(40, 38, 43, 36, 46, 40)
    c.drawPath(lp4, stroke=1, fill=0)

    # Right Laurel Leaves
    rp1 = c.beginPath()
    rp1.moveTo(81, 58)
    rp1.curveTo(83, 50, 79, 42, 73, 38)
    c.drawPath(rp1, stroke=1, fill=0)
    rp2 = c.beginPath()
    rp2.moveTo(82, 54)
    rp2.curveTo(85, 52, 83, 49, 79, 51)
    c.drawPath(rp2, stroke=1, fill=0)
    rp3 = c.beginPath()
    rp3.moveTo(80, 47)
    rp3.curveTo(83, 45, 81, 42, 77, 45)
    c.drawPath(rp3, stroke=1, fill=0)
    rp4 = c.beginPath()
    rp4.moveTo(77, 41)
    rp4.curveTo(80, 38, 77, 36, 74, 40)
    c.drawPath(rp4, stroke=1, fill=0)

    # 7. 3D FACETED 8-POINT COMPASS STAR IN CENTER
    def draw_polygon(poly_points, fill_hex):
        c.setFillColor(colors.HexColor(fill_hex))
        p = c.beginPath()
        p.moveTo(poly_points[0][0], poly_points[0][1])
        for ptx, pty in poly_points[1:]:
            p.lineTo(ptx, pty)
        p.close()
        c.drawPath(p, fill=1, stroke=0)

    # Facets - Pure White Highlights (#FFFBEB)
    draw_polygon([(60, 37), (60, 52), (64, 48)], "#FFFBEB")
    draw_polygon([(75, 52), (60, 52), (71, 56)], "#FFFBEB")
    draw_polygon([(60, 67), (60, 52), (56, 56)], "#FFFBEB")
    draw_polygon([(45, 52), (60, 52), (49, 48)], "#FFFBEB")

    # Facets - Amber Shades (#D97706)
    draw_polygon([(60, 37), (60, 52), (56, 48)], "#D97706")
    draw_polygon([(75, 52), (60, 52), (71, 48)], "#D97706")
    draw_polygon([(60, 67), (60, 52), (64, 56)], "#D97706")
    draw_polygon([(45, 52), (60, 52), (49, 56)], "#D97706")

    # Facets - Yellow High Tones (#FDE047)
    draw_polygon([(71, 41), (60, 52), (65, 47)], "#FDE047")
    draw_polygon([(71, 63), (60, 52), (67, 58)], "#FDE047")
    draw_polygon([(49, 63), (60, 52), (55, 57)], "#FDE047")
    draw_polygon([(49, 41), (60, 52), (53, 46)], "#FDE047")

    # Facets - Bronze Deep Tones (#B45309)
    draw_polygon([(71, 41), (60, 52), (67, 46)], "#B45309")
    draw_polygon([(71, 63), (60, 52), (65, 57)], "#B45309")
    draw_polygon([(49, 63), (60, 52), (53, 58)], "#B45309")
    draw_polygon([(49, 41), (60, 52), (55, 47)], "#B45309")

    # 8. ELEGANT LOWER RIBBON BANNER WITH FLANKING TAILS
    # Left Tail
    c.setStrokeColor(colors.HexColor("#78350F"))
    c.setLineWidth(0.6)
    c.setFillColor(colors.HexColor("#92400E"))
    lt = c.beginPath()
    lt.moveTo(26, 73); lt.lineTo(35, 70); lt.lineTo(35, 84); lt.lineTo(26, 81); lt.lineTo(29, 77); lt.close()
    c.drawPath(lt, fill=1, stroke=1)

    # Right Tail
    rt = c.beginPath()
    rt.moveTo(94, 73); rt.lineTo(85, 70); rt.lineTo(85, 84); rt.lineTo(94, 81); rt.lineTo(91, 77); rt.close()
    c.drawPath(rt, fill=1, stroke=1)

    # Central Ribbon Banner
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setLineWidth(0.9)
    cb = c.beginPath()
    cb.moveTo(33, 69); cb.lineTo(87, 69); cb.lineTo(84, 84); cb.lineTo(36, 84); cb.close()
    c.drawPath(cb, fill=1, stroke=1)

    # Ribbon Top Gold Highlight Line
    c.setStrokeColor(gold_ring_c)
    c.setLineWidth(0.7)
    c.line(36, 71, 84, 71)

    # VERIFIED Inscription on Banner
    c.saveState()
    c.translate(60, 78)
    c.scale(1, -1)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 6.2)
    c.drawCentredString(0, 0, "VERIFIED")
    c.restoreState()

    c.restoreState()

    # 9. ARCHED SERIF INSCRIPTIONS ALONG TOP AND BOTTOM PATHS
    r_arc = s * 40.5
    gold_ring_c = colors.HexColor("#FEF3C7")
    c.setFillColor(gold_ring_c)

    # Top Arc: "★ OFFICIAL EXCELLENCE ★"
    top_text = "★ OFFICIAL EXCELLENCE ★"
    c.setFont("Helvetica-Bold", 4.6)
    start_a = 150.0
    end_a = 30.0
    step = (end_a - start_a) / (len(top_text) - 1)
    for i, ch in enumerate(top_text):
        ang = start_a + i * step
        rad = math.radians(ang)
        x = seal_x + r_arc * math.cos(rad)
        y = seal_y + r_arc * math.sin(rad)
        c.saveState()
        c.translate(x, y)
        c.rotate(ang - 90)
        c.drawCentredString(0, 0, ch)
        c.restoreState()

    # Bottom Arc: "AUTHENTIC CREDENTIAL"
    bottom_text = "AUTHENTIC CREDENTIAL"
    c.setFont("Helvetica-Bold", 4.2)
    b_start = 210.0
    b_end = 330.0
    b_step = (b_end - b_start) / (len(bottom_text) - 1)
    for i, ch in enumerate(bottom_text):
        ang = b_start + i * b_step
        rad = math.radians(ang)
        x = seal_x + r_arc * math.cos(rad)
        y = seal_y + r_arc * math.sin(rad)
        c.saveState()
        c.translate(x, y)
        c.rotate(ang + 90)
        c.drawCentredString(0, 0, ch)
        c.restoreState()

# ----------------------------------------------------------------------
# 3. INSTITUTIONAL CREST & LOGO VECTOR DRAWING (Crisp 300+ DPI)
# ----------------------------------------------------------------------

def draw_preset_crest(c, crest_type, cx, cy, target_size=40):
    """
    Renders pure vector versions of the 4 Preset Logos from Dashboard.jsx:
    - academic: University Crest
    - tech: Tech Shield
    - global: Global Laurel
    - merit: Excellence Crown
    """
    scale = target_size / 100.0

    c.saveState()
    c.translate(cx, cy)
    c.scale(scale, -scale)
    c.translate(-50, -50)

    if crest_type == "academic":
        # University Crest
        # Mortarboard Diamond: M50 15 L82 30 L50 45 L18 30 Z fill=#D4AF37 stroke=#92400E
        p = c.beginPath()
        p.moveTo(50, 15); p.lineTo(82, 30); p.lineTo(50, 45); p.lineTo(18, 30); p.close()
        c.setFillColor(colors.HexColor("#D4AF37"))
        c.setStrokeColor(colors.HexColor("#92400E"))
        c.setLineWidth(2.0)
        c.drawPath(p, fill=1, stroke=1)

        # Shield outline: M30 40 V65 C30 75 50 85 50 85 C50 85 70 75 70 65 V40
        sp = c.beginPath()
        sp.moveTo(30, 40); sp.lineTo(30, 65)
        sp.curveTo(30, 75, 50, 85, 50, 85)
        sp.curveTo(50, 85, 70, 75, 70, 65)
        sp.lineTo(70, 40)
        c.setStrokeColor(colors.HexColor("#D4AF37"))
        c.setLineWidth(3.0)
        c.drawPath(sp, fill=0, stroke=1)

        # Center disc: cx=50 cy=60 r=10 fill=#1E3A8A
        c.setFillColor(colors.HexColor("#1E3A8A"))
        c.circle(50, 60, 10, fill=1, stroke=0)

        # Star polygon in crest: 50,54 52,58 56,58 53,61 54,65 50,62 46,65 47,61 44,58 48,58 fill=#D4AF37
        stp = c.beginPath()
        pts = [(50,54), (52,58), (56,58), (53,61), (54,65), (50,62), (46,65), (47,61), (44,58), (48,58)]
        stp.moveTo(pts[0][0], pts[0][1])
        for ptx, pty in pts[1:]:
            stp.lineTo(ptx, pty)
        stp.close()
        c.setFillColor(colors.HexColor("#D4AF37"))
        c.drawPath(stp, fill=1, stroke=0)

    elif crest_type == "tech":
        # Tech Shield
        # Shield body: M50 12 L82 24 V52 C82 72 50 88 50 88 C50 88 18 72 18 52 V24 Z
        p = c.beginPath()
        p.moveTo(50, 12); p.lineTo(82, 24); p.lineTo(82, 52)
        p.curveTo(82, 72, 50, 88, 50, 88)
        p.curveTo(50, 88, 18, 72, 18, 52)
        p.lineTo(18, 24); p.close()
        c.setFillColor(colors.HexColor("#0F172A"))
        c.setStrokeColor(colors.HexColor("#3B82F6"))
        c.setLineWidth(3.0)
        c.drawPath(p, fill=1, stroke=1)

        # Tech Star: 50,30 55,42 68,42 57,50 61,62 50,54 39,62 43,50 32,42 45,42
        pts = [(50,30), (55,42), (68,42), (57,50), (61,62), (50,54), (39,62), (43,50), (32,42), (45,42)]
        stp = c.beginPath()
        stp.moveTo(pts[0][0], pts[0][1])
        for ptx, pty in pts[1:]:
            stp.lineTo(ptx, pty)
        stp.close()
        c.setFillColor(colors.HexColor("#3B82F6"))
        c.drawPath(stp, fill=1, stroke=0)

        # Cyan base dot: cx=50 cy=68 r=4 fill=#60A5FA
        c.setFillColor(colors.HexColor("#60A5FA"))
        c.circle(50, 68, 4, fill=1, stroke=0)

    elif crest_type == "global":
        # Global Laurel
        # Outer green disc: cx=50 cy=50 r=38 fill=#064E3B stroke=#10B981 stroke-width=2.5
        c.setFillColor(colors.HexColor("#064E3B"))
        c.setStrokeColor(colors.HexColor("#10B981"))
        c.setLineWidth(2.5)
        c.circle(50, 50, 38, fill=1, stroke=1)

        # Dashed light-green ring: cx=50 cy=50 r=32 stroke=#D1FAE5 dash=3 2
        c.setStrokeColor(colors.HexColor("#D1FAE5"))
        c.setLineWidth(1.0)
        c.setDash(3, 2)
        c.circle(50, 50, 32, fill=0, stroke=1)
        c.setDash()

        # Star polygon: 50,26 56,40 70,40 58,49 63,63 50,54 37,63 42,49 30,40 44,40 fill=#10B981
        pts = [(50,26), (56,40), (70,40), (58,49), (63,63), (50,54), (37,63), (42,49), (30,40), (44,40)]
        stp = c.beginPath()
        stp.moveTo(pts[0][0], pts[0][1])
        for ptx, pty in pts[1:]:
            stp.lineTo(ptx, pty)
        stp.close()
        c.setFillColor(colors.HexColor("#10B981"))
        c.drawPath(stp, fill=1, stroke=0)

    elif crest_type == "merit":
        # Excellence Crown
        # Crimson circle: cx=50 cy=50 r=38 fill=#881337 stroke=#E11D48 stroke-width=2
        c.setFillColor(colors.HexColor("#881337"))
        c.setStrokeColor(colors.HexColor("#E11D48"))
        c.setLineWidth(2.0)
        c.circle(50, 50, 38, fill=1, stroke=1)

        # Gold crown: M28 64 L28 44 L38 52 L50 36 L62 52 L72 44 L72 64 Z fill=#FBBF24 stroke=#B45309
        cp = c.beginPath()
        cp.moveTo(28, 64); cp.lineTo(28, 44); cp.lineTo(38, 52); cp.lineTo(50, 36)
        cp.lineTo(62, 52); cp.lineTo(72, 44); cp.lineTo(72, 64); cp.close()
        c.setFillColor(colors.HexColor("#FBBF24"))
        c.setStrokeColor(colors.HexColor("#B45309"))
        c.setLineWidth(1.5)
        c.drawPath(cp, fill=1, stroke=1)

        # Crown jewel circles: (50, 34, r=3), (28, 42, r=3), (72, 42, r=3)
        c.setFillColor(colors.HexColor("#FBBF24"))
        c.circle(50, 34, 3, fill=1, stroke=0)
        c.circle(28, 42, 3, fill=1, stroke=0)
        c.circle(72, 42, 3, fill=1, stroke=0)

    c.restoreState()

def draw_organization_logo(c, logo_url, cx, cy, max_w, max_h):
    """
    Draws organization logo or preset crest.
    Handles:
    - 4 Presets ('academic', 'tech', 'global', 'merit', or SVG URI matching)
    - Base64 raster data (data:image/png;base64, data:image/jpeg;base64, etc.)
    - Local file paths
    """
    if not logo_url or not isinstance(logo_url, str):
        return False

    url_str = logo_url.strip()

    # 1. Check for Preset Crest match
    if url_str in ("academic", "University Crest") or "M50 15" in url_str or "M50%2015" in url_str:
        draw_preset_crest(c, "academic", cx, cy, target_size=max_h)
        return True
    if url_str in ("tech", "Tech Shield") or "M50 12" in url_str or "M50%2012" in url_str:
        draw_preset_crest(c, "tech", cx, cy, target_size=max_h)
        return True
    if url_str in ("global", "Global Laurel") or "50,26" in url_str or "50%2C26" in url_str:
        draw_preset_crest(c, "global", cx, cy, target_size=max_h)
        return True
    if url_str in ("merit", "Excellence Crown") or "M28 64" in url_str or "M28%2064" in url_str:
        draw_preset_crest(c, "merit", cx, cy, target_size=max_h)
        return True

    # 2. Check for Base64 raster image (PNG, JPG, WEBP)
    if url_str.startswith("data:image"):
        comma_idx = url_str.find(",")
        if comma_idx != -1:
            header = url_str[:comma_idx]
            raw_data = url_str[comma_idx + 1:]
            if "base64" in header:
                try:
                    img_bytes = base64.b64decode(raw_data)
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    w, h = pil_img.size
                    if w > 0 and h > 0:
                        aspect = w / h
                        draw_w = min(max_w, max_h * aspect)
                        draw_h = draw_w / aspect
                        if draw_h > max_h:
                            draw_h = max_h
                            draw_w = draw_h * aspect
                        c.drawImage(
                            ImageReader(pil_img),
                            cx - draw_w / 2.0,
                            cy - draw_h / 2.0,
                            width=draw_w,
                            height=draw_h,
                            mask="auto"
                        )
                        return True
                except Exception as e:
                    print(f"Error drawing base64 image: {e}")

    # 3. Check for local file path
    if os.path.exists(url_str):
        try:
            pil_img = Image.open(url_str)
            w, h = pil_img.size
            if w > 0 and h > 0:
                aspect = w / h
                draw_w = min(max_w, max_h * aspect)
                draw_h = draw_w / aspect
                if draw_h > max_h:
                    draw_h = max_h
                    draw_w = draw_h * aspect
                c.drawImage(
                    ImageReader(pil_img),
                    cx - draw_w / 2.0,
                    cy - draw_h / 2.0,
                    width=draw_w,
                    height=draw_h,
                    mask="auto"
                )
                return True
        except Exception as e:
            print(f"Error drawing local file logo: {e}")

    return False

# ----------------------------------------------------------------------
# 4. MASTER CERTIFICATE PDF GENERATOR
# ----------------------------------------------------------------------

def generate_certificate_pdf(
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
    Generates an executive vector PDF certificate matching 1:1 with the interactive
    preview in CertificatePreview.jsx across all:
    - 4 Template Presets (Bootcamp, Hackathon, Executive, Academic)
    - 5 Color Themes (Navy & Gold, Emerald, Crimson, Sapphire, Monochrome)
    - 5 Border Frame Templates (Classic, Executive, Architectural, Royal, Minimal)
    - Official Seal Medallions with theme rosette, faceted 3D compass star & ribbon
    - Institutional crests and logos
    """
    packet = io.BytesIO()
    
    # Standard A4 landscape dimensions: 841.89 x 595.27 points
    c = canvas.Canvas(packet, pagesize=landscape(A4))
    width, height = landscape(A4)

    # 1. Resolve Theme Palette
    theme = THEMES.get(theme_key, THEMES["royal_gold"])
    active_border = border_style or "classic_prestige"
    title_text = (certificate_title or "Certificate of Completion").strip().upper()
    intent_text = (presentation_text or "for outstanding dedication, active participation, and successfully mastering").strip()
    sign_name = (signatory_name or "Dr. Arthur Pendelton").strip()
    sign_title = (signatory_title or "Dean of Computer Engineering").strip()
    org_name = (organization_name or "ACADEMIC & PROFESSIONAL CREDENTIAL").strip()
    cert_id_str = certificate_id or "CERT-2026-0001"

    # 2. Paint Canvas Background
    c.setFillColor(colors.HexColor(theme["bg"]))
    c.rect(0, 0, width, height, stroke=0, fill=1)

    # 3. Draw Selected Perimeter Border Frame Template
    draw_borders(c, width, height, active_border, theme)

    # 4. Top Header: Logo Crest & Organization Name
    has_logo = False
    if logo_url:
        has_logo = draw_organization_logo(
            c, logo_url, 
            cx=width / 2.0, 
            cy=height - 54, 
            max_w=140, 
            max_h=38
        )

    if has_logo:
        # Organization Name under logo
        c.setFont("Helvetica-Bold", 11.0)
        c.setFillColor(colors.HexColor(theme["accentText"]))
        c.drawCentredString(width / 2.0, height - 82, org_name.upper())

        # Header divider rule
        c.setStrokeColor(colors.HexColor(theme["innerBorder"]))
        c.setLineWidth(0.8)
        c.line(width / 2.0 - 120, height - 90, width / 2.0 + 120, height - 90)
        header_bottom_y = height - 98
    else:
        # Organization Name with decorative star accents
        c.setFont("Helvetica-Bold", 12.0)
        c.setFillColor(colors.HexColor(theme["accentText"]))
        c.drawCentredString(width / 2.0, height - 64, f"★  {org_name.upper()}  ★")

        # Header divider rule
        c.setStrokeColor(colors.HexColor(theme["innerBorder"]))
        c.setLineWidth(0.8)
        c.line(width / 2.0 - 130, height - 74, width / 2.0 + 130, height - 74)
        header_bottom_y = height - 82

    # ------------------------------------------------------------------
    # 5. DYNAMIC VERTICAL CENTERING (Matches CSS `my-auto` in Preview)
    # ------------------------------------------------------------------
    # Measures all middle block elements (Title, Lead-in, Recipient Name,
    # Presentation Intent, Event Name, Achievement Note) and centers them
    # gracefully between Header Divider and Footer Signature/Seal.
    # ------------------------------------------------------------------

    # Prepare split lines and dimensions for all middle elements
    title_lines = simpleSplit(title_text, "Times-Bold", 30, width - 200)
    h_title = len(title_lines) * 34.0
    gap_title_lead = 16.0

    h_lead = 12.0
    gap_lead_name = 18.0

    h_name = 38.0  # includes recipient name + underline offset
    gap_name_intent = 18.0

    intent_lines = simpleSplit(intent_text, "Helvetica-Oblique", 12.0, width - 260)
    h_intent = len(intent_lines) * 16.0
    gap_intent_event = 16.0

    event_lines = simpleSplit(event_name, "Times-Bold", 24.0, width - 260)
    h_event = len(event_lines) * 28.0

    has_desc = bool(description and description.strip())
    if has_desc:
        gap_event_desc = 16.0
        raw_desc = description.strip()
        quoted_desc = raw_desc if (raw_desc.startswith('"') or raw_desc.startswith('“')) else f'"{raw_desc}"'
        desc_lines = simpleSplit(quoted_desc, "Times-Italic", 13.5, width - 260)
        h_desc = len(desc_lines) * 18.0
    else:
        gap_event_desc = 0.0
        desc_lines = []
        h_desc = 0.0

    # Total height occupied by middle content
    total_middle_h = (
        h_title + gap_title_lead +
        h_lead + gap_lead_name +
        h_name + gap_name_intent +
        h_intent + gap_intent_event +
        h_event + gap_event_desc + h_desc
    )

    # Footer top boundary (top of Signature script & Seal medallion)
    footer_top_y = 156.0

    # Calculate balanced vertical padding matching flexbox `my-auto`
    avail_h = header_bottom_y - footer_top_y
    extra_space = max(avail_h - total_middle_h, 12.0)
    top_padding = extra_space / 2.0

    # Running Y coordinate starting below header
    cur_y = header_bottom_y - top_padding

    # Draw Main Certificate Title (Matches preview font-cinzel text-3xl)
    c.setFont("Times-Bold", 30)
    c.setFillColor(colors.HexColor(theme["primaryText"]))
    for t_line in title_lines:
        c.drawCentredString(width / 2.0, cur_y - 24, t_line)
        cur_y -= 34.0

    cur_y -= gap_title_lead

    # Draw Lead-in "THIS IS PROUDLY PRESENTED TO" with Flanking Gold Rules
    lead_baseline = cur_y - 9
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width / 2.0, lead_baseline, "THIS IS PROUDLY PRESENTED TO")

    c.setStrokeColor(colors.HexColor(theme["innerBorder"]))
    c.setLineWidth(0.8)
    c.line(width / 2.0 - 180, lead_baseline + 3, width / 2.0 - 110, lead_baseline + 3)
    c.line(width / 2.0 + 110, lead_baseline + 3, width / 2.0 + 180, lead_baseline + 3)
    cur_y -= (h_lead + gap_lead_name)

    # Draw Recipient Name (Matches preview font-playfair text-3xl)
    name_baseline = cur_y - 28
    c.setFont("Times-BoldItalic", 34)
    c.setFillColor(colors.HexColor(theme["nameColor"]))
    c.drawCentredString(width / 2.0, name_baseline, full_name)

    # Dynamic Underline matching Recipient Name width
    rec_width = c.stringWidth(full_name, "Times-BoldItalic", 34)
    rec_half = max(rec_width / 2.0 + 18, 90)
    c.setStrokeColor(colors.HexColor(theme["innerBorder"]))
    c.setLineWidth(1.8)
    c.line(width / 2.0 - rec_half, name_baseline - 8, width / 2.0 + rec_half, name_baseline - 8)
    cur_y -= (h_name + gap_name_intent)

    # Draw Presentation Statement / Award Intent (Matches preview text-xs)
    c.setFont("Helvetica-Oblique", 12.0)
    c.setFillColor(colors.HexColor("#475569"))
    for i_line in intent_lines:
        c.drawCentredString(width / 2.0, cur_y - 12, i_line)
        cur_y -= 16.0

    cur_y -= gap_intent_event

    # Draw Event / Course Name (Matches preview text-2xl font-bold)
    c.setFont("Times-Bold", 24.0)
    c.setFillColor(colors.HexColor(theme["primaryText"]))
    for e_line in event_lines:
        c.drawCentredString(width / 2.0, cur_y - 20, e_line)
        cur_y -= 28.0

    # Draw Citation / Achievement Note in Quotation Marks (Matches preview text-sm italic)
    if has_desc:
        cur_y -= gap_event_desc
        c.setFont("Times-Italic", 13.5)
        c.setFillColor(colors.HexColor("#64748B"))
        for d_line in desc_lines:
            c.drawCentredString(width / 2.0, cur_y - 13, d_line)
            cur_y -= 18.0

    # ------------------------------------------------------------------
    # 6. FOOTER SECTION: 3 Columns
    # Left: Date of Issuance
    # Center: Authorized Signatory (with balanced ~45-50pt gap to Achievement Note)
    # Right: Reputed Official Seal Medallion
    # ------------------------------------------------------------------

    # Left Column: Date of Issuance & ID
    date_x = 75
    sig_base_y = 108

    if isinstance(issue_date, (datetime, date)):
        formatted_date = issue_date.strftime("%B %d, %Y")
    else:
        try:
            formatted_date = datetime.fromisoformat(str(issue_date)).strftime("%B %d, %Y")
        except Exception:
            formatted_date = str(issue_date)

    c.setFont("Helvetica-Bold", 11.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(date_x, sig_base_y + 10, formatted_date)

    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setLineWidth(1.0)
    c.line(date_x, sig_base_y + 4, date_x + 130, sig_base_y + 4)

    c.setFont("Helvetica", 9.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(date_x, sig_base_y - 9, "DATE OF ISSUANCE")

    c.setFont("Courier-Bold", 8.5)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawString(date_x, sig_base_y - 22, cert_id_str)

    # Center Column: Authorized Signatory Details (Script matches preview font-signature text-2xl)
    sig_center = width / 2.0

    # Script signature representation
    c.setFont("Times-Italic", 24)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(sig_center, sig_base_y + 14, sign_name)

    # Signatory line matching text width
    sign_w = c.stringWidth(sign_name, "Times-Italic", 24)
    sign_half = max(sign_w / 2.0 + 20, 80)
    c.setStrokeColor(colors.HexColor(theme["innerBorder"]))
    c.setLineWidth(1.2)
    c.line(sig_center - sign_half, sig_base_y + 4, sig_center + sign_half, sig_base_y + 4)

    # Printed Signatory Name & Designation Title
    c.setFont("Helvetica-Bold", 11.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(sig_center, sig_base_y - 10, sign_name)

    c.setFont("Helvetica", 9.0)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(sig_center, sig_base_y - 23, sign_title.upper())

    # Right Column: Reputed Official Seal Medallion (aligned 1:1 with preview)
    seal_x = width - 120
    seal_y = 104
    draw_official_seal(c, seal_x, seal_y, theme)

    c.showPage()
    c.save()

    packet.seek(0)
    return packet.getvalue()
