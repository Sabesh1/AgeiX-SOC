"""
AegisX SOC - Incidents & Forensic Dossiers Router
"""
from fastapi import APIRouter, HTTPException
import json
from typing import List, Dict, Any
from backend.database import get_db

router = APIRouter(prefix="/api/incidents", tags=["Incidents & Forensics"])

@router.get("")
def list_incidents() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT id, title, threat_type as threatType, severity, 
                   severity || '_badge' as severityBadge, asset, asset_category as assetCategory,
                   source, timestamp, risk_score as riskScore, confidence_score as confidenceScore,
                   assigned_agent as assignedAgent, status, status || '_badge' as statusBadge
            FROM incidents
            ORDER BY risk_score DESC;
        """).fetchall()

    return [dict(r) for r in rows]

@router.get("/{incident_id}")
def get_incident_detail(incident_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        row = cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Incident not found")

    res = dict(row)
    if res.get("timeline_json"):
        res["timeline"] = json.loads(res["timeline_json"])
    if res.get("evidence_json"):
        res["evidence"] = json.loads(res["evidence_json"])
    if res.get("decision_trace_json"):
        res["decisionTrace"] = json.loads(res["decision_trace_json"])
    if res.get("affected_systems"):
        res["affectedSystems"] = [s.strip() for s in res["affected_systems"].split(",")]

    return res
