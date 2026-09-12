"""
AegisX SOC - Threat Intelligence & MITRE ATT&CK Router
"""
from fastapi import APIRouter, Query
from typing import List, Dict, Any
from backend.database import get_db, log_audit_entry

router = APIRouter(prefix="/api/intel", tags=["Threat Intelligence (CTI Hub)"])

@router.get("/search")
def search_intel(q: str = Query(..., min_length=1)) -> Dict[str, Any]:
    search_term = f"%{q.lower()}%"
    with get_db() as conn:
        cursor = conn.cursor()
        iocs = cursor.execute("""
            SELECT ioc_type, value, provider, country, confidence, sightings, threat_actor, category
            FROM threat_intel
            WHERE LOWER(value) LIKE ? OR LOWER(threat_actor) LIKE ?;
        """, (search_term, search_term)).fetchall()

    return {
        "query": q,
        "results": [dict(r) for r in iocs],
        "total": len(iocs)
    }

@router.get("/mitre")
def get_mitre_techniques() -> List[Dict[str, Any]]:
    return [
        {"id": "T1078", "name": "Valid Accounts", "tactic": "Initial Access", "detections": 42, "severity": "critical"},
        {"id": "T1059", "name": "Command & Scripting Interpreter", "tactic": "Execution", "detections": 118, "severity": "critical"},
        {"id": "T1003", "name": "OS Credential Dumping", "tactic": "Credential Access", "detections": 29, "severity": "critical"},
        {"id": "T1021", "name": "Remote Services (WMI/WinRM)", "tactic": "Lateral Movement", "detections": 34, "severity": "high"},
        {"id": "T1071", "name": "Application Layer Protocol", "tactic": "Command & Control", "detections": 86, "severity": "high"},
        {"id": "T1486", "name": "Data Encrypted for Impact", "tactic": "Impact", "detections": 8, "severity": "critical"}
    ]

@router.post("/block")
def block_ioc(value: str, ioc_type: str = "ip") -> Dict[str, Any]:
    sig = log_audit_entry("Analyst (Alex Vance)", f"Perimeter Block Deployed ({ioc_type})", "PERIM-FW-GLOBAL", f"Blocked indicator: {value}")
    return {
        "status": "blocked",
        "value": value,
        "type": ioc_type,
        "verification_signature": sig
    }
