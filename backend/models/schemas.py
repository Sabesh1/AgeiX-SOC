"""
AegisX SOC - Pydantic Request & Response Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class KPISchema(BaseModel):
    activeThreats: Dict[str, Any]
    criticalIncidents: Dict[str, Any]
    eventsProcessed: Dict[str, Any]
    assetsAtRisk: Dict[str, Any]
    aiInvestigations: Dict[str, Any]
    automatedResponses: Dict[str, Any]

class ThreatEventSchema(BaseModel):
    time: str
    source: str
    type: str
    severity: str
    asset: str
    classification: str
    status: str

class AgentSchema(BaseModel):
    id: str
    name: str
    role: str
    status: str
    confidence: int
    accuracy: str
    latency: str
    tasks_completed: int
    current_task: str
    last_action: str
    autonomy_level: str
    description: Optional[str] = None
    avatar_bg: Optional[str] = None
    avatar_color: Optional[str] = None
    initials: Optional[str] = None

class AgentConfigUpdate(BaseModel):
    autonomy_level: str
    confidence_threshold: int = Field(ge=50, le=99)
    broadcast_telemetry: bool = True

class IncidentSchema(BaseModel):
    id: str
    title: str
    threat_type: str
    severity: str
    asset: str
    asset_category: str
    source: str
    timestamp: str
    risk_score: int
    confidence_score: int
    assigned_agent: str
    status: str
    summary: Optional[str] = None
    affected_systems: Optional[List[str]] = None
    potential_impact: Optional[str] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    evidence: Optional[Dict[str, Any]] = None
    decision_trace: Optional[List[Dict[str, Any]]] = None

class SOARActionRequest(BaseModel):
    recommendation_id: str
    action: str = Field(..., pattern="^(approve|reject|dry_run|rollback)$")
    analyst_name: str = "Alex Vance"
    clearance_tier: str = "Tier 3 Lead Analyst"
    comment: Optional[str] = None

class CopilotChatRequest(BaseModel):
    query: str
    incident_id: Optional[str] = "INC-2048"
    analyst_name: str = "Alex Vance"

class CopilotChatResponse(BaseModel):
    text: str
    confidence: str
    recommendation: str
    points: Optional[List[str]] = None
    cards: Optional[List[Dict[str, Any]]] = None

class ReportGenerateRequest(BaseModel):
    report_type: str
    incident_id: Optional[str] = "INC-2048"
    format: str = "json"  # json, markdown, html
