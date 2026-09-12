"""
AegisX SOC - Database Seeder
Populates initial realistic enterprise cybersecurity telemetry and agent states.
"""
import json
from datetime import datetime, timezone
from backend.database import get_db, log_audit_entry

def seed_initial_data():
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if already seeded
        cursor.execute("SELECT COUNT(*) FROM agents;")
        if cursor.fetchone()[0] > 0:
            return  # Already seeded

        # 1. Seed the 6 Autonomous Agents
        agents = [
            ("agent-sentinel", "Sentinel Agent", "Threat Detection", "WORKING", 96, "99.4%", "14ms", 42180,
             "Analyzing behavioral network telemetry for beacon anomalies",
             "Flagged anomalous DNS tunneling payload from 10.10.40.18",
             "Full Autonomous",
             "Continuously parses raw telemetry from EDR, NDR, cloud trails, and perimeter sensors to detect stealthy zero-day attacks and known signatures.",
             "rgba(0, 242, 254, 0.15)", "#00f2fe", "SN"),
            ("agent-hunter", "Hunter Agent", "Deep Investigation & Correlation", "WORKING", 94, "98.1%", "42ms", 18450,
             "Investigating suspicious privileged login sequence on DB-SERVER-04",
             "Correlated credential stuffing with subsequent Mimikatz execution",
             "Supervised",
             "Chains disparate event anomalies into coherent attack stories, reconstructing the full adversary kill-chain.",
             "rgba(168, 85, 247, 0.15)", "#c084fc", "HN"),
            ("agent-intel", "Intel Agent", "Threat Intelligence & Attribution", "ONLINE", 98, "99.7%", "28ms", 35120,
             "Querying dark web feeds & CTI hashes for LockBit 3.0 payload",
             "Matched C2 IP 185.220.101.5 to APT29 (Cozy Bear) infrastructure",
             "Full Autonomous",
             "Enriches IOCs against global threat intelligence feeds, MITRE ATT&CK patterns, and historical adversary infrastructure.",
             "rgba(59, 130, 246, 0.15)", "#60a5fa", "IN"),
            ("agent-risk", "Risk Agent", "Risk & Blast Radius Assessment", "ONLINE", 95, "97.8%", "35ms", 14200,
             "Evaluating crown jewel blast radius across prod Kubernetes cluster",
             "Calculated risk score 98/100 on DB-SERVER-04 (Contains PII/Financial)",
             "Full Autonomous",
             "Dynamically calculates asset criticality, business impact, and blast radius to prioritize defense actions.",
             "rgba(245, 158, 11, 0.15)", "#fbbf24", "RK"),
            ("agent-response", "Response Agent", "Automated Containment & SOAR", "WAITING", 92, "99.1%", "8ms", 9840,
             "Awaiting Analyst Approval: Isolate DB-SERVER-04 & Revoke Kerberos Token",
             "Executed automatic firewall drop rule on egress port 4444",
             "Supervised (Human Gate)",
             "Orchestrates instant defensive actions across firewalls, EDR agents, cloud IAM, and network switches with explainable safety rails.",
             "rgba(239, 68, 68, 0.15)", "#f87171", "RS"),
            ("agent-reporter", "Reporter Agent", "Incident Reporting & Compliance", "ONLINE", 99, "100%", "19ms", 8320,
             "Synthesizing executive forensic dossier for Incident INC-2048",
             "Generated regulatory compliance report (NIST CSF 2.0 & CERT-In)",
             "Full Autonomous",
             "Translates complex technical evidence into actionable executive summaries, forensic timelines, and regulatory filings.",
             "rgba(16, 185, 129, 0.15)", "#34d399", "RP")
        ]
        cursor.executemany("""
            INSERT INTO agents (id, name, role, status, confidence, accuracy, latency, tasks_completed, current_task, last_action, autonomy_level, description, avatar_bg, avatar_color, initials)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, agents)

        # 2. Seed Primary Critical Incident INC-2048
        timeline_2048 = [
            {"step": "T1", "stage": "Initial Access", "title": "VPN Credential Stuffing", "time": "13:58:10", "status": "completed", "desc": "Attacker authenticated to Mumbai Corporate VPN gateway using compromised credentials for svc_dbbackup."},
            {"step": "T2", "stage": "Authentication Failure", "title": "Kerberos Pre-Auth Brute Force", "time": "14:00:12", "status": "completed", "desc": "42 rapid failed Kerberos requests followed by successful forged Golden Ticket negotiation."},
            {"step": "T3", "stage": "Privilege Escalation", "title": "Mimikatz LSASS Injection", "time": "14:03:45", "status": "completed", "desc": "Process injection detected targeting lsass.exe via Sysinternals ProcDump evasion technique."},
            {"step": "T4", "stage": "Lateral Movement", "title": "WMI Remote Process Execution", "time": "14:07:22", "status": "active", "desc": "Execution of encoded PowerShell command creating persistent service on DB-SERVER-04."},
            {"step": "T5", "stage": "Data Staging & Encrypt", "title": "LockBit 3.0 Pre-Payload Drop", "time": "14:10:05", "status": "active", "desc": "Shadow copies deleted via vssadmin.exe; staging encrypted binary 'db_sync.exe' in C:\\ProgramData."}
        ]

        evidence_2048 = {
            "ips": [
                {"ip": "185.220.101.5", "role": "C2 / Adversary", "country": "Romania", "rep": "Known Tor Exit / Malicious C2"},
                {"ip": "10.10.40.18", "role": "Compromised Host (DB-SERVER-04)", "country": "Internal", "rep": "Critical Asset"},
                {"ip": "10.10.10.4", "role": "Target DC (AD-DC-01)", "country": "Internal", "rep": "Identity Provider"}
            ],
            "domains": [
                {"domain": "sync-msupdate-cdn.org", "threat": "Cobalt Strike Waterhole C2", "status": "Blocked by DNS Firewall"},
                {"domain": "api.lockbit3-decrypt.cc", "threat": "Ransomware Key Exchange", "status": "Sinkholed"}
            ],
            "hashes": [
                {"type": "SHA-256", "hash": "9e107d9d372bb6826bd81d3542a419d6a3fd5e1a123f990a427f71b12b591b92", "file": "db_sync.exe", "verdict": "LockBit 3.0 Encrypter (VT: 68/72)"},
                {"type": "SHA-256", "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "file": "mimikatz_x64.dll", "verdict": "Credential Dumping Tool"}
            ],
            "logs": [
                "[2026-09-12 14:00:12.184] Windows Event ID 4625: An account failed to log on. Account Name: svc_dbbackup. Source IP: 185.220.101.5.",
                "[2026-09-12 14:00:44.912] Windows Event ID 4672: Special privileges assigned to new logon. Account: svc_dbbackup (Elevated: SeDebugPrivilege).",
                "[2026-09-12 14:03:45.310] Sysmon Event ID 10: ProcessAccess detected. Source: powershell.exe -> Target: lsass.exe. GrantedAccess: 0x1010.",
                "[2026-09-12 14:07:22.002] Network Connection Event: Host 10.10.40.18 established TLS socket to 185.220.101.5:443.",
                "[2026-09-12 14:10:05.819] Sysmon Event ID 1: Process Creation: 'vssadmin.exe delete shadows /all /quiet'. Parent: db_sync.exe."
            ]
        }

        decision_trace_2048 = [
            {"agent": "Sentinel Agent", "role": "Detection", "time": "14:00:15 UTC", "confidence": 98, "finding": "Detected anomalous login sequence from non-whitelisted geographical origin (Romania/Tor) into corporate VPN.", "reasoning": "User 'svc_dbbackup' has never authenticated from outside India DC IP range in 180 days. IP matches active Cobalt Strike C2 node.", "hash": "a4f891b2c83..."},
            {"agent": "Hunter Agent", "role": "Investigation", "time": "14:03:52 UTC", "confidence": 96, "finding": "Correlated credential authentication with Sysmon LSASS memory dumping and PowerShell script block obfuscation.", "reasoning": "Attack matches MITRE ATT&CK T1003.001 (OS Credential Dumping). Attacker obtained NTLM hashes for domain admin.", "hash": "c720e18ab44..."},
            {"agent": "Intel Agent", "role": "Attribution", "time": "14:05:10 UTC", "confidence": 97, "finding": "Attributed payload and infrastructure to LockBit Affiliated Threat Group with 97% confidence.", "reasoning": "C2 JA3 fingerprint, PowerShell loader syntax, and shadow copy deletion commands match campaign tracked as FIN12 / LockBit-Affiliate-88.", "hash": "d31980f83ca..."},
            {"agent": "Risk Agent", "role": "Blast Radius Evaluation", "time": "14:07:30 UTC", "confidence": 95, "finding": "Identified DB-SERVER-04 as Tier-0 Critical Asset holding core financial transactional records.", "reasoning": "Compromise poses immediate risk of data extortion and regulatory non-compliance. Blast radius includes 3 linked backup arrays.", "hash": "e903ba24190..."},
            {"agent": "Response Agent", "role": "Automated Orchestration", "time": "14:10:12 UTC", "confidence": 94, "finding": "Generated automated containment plan. Requires Human Approval for DB Server network quarantine.", "reasoning": "Autonomously blocked malicious C2 IP at perimeter firewall. Isolation of DB-SERVER-04 flagged as high-impact (2-Man Rule required).", "hash": "f10428ad561..."}
        ]

        cursor.execute("""
            INSERT INTO incidents (id, title, threat_type, severity, asset, asset_category, source, timestamp, risk_score, confidence_score, assigned_agent, status, summary, affected_systems, potential_impact, timeline_json, evidence_json, decision_trace_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "INC-2048", "Ransomware Staging & Privileged Credential Compromise", "Ransomware / Lateral Movement", "CRITICAL",
            "DB-SERVER-04", "Crown Jewel / Financials", "185.220.101.5 (Bucharest, RO)", "2026-09-12 14:00:12 UTC",
            98, 96, "Hunter Agent", "Investigating",
            "Multiple failed authentication attempts were followed by a successful privileged Kerberos ticket grant from an anomalous foreign IP. Post-exploitation tooling (Cobalt Strike beacon and LockBit 3.0 encrypter pre-staging) was identified in memory on DB-SERVER-04.",
            "DB-SERVER-04 (Primary Database), AD-DC-01 (Domain Controller), BACKUP-NAS-02 (Storage Appliance)",
            "High: Threat actor possesses unconstrained database administrative privileges with staged ransomware payload capable of encrypting 4.2TB of production transactional tables.",
            json.dumps(timeline_2048), json.dumps(evidence_2048), json.dumps(decision_trace_2048)
        ))

        # Additional Incidents
        other_incidents = [
            ("INC-2049", "APT29 Lateral Movement via Kerberoasting", "Unauthorized Access / PrivEsc", "CRITICAL", "AD-DC-01", "Identity Infrastructure", "45.154.255.89 (Frankfurt, DE)", "2026-09-12 13:48:00 UTC", 94, 95, "Hunter Agent", "Investigating"),
            ("INC-2050", "High-Volume Data Exfiltration via DNS Tunnel", "Data Exfiltration", "HIGH", "PROD-K8S-CLUSTER-02", "Cloud Compute", "91.240.118.22 (St. Petersburg, RU)", "2026-09-12 13:27:14 UTC", 86, 93, "Sentinel Agent", "Mitigated"),
            ("INC-2051", "Executive Spear-Phishing & OAuth Token Theft", "Phishing / Identity", "HIGH", "M365-TENANT-PROD", "SaaS Identity", "193.106.191.24 (Kyiv, UA)", "2026-09-12 13:02:19 UTC", 82, 97, "Response Agent", "Mitigated"),
            ("INC-2052", "Distributed TCP SYN Flood Targeting Edge Load Balancers", "DDoS Attack", "MEDIUM", "EDGE-LB-MUMBAI", "Perimeter Network", "Botnet Cluster (12,400 Nodes)", "2026-09-12 12:12:00 UTC", 68, 99, "Response Agent", "Resolved"),
            ("INC-2053", "Unencrypted Cloud S3 Bucket Access Pattern Anomaly", "Cloud Security", "MEDIUM", "AWS-S3-FIN-REPORTS", "Cloud Storage", "203.0.113.88 (Seoul, KR)", "2026-09-12 11:15:30 UTC", 61, 91, "Risk Agent", "Resolved")
        ]
        for inc in other_incidents:
            cursor.execute("""
                INSERT INTO incidents (id, title, threat_type, severity, asset, asset_category, source, timestamp, risk_score, confidence_score, assigned_agent, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, inc)

        # 3. Seed Threat Intel IOCs
        iocs = [
            ("ip", "185.220.101.5", "Tor Exit Node Network", "Romania", 99, 481, "APT29 / LockBit", "C2 Infrastructure"),
            ("ip", "45.154.255.89", "Stark Industries Solutions", "Germany", 96, 219, "Cozy Bear", "Kerberoasting"),
            ("ip", "91.240.118.22", "VDSina Hosting Provider", "Russia", 94, 154, "Sandworm", "DNS Tunnel"),
            ("ip", "193.106.191.24", "Cloudflare Warp Bypass", "Ukraine", 91, 92, "Storm-0558", "Phishing C2"),
            ("ip", "103.145.13.11", "Bulletproof ASN 49505", "Hong Kong", 98, 673, "Lazarus Group", "SQL Injection"),
            ("domain", "sync-msupdate-cdn.org", "NameCheap Inc", "Global", 98, 312, "LockBit", "Cobalt Strike C2"),
            ("domain", "auth-microsoft-verify.me", "Dynadot LLC", "Global", 99, 89, "Storm-0558", "Evilginx Phishing Proxy"),
            ("domain", "api.lockbit3-decrypt.cc", "Njalla Privacy", "Global", 97, 44, "LockBit", "Ransomware Payment Gate")
        ]
        cursor.executemany("""
            INSERT INTO threat_intel (ioc_type, value, provider, country, confidence, sightings, threat_actor, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, iocs)

        # 4. Seed SOAR Recommendations
        pipeline_rec_104 = [
            {"step": "THREAT DETECTED", "status": "done", "auto": True},
            {"step": "ISOLATE ENDPOINT", "status": "pending_approval", "auto": False, "highImpact": True, "desc": "Cut network interface on DB-SERVER-04 to stop ransomware propagation across LAN."},
            {"step": "BLOCK MALICIOUS IP", "status": "executed", "auto": True, "desc": "Add 185.220.101.5 to perimeter Palo Alto firewall drop rules."},
            {"step": "DISABLE COMPROMISED ACCOUNT", "status": "pending_approval", "auto": False, "highImpact": True, "desc": "Revoke Kerberos TGT and lock user 'svc_dbbackup' in Active Directory."},
            {"step": "CREATE INCIDENT REPORT", "status": "ready", "auto": True, "desc": "Generate NIST CSF compliant forensic timeline and export evidence bundle."}
        ]
        cursor.execute("""
            INSERT INTO soar_recommendations (id, incident_id, threat_name, risk_level, ai_confidence, reason, pipeline_json, requires_human_approval, approval_title, approval_details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "REC-104", "INC-2048", "Ransomware on DB-SERVER-04", "CRITICAL", "96%",
            "Hunter Agent confirmed LSASS dump and staging of LockBit payload. Immediate containment required before data encryption phase executes.",
            json.dumps(pipeline_rec_104), True,
            "CRITICAL ACTION: Network Quarantine DB-SERVER-04",
            "Target: DB-SERVER-04 (10.10.40.18). Host is a Tier-0 Production Database. Action will disconnect active SQL connections for ~15 minutes while memory is captured and malware neutralized."
        ))

        conn.commit()

    # Initial Audit Trail
    log_audit_entry("System", "Database Initialized", "CORE", "AegisX SOC schema and baseline datasets loaded")
    log_audit_entry("Sentinel Agent", "Threat Ingest Active", "PERIM-FW-01", "Monitoring network flows from 10 perimeter ingress taps")
