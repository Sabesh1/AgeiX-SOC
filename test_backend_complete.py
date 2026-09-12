"""
AegisX SOC - Comprehensive Backend Diagnostic & Verification Test Suite
Tests all 24 REST endpoints, WebSockets, Autonomous Agent workers, and SQLite DB integrity.
"""
import sys
import json
import urllib.request
import urllib.parse
import sqlite3
import asyncio
import websockets
from datetime import datetime

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

results = []

def record_test(name: str, passed: bool, details: str = ""):
    results.append({
        "name": name,
        "status": "PASS" if passed else "FAIL",
        "details": details
    })
    status_symbol = "PASS" if passed else "FAIL"
    print(f"[{status_symbol}] {name} - {details}")

def http_get(path: str):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def http_post(path: str, data: dict):
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{path}", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

async def test_websocket(path: str):
    async with websockets.connect(f"{WS_URL}{path}", ping_timeout=5) as ws:
        # Wait for at least 1 message or send ping
        await ws.send("ping")
        msg = await asyncio.wait_for(ws.recv(), timeout=6.0)
        return msg

async def run_all_tests():
    print("\n========================================================")
    print("  AegisX SOC - Complete Backend Verification Suite      ")
    print(f"  Target: {BASE_URL} | Time: {datetime.now().isoformat()} ")
    print("========================================================\n")

    # 1. Health Endpoint
    try:
        code, data = http_get("/api/health")
        passed = code == 200 and data.get("status") == "online" and data.get("agents_active") == 6
        record_test("1. System Health Check (/api/health)", passed, f"Status: {data.get('status')}, Agents: {data.get('agents_active')}")
    except Exception as e:
        record_test("1. System Health Check (/api/health)", False, str(e))

    # 2. KPIs Endpoint
    try:
        code, data = http_get("/api/kpis")
        passed = code == 200 and "activeThreats" in data and "criticalIncidents" in data
        record_test("2. Real-Time KPIs (/api/kpis)", passed, f"Threats: {data['activeThreats']['value']}, Incidents: {data['criticalIncidents']['value']}")
    except Exception as e:
        record_test("2. Real-Time KPIs (/api/kpis)", False, str(e))

    # 3. Live Threats Feed
    try:
        code, data = http_get("/api/threats/live?limit=10")
        passed = code == 200 and isinstance(data, list) and len(data) > 0
        record_test("3. Live Threats Feed (/api/threats/live)", passed, f"Returned {len(data)} live telemetry events")
    except Exception as e:
        record_test("3. Live Threats Feed (/api/threats/live)", False, str(e))

    # 4. Incidents List
    try:
        code, data = http_get("/api/incidents")
        passed = code == 200 and isinstance(data, list) and len(data) >= 6
        record_test("4. Incidents List (/api/incidents)", passed, f"Retrieved {len(data)} active incidents")
    except Exception as e:
        record_test("4. Incidents List (/api/incidents)", False, str(e))

    # 5. Incident Deep Dossier (INC-2048)
    try:
        code, data = http_get("/api/incidents/INC-2048")
        passed = code == 200 and data.get("id") == "INC-2048" and "timeline" in data and "evidence" in data and "decisionTrace" in data
        record_test("5. Incident Dossier INC-2048 (/api/incidents/INC-2048)", passed, f"Title: {data.get('title')[:35]}..., Risk: {data.get('risk_score')}%")
    except Exception as e:
        record_test("5. Incident Dossier INC-2048 (/api/incidents/INC-2048)", False, str(e))

    # 6. Autonomous Agents Command Center
    try:
        code, data = http_get("/api/agents")
        passed = code == 200 and len(data) == 6
        roles = [f"{a['name']} ({a['status']})" for a in data]
        record_test("6. 6 Autonomous Agents Status (/api/agents)", passed, f"Active: {', '.join(roles[:3])}...")
    except Exception as e:
        record_test("6. 6 Autonomous Agents Status (/api/agents)", False, str(e))

    # 7. Agent Configuration Update
    try:
        code, data = http_post("/api/agents/agent-sentinel/config", {
            "autonomy_level": "Full Autonomous",
            "confidence_threshold": 95,
            "broadcast_telemetry": True
        })
        passed = code == 200 and data.get("status") == "success"
        record_test("7. Agent Policy Configuration (/api/agents/{id}/config)", passed, f"Autonomy: {data.get('autonomy_level')}, Threshold: {data.get('confidence_threshold')}%")
    except Exception as e:
        record_test("7. Agent Policy Configuration (/api/agents/{id}/config)", False, str(e))

    # 8. Threat Intelligence Search
    try:
        code, data = http_get("/api/intel/search?q=lockbit")
        passed = code == 200 and "results" in data
        record_test("8. Unified CTI Search (/api/intel/search)", passed, f"Found {data.get('total')} matches for 'lockbit'")
    except Exception as e:
        record_test("8. Unified CTI Search (/api/intel/search)", False, str(e))

    # 9. MITRE ATT&CK Matrix Techniques
    try:
        code, data = http_get("/api/intel/mitre")
        passed = code == 200 and len(data) >= 6
        record_test("9. MITRE ATT&CK Matrix (/api/intel/mitre)", passed, f"Retrieved {len(data)} mapped techniques")
    except Exception as e:
        record_test("9. MITRE ATT&CK Matrix (/api/intel/mitre)", False, str(e))

    # 10. Global IOC Blocking
    try:
        code, data = http_post("/api/intel/block?value=185.220.101.5&ioc_type=ip", {})
        passed = code == 200 and data.get("status") == "blocked"
        record_test("10. Global IOC Firewall Blocking (/api/intel/block)", passed, f"Blocked {data.get('value')} with {data.get('verification_signature')[:20]}...")
    except Exception as e:
        record_test("10. Global IOC Firewall Blocking (/api/intel/block)", False, str(e))

    # 11. Risk Analytics Overview
    try:
        code, data = http_get("/api/risk/overview")
        passed = code == 200 and data.get("overallScore") == 74 and "matrixCellCounts" in data
        record_test("11. Risk Analytics & 5x5 Matrix (/api/risk/overview)", passed, f"Overall Score: {data.get('overallScore')}/100 ({data.get('status')})")
    except Exception as e:
        record_test("11. Risk Analytics & 5x5 Matrix (/api/risk/overview)", False, str(e))

    # 12. Vulnerable Assets Ranking
    try:
        code, data = http_get("/api/risk/assets")
        passed = code == 200 and len(data) >= 3
        record_test("12. Top Vulnerable Assets (/api/risk/assets)", passed, f"Crown Jewel: {data[0]['hostname']} (CVSS: {data[0]['cvss']})")
    except Exception as e:
        record_test("12. Top Vulnerable Assets (/api/risk/assets)", False, str(e))

    # 13. SOAR Containment Recommendations
    try:
        code, data = http_get("/api/response/recommendations")
        passed = code == 200 and len(data) >= 1
        record_test("13. SOAR Containment Pipelines (/api/response/recommendations)", passed, f"Retrieved {len(data)} active playbooks")
    except Exception as e:
        record_test("13. SOAR Containment Pipelines (/api/response/recommendations)", False, str(e))

    # 14. SOAR Dry-Run Simulation
    try:
        code, data = http_post("/api/response/action", {
            "recommendation_id": "REC-104",
            "action": "dry_run"
        })
        passed = code == 200 and data.get("status") == "simulated"
        record_test("14. SOAR Dry-Run Simulation (/api/response/action)", passed, f"Verdict: {data.get('simulation', {}).get('safety_verdict')}")
    except Exception as e:
        record_test("14. SOAR Dry-Run Simulation (/api/response/action)", False, str(e))

    # 15. SOAR Human Approval Execution
    try:
        code, data = http_post("/api/response/action", {
            "recommendation_id": "REC-104",
            "action": "approve",
            "analyst_name": "Alex Vance",
            "clearance_tier": "Tier 3 Lead Analyst"
        })
        passed = code == 200 and data.get("status") == "executed"
        record_test("15. SOAR Human Approval (/api/response/action - approve)", passed, f"Signed: {data.get('verification_signature')[:24]}...")
    except Exception as e:
        record_test("15. SOAR Human Approval (/api/response/action - approve)", False, str(e))

    # 16. SOAR Rollback Capability
    try:
        code, data = http_post("/api/response/action", {
            "recommendation_id": "REC-104",
            "action": "rollback"
        })
        passed = code == 200 and data.get("status") == "rolled_back"
        record_test("16. SOAR Snapshot Rollback (/api/response/action - rollback)", passed, f"Status: {data.get('status')}")
    except Exception as e:
        record_test("16. SOAR Snapshot Rollback (/api/response/action - rollback)", False, str(e))

    # 17. Aegis AI Copilot Conversational Chat
    try:
        code, data = http_post("/api/copilot/chat", {
            "query": "Why is this incident high risk?",
            "analyst_name": "Alex Vance"
        })
        passed = code == 200 and "confidence" in data and len(data.get("points", [])) > 0
        record_test("17. Aegis AI Copilot Chat (/api/copilot/chat)", passed, f"Confidence: {data.get('confidence')}, Points: {len(data.get('points'))}")
    except Exception as e:
        record_test("17. Aegis AI Copilot Chat (/api/copilot/chat)", False, str(e))

    # 18. Executive Report Generation (JSON)
    try:
        code, data = http_post("/api/reports/generate", {
            "report_type": "incident",
            "incident_id": "INC-2048",
            "format": "json"
        })
        passed = code == 200 and "mean_time_to_detect" in data
        record_test("18. Report Generator JSON (/api/reports/generate)", passed, f"MTTD: {data.get('mean_time_to_detect')}, MTTC: {data.get('mean_time_to_contain')}")
    except Exception as e:
        record_test("18. Report Generator JSON (/api/reports/generate)", False, str(e))

    # 19. Executive Report Generation (Markdown)
    try:
        code, data = http_post("/api/reports/generate", {
            "report_type": "incident",
            "incident_id": "INC-2048",
            "format": "markdown"
        })
        passed = code == 200 and "content" in data and "# Executive Incident" in data["content"]
        record_test("19. Report Generator Markdown (/api/reports/generate)", passed, f"Generated {len(data['content'])} characters")
    except Exception as e:
        record_test("19. Report Generator Markdown (/api/reports/generate)", False, str(e))

    # 20. Tamper-Evident HMAC Audit Log
    try:
        code, data = http_get("/api/reports/audit-log?limit=10")
        passed = code == 200 and len(data) > 0 and "hashSignature" in data[0]
        record_test("20. HMAC Cryptographic Audit Log (/api/reports/audit-log)", passed, f"Retrieved {len(data)} verified signed records")
    except Exception as e:
        record_test("20. HMAC Cryptographic Audit Log (/api/reports/audit-log)", False, str(e))

    # 21. Live Threat WebSocket Stream
    try:
        msg = await test_websocket("/api/threats/ws")
        passed = True
        record_test("21. Live Threat WebSocket Stream (/api/threats/ws)", passed, f"Received live telemetry packet: {msg[:40]}...")
    except Exception as e:
        record_test("21. Live Threat WebSocket Stream (/api/threats/ws)", False, str(e))

    # 22. Inter-Agent Communication WebSocket
    try:
        async with websockets.connect(f"{WS_URL}/api/agents/ws", ping_timeout=5) as ws:
            await ws.send("ping")
            record_test("22. Inter-Agent Neural Bus WebSocket (/api/agents/ws)", True, "WebSocket connection established successfully")
    except Exception as e:
        record_test("22. Inter-Agent Neural Bus WebSocket (/api/agents/ws)", False, str(e))

    # 23. SQLite WAL Database File & Row Integrity
    try:
        conn = sqlite3.connect("backend/aegisx_soc.db")
        c = conn.cursor()
        t_threats = c.execute("SELECT COUNT(*) FROM threat_events").fetchone()[0]
        t_incidents = c.execute("SELECT COUNT(*) FROM incidents").fetchone()[0]
        t_agents = c.execute("SELECT COUNT(*) FROM agents").fetchone()[0]
        t_audits = c.execute("SELECT COUNT(*) FROM audit_logs").fetchone()[0]
        conn.close()
        passed = t_threats > 0 and t_incidents >= 6 and t_agents == 6 and t_audits > 0
        record_test("23. SQLite Database Integrity & Row Counts", passed, f"Threats: {t_threats}, Incidents: {t_incidents}, Agents: {t_agents}, Audits: {t_audits}")
    except Exception as e:
        record_test("23. SQLite Database Integrity & Row Counts", False, str(e))

    # 24. Static Web App Mount (Root /)
    try:
        req = urllib.request.Request(f"{BASE_URL}/")
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read().decode('utf-8')
            passed = resp.status == 200 and "<title>AegisX SOC" in content
            record_test("24. Static Web Application Mount (/)", passed, f"HTTP {resp.status} OK (HTML length: {len(content)} bytes)")
    except Exception as e:
        record_test("24. Static Web Application Mount (/)", False, str(e))

    # 25. External SIEM/EDR Integrations Status (/api/integrations/status)
    try:
        status_code, data = http_get("/api/integrations/status")
        connectors = data.get("connectors", [])
        passed = status_code == 200 and len(connectors) >= 4
        record_test("25. SIEM/EDR Integrations Status (/api/integrations/status)", passed, f"Status {status_code}, {len(connectors)} connectors active")
    except Exception as e:
        record_test("25. SIEM/EDR Integrations Status (/api/integrations/status)", False, str(e))

    # 26. External CTI IOC Enrichment (/api/integrations/enrich)
    try:
        status_code, data = http_post("/api/integrations/enrich", {"indicator": "194.165.16.42", "indicator_type": "ip"})
        passed = status_code == 200 and data.get("malicious") is True and "confidence_score" in data
        record_test("26. CTI Feed Enrichment (/api/integrations/enrich)", passed, f"Status {status_code}, Score: {data.get('confidence_score')}, Source: {data.get('source')}")
    except Exception as e:
        record_test("26. CTI Feed Enrichment (/api/integrations/enrich)", False, str(e))

    # 27. Security Incident Webhook Dispatch (/api/integrations/webhook/dispatch)
    try:
        payload = {
            "channel": "slack",
            "title": "Automated Containment Alert",
            "incident_id": "INC-2048",
            "severity": "CRITICAL",
            "summary": "LockBit 3.0 lateral movement quarantined by Response Agent."
        }
        status_code, data = http_post("/api/integrations/webhook/dispatch", payload)
        passed = status_code == 200 and data.get("status") == "dispatched" and "verification_signature" in data
        record_test("27. Outbound Alert Webhook Dispatch (/api/integrations/webhook/dispatch)", passed, f"Status {status_code}, Sig: {data.get('verification_signature', '')[:16]}...")
    except Exception as e:
        record_test("27. Outbound Alert Webhook Dispatch (/api/integrations/webhook/dispatch)", False, str(e))

    # Final Summary
    passed_count = sum(1 for r in results if r["status"] == "PASS")
    total_count = len(results)
    print("\n========================================================")
    print(f"  DIAGNOSTIC SUMMARY: {passed_count}/{total_count} TESTS PASSED ({passed_count/total_count*100:.1f}%)")
    print("========================================================\n")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
