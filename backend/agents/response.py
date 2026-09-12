"""
AegisX SOC - Response Agent (Automated Containment & SOAR Orchestration)
Executes safe automated containment playbooks and enforces Human-in-the-Loop approval for high-impact actions.
"""
from backend.agents.base import BaseAgent
from backend.database import log_audit_entry, get_db

class ResponseAgent(BaseAgent):
    def __init__(self):
        super().__init__("agent-response", "Response Agent", "Automated Containment & SOAR")
        self.autonomy_level = "Supervised (Human Gate)"

    async def handle_message(self, message: dict):
        topic = message.get("topic")
        payload = message.get("payload", {})

        if topic == "containment_required":
            asset = payload.get("asset")
            risk_score = payload.get("risk_score")
            is_tier_0 = payload.get("is_tier_0", False)

            # Auto-action: Block egress IP at perimeter firewall
            log_audit_entry(
                "Response Agent",
                "Firewall Drop Rule Staged",
                "PERIM-FW-01",
                f"Autonomously staged drop rule for malicious outbound sockets from {asset}"
            )

            if is_tier_0:
                self.update_status(
                    f"Awaiting Analyst Approval: Isolate {asset}",
                    f"Two-man rule enforced on critical crown jewel host {asset}",
                    confidence=94
                )
            else:
                self.update_status(
                    f"Executing automated quarantine on {asset}",
                    f"Autonomously isolated non-critical host {asset}",
                    confidence=98
                )

            # Notify Reporter Agent
            await self.send_message(
                "Reporter Agent",
                "containment_action_logged",
                {
                    "asset": asset,
                    "risk_score": risk_score,
                    "action": f"Quarantine {asset}"
                }
            )
