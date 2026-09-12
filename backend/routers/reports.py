"""
AegisX SOC - Reports & Audit Governance Router
"""
from fastapi import APIRouter
from typing import List, Dict, Any
from backend.database import get_db
from backend.models.schemas import ReportGenerateRequest

router = APIRouter(prefix="/api/reports", tags=["Reports & Forensic Dossiers"])

@router.post("/generate")
def generate_report(req: ReportGenerateRequest) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        inc = cursor.execute("SELECT * FROM incidents WHERE id = ?;", (req.incident_id,)).fetchone()
        audit_count = cursor.execute("SELECT COUNT(*) FROM audit_logs;").fetchone()[0]

    title = inc["title"] if inc else "Enterprise SOC Daily Summary"

    if req.format == "markdown":
        md_content = f"""# Executive Incident Forensic Dossier: {title}

- **Incident ID**: {req.incident_id}
- **Classification**: TOP SECRET // TIER-3 EYES ONLY
- **Generated**: 2026-09-12 UTC
- **Regulatory Framework**: NIST CSF 2.0 (RS.CO-03) & CERT-In

## 1. Executive Summary
On September 12, 2026 at 13:58 UTC, the AegisX Autonomous SOC intercepted and neutralized unauthorized intrusion activity targeting crown jewel host DB-SERVER-04.

## 2. Key Metrics
- Mean Time to Detect: 18 Seconds
- Mean Time to Contain: 12.4 Minutes
- Data Compromised: 0.00 MB
- Cryptographic Audit Signatures: {audit_count} Logged
"""
        return {"format": "markdown", "content": md_content}

    return {
        "format": "json",
        "title": title,
        "incident_id": req.incident_id,
        "mean_time_to_detect": "18 Seconds",
        "mean_time_to_contain": "12.4 Minutes",
        "data_exfiltrated": "0.00 MB",
        "compliance": ["NIST CSF 2.0", "ISO 27001", "CERT-In Guidelines"],
        "digest": "sha256:d891b2c4e88910fa21e90b83..."
    }

@router.get("/audit-log")
def get_audit_log(limit: int = 50) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT timestamp, actor, action, target_asset as targetAsset, details, hash_signature as hashSignature
            FROM audit_logs
            ORDER BY id DESC
            LIMIT ?;
        """, (limit,)).fetchall()

    return [dict(r) for r in rows]
