"""
AegisX SOC - Sentinel Agent (Threat Detection)
Continuously monitors perimeter telemetry, network flows, and EDR events to flag anomalies in real time.
"""
import asyncio
import random
from datetime import datetime, timezone
from backend.agents.base import BaseAgent
from backend.database import get_db
from backend.bus import agent_bus

class SentinelAgent(BaseAgent):
    def __init__(self):
        super().__init__("agent-sentinel", "Sentinel Agent", "Threat Detection")
        self.sample_threat_templates = [
            {"source": "185.220.101.5", "type": "Cobalt Strike Beacon", "severity": "CRITICAL", "asset": "DB-SERVER-04", "classification": "Malware C2", "status": "Blocked"},
            {"source": "103.145.13.11", "type": "Blind SQL Injection (xp_cmdshell)", "severity": "HIGH", "asset": "API-GATEWAY-01", "classification": "Web App Attack", "status": "Filtered"},
            {"source": "45.154.255.89", "type": "Kerberos Golden Ticket Negotiation", "severity": "CRITICAL", "asset": "AD-DC-01", "classification": "Privilege Escalation", "status": "Under Review"},
            {"source": "194.26.29.112", "type": "SSH Password Spray (Port 22)", "severity": "MEDIUM", "asset": "DEV-BASTION-03", "classification": "Credential Access", "status": "Auto-Banned"},
            {"source": "10.10.40.18", "type": "Base64 Obfuscated PowerShell Command", "severity": "CRITICAL", "asset": "DB-SERVER-04", "classification": "Execution", "status": "Investigating"},
            {"source": "91.240.118.22", "type": "DNS TXT Exfiltration Tunnel", "severity": "HIGH", "asset": "DNS-RESOLVER-INT", "classification": "Exfiltration", "status": "Rate-Limited"},
            {"source": "185.196.220.14", "type": "OAuth Device Authorization Phish", "severity": "MEDIUM", "asset": "OKTA-AUTH-SVC", "classification": "Defense Evasion", "status": "Flagged"},
            {"source": "89.248.165.71", "type": "SYN Stealth Port Sweep", "severity": "LOW", "asset": "FIREWALL-PERIM-01", "classification": "Reconnaissance", "status": "Logged"}
        ]

    async def run_loop(self):
        """Simulates autonomous stream ingestion every 2.5 seconds"""
        while self._running:
            await asyncio.sleep(random.uniform(2.0, 3.5))
            threat = random.choice(self.sample_threat_templates).copy()
            now_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

            event_record = {
                "time": now_str,
                "source": threat["source"],
                "type": threat["type"],
                "severity": threat["severity"],
                "asset": threat["asset"],
                "classification": threat["classification"],
                "status": threat["status"]
            }

            # 1. Persist to DB
            with get_db() as conn:
                conn.execute("""
                    INSERT INTO threat_events (timestamp, source_ip, threat_type, severity, target_asset, classification, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (now_str, threat["source"], threat["type"], threat["severity"], threat["asset"], threat["classification"], threat["status"]))
                conn.commit()

            # 2. Push to WebSocket clients
            await agent_bus.broadcast_threat(event_record)

            # 3. If High or Critical, alert Hunter Agent over Agent Bus
            if threat["severity"] in ("HIGH", "CRITICAL"):
                self.update_status(
                    f"Triaged {threat['severity']} alert on {threat['asset']}",
                    f"Forwarded {threat['type']} anomaly to Hunter Agent",
                    confidence=random.randint(94, 99)
                )
                await self.send_message(
                    "Hunter Agent",
                    "threat_anomaly_detected",
                    {
                        "source": threat["source"],
                        "asset": threat["asset"],
                        "threat_type": threat["type"],
                        "severity": threat["severity"]
                    }
                )
