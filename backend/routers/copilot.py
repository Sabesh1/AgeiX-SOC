"""
AegisX SOC - Aegis AI Copilot Router
Provides conversational multi-agent synthesis, evidence summarization, and action recommendations.
"""
from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import CopilotChatRequest, CopilotChatResponse

router = APIRouter(prefix="/api/copilot", tags=["Aegis AI Copilot"])

# Knowledge library for cyber intelligence queries
COPILOT_KNOWLEDGE = {
    "critical": {
        "text": "I have identified **2 Active Critical Incidents** requiring urgent triage:",
        "cards": [
            {"id": "INC-2048", "title": "Ransomware Staging on DB-SERVER-04", "risk": "98% Risk", "agent": "Hunter Agent", "action": "Requires Quarantine Approval"},
            {"id": "INC-2049", "title": "APT29 Kerberoasting on AD-DC-01", "risk": "94% Risk", "agent": "Hunter Agent", "action": "Investigating"}
        ],
        "confidence": "98%",
        "recommendation": "Prioritize approval of the isolation command for DB-SERVER-04 to prevent encryption execution."
    },
    "risk": {
        "text": "Incident **INC-2048** is scored at **98/100 (CRITICAL)** based on 4 compounding factors calculated by the Risk Agent:",
        "points": [
            "**Tier-0 Crown Jewel**: Target asset DB-SERVER-04 stores unencrypted customer transactional records and PII.",
            "**Adversary Privilege**: Threat actor has achieved SYSTEM privilege via LSASS injection (Mimikatz).",
            "**Destructive Capability**: Ransomware binary db_sync.exe has already initiated volume shadow copy deletion.",
            "**Attribution**: C2 infrastructure matches active FIN12/LockBit syndicate known for multi-million dollar extortion."
        ],
        "confidence": "96%",
        "recommendation": "Authorize immediate network isolation to contain blast radius."
    },
    "ip": {
        "text": "Comprehensive CTI telemetry for IP `185.220.101.5`:",
        "points": [
            "**Geo Location**: Bucharest, Romania (AS202425 IP Volume Inc)",
            "**Threat Category**: High-Confidence Tor Exit Node / Cobalt Strike C2",
            "**Global Sightings**: 481 detections across 32 corporate networks in the last 72 hours",
            "**Reputation Score**: Malicious (VirusTotal 74/88 vendors flagged)",
            "**Associated MITRE TTPs**: T1071.001 (Web Protocols), T1090.003 (Tor Multi-hop Proxy)"
        ],
        "confidence": "99%",
        "recommendation": "Global perimeter block is already active. Audit all internal endpoints communicating with this IP over port 443."
    },
    "attack": {
        "text": "The attack sequence on **DB-SERVER-04** began at 13:58 UTC via VPN credential stuffing, using valid credentials for svc_dbbackup. Within 5 minutes, the adversary injected into lsass.exe, forged an elevated Kerberos ticket, traversed laterally via WMI, and staged the LockBit 3.0 encrypter.",
        "confidence": "95%",
        "recommendation": "View the full step-by-step kill-chain on the Incident Details page."
    },
    "asset": {
        "text": "Currently **3 enterprise assets** are within the direct compromise boundary:",
        "points": [
            "**DB-SERVER-04** (10.10.40.18): Active compromise with staged ransomware.",
            "**AD-DC-01** (10.10.10.4): Target of forged Kerberos Golden Ticket negotiation.",
            "**BACKUP-NAS-02** (10.10.50.6): Attempted SMB connection logged; blocked by Response Agent."
        ],
        "confidence": "97%",
        "recommendation": "Enforce network segmentation between DB subnet (10.10.40.0/24) and Backup subnet (10.10.50.0/24)."
    },
    "response": {
        "text": "Response Agent and Risk Agent have formulated a 4-step containment playbook for **INC-2048**:",
        "points": [
            "1. **Isolate DB-SERVER-04** (Cut network adapter via EDR API while preserving RAM dump for memory forensics)",
            "2. **Revoke Active Directory Session** for user svc_dbbackup",
            "3. **Deploy remediation script** to delete C:\\ProgramData\\db_sync.exe",
            "4. **Mount immutable snapshots** for DB-SERVER-04 from isolated backup vault"
        ],
        "confidence": "94%",
        "recommendation": "Click 'Approve Response' in the Automated Response tab to execute steps 1 & 2 immediately."
    },
    "report": {
        "text": "Reporter Agent has compiled the official **Forensic Dossier & Executive Brief** for INC-2048.",
        "points": [
            "**Report Title**: Incident Report: LockBit 3.0 Ransomware Containment (INC-2048)",
            "**Compliance Coverage**: NIST CSF 2.0 (RS.CO-03, RS.AN-01), CERT-In Cyber Incident Reporting Guidelines",
            "**Artifacts Included**: 4 SHA-256 binary hashes, 5 PCAP flow records, 3 affected host forensic timelines"
        ],
        "confidence": "100%",
        "recommendation": "Navigating to Reports screen or click 'Export PDF' to download the finalized executive document."
    }
}

@router.post("/chat", response_model=CopilotChatResponse)
def chat_with_copilot(req: CopilotChatRequest):
    q = req.query.lower()
    matched_entry = None

    for key, entry in COPILOT_KNOWLEDGE.items():
        if key in q:
            matched_entry = entry
            break

    if not matched_entry:
        matched_entry = {
            "text": f"Cross-agent neural synthesis for query: **\"{req.query}\"**",
            "points": [
                "**Sentinel Agent**: Ingesting 10 perimeter sensor streams; 0 active bypasses detected.",
                "**Hunter Agent**: Active investigation running on INC-2048 (DB-SERVER-04).",
                "**Risk Agent**: Overall enterprise posture remains ELEVATED (74/100)."
            ],
            "confidence": "92%",
            "recommendation": "Try asking 'Show me all critical threats' or 'Recommend a response'."
        }

    return CopilotChatResponse(
        text=matched_entry["text"],
        confidence=matched_entry["confidence"],
        recommendation=matched_entry["recommendation"],
        points=matched_entry.get("points"),
        cards=matched_entry.get("cards")
    )
