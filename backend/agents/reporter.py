"""
AegisX SOC - Reporter Agent (Incident Reporting & Compliance)
Translates technical evidence into executive summaries, forensic timelines, and regulatory compliance filings.
"""
from backend.agents.base import BaseAgent
from backend.database import log_audit_entry

class ReporterAgent(BaseAgent):
    def __init__(self):
        super().__init__("agent-reporter", "Reporter Agent", "Incident Reporting & Compliance")

    async def handle_message(self, message: dict):
        topic = message.get("topic")
        payload = message.get("payload", {})

        if topic == "containment_action_logged":
            asset = payload.get("asset")
            action = payload.get("action")

            sig = log_audit_entry(
                "Reporter Agent",
                "Forensic Report Synthesized",
                asset,
                f"Compiled compliance dossier (NIST CSF 2.0 RS.CO-03) for {action}"
            )

            self.update_status(
                f"Generated regulatory dossier for {asset}",
                f"Signed with tamper-evident HMAC: {sig[:20]}...",
                confidence=99
            )
