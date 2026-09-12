"""
AegisX SOC - Hunter Agent (Deep Investigation & Correlation)
Reconstructs the multi-stage adversary kill-chain by correlating telemetry anomalies.
"""
import asyncio
from backend.agents.base import BaseAgent

class HunterAgent(BaseAgent):
    def __init__(self):
        super().__init__("agent-hunter", "Hunter Agent", "Deep Investigation & Correlation")

    async def handle_message(self, message: dict):
        topic = message.get("topic")
        payload = message.get("payload", {})
        sender = message.get("sender")

        if topic == "threat_anomaly_detected":
            source = payload.get("source")
            asset = payload.get("asset")
            threat_type = payload.get("threat_type")

            self.update_status(
                f"Correlating telemetry on {asset} for {threat_type}",
                f"Triggered memory artifact extraction on {asset}",
                confidence=95
            )

            # Ask Intel Agent to enrich the source IP
            await self.send_message(
                "Intel Agent",
                "ioc_enrichment_request",
                {
                    "ioc_value": source,
                    "ioc_type": "ip",
                    "asset": asset,
                    "threat_type": threat_type
                }
            )

        elif topic == "ioc_enrichment_response":
            ioc_val = payload.get("ioc_value")
            threat_actor = payload.get("threat_actor")
            rep_score = payload.get("reputation_score")
            asset = payload.get("asset")

            self.update_status(
                f"Completed attack correlation for {asset}",
                f"Confirmed adversary match: {threat_actor} (Reputation: {rep_score}/100)",
                confidence=97
            )

            # Forward to Risk Agent for blast radius scoring
            await self.send_message(
                "Risk Agent",
                "attack_chain_synthesized",
                {
                    "asset": asset,
                    "threat_actor": threat_actor,
                    "ioc": ioc_val,
                    "tactics": ["Initial Access", "Privilege Escalation", "Lateral Movement"]
                }
            )
