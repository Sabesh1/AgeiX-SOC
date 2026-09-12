/**
 * AegisX SOC - Realistic Cybersecurity Intelligence Dataset
 * Multi-Agent System State & Forensic Telemetry
 */

const AegisData = {
  // Top KPI Metrics
  kpis: {
    activeThreats: { value: 142, change: "+12.4%", trend: "up", isAlert: true },
    criticalIncidents: { value: 7, change: "+2", trend: "up", isAlert: true },
    eventsProcessed: { value: "24.8M", change: "+1.2M/h", trend: "neutral", isAlert: false },
    assetsAtRisk: { value: 38, change: "-4", trend: "down", isAlert: false },
    aiInvestigations: { value: 89, change: "99.4% acc", trend: "up", isAlert: false },
    automatedResponses: { value: "1,412", change: "98.2% auto", trend: "up", isAlert: false }
  },

  // 6 Autonomous Security Agents
  agents: [
    {
      id: "agent-sentinel",
      name: "Sentinel Agent",
      role: "Threat Detection",
      status: "WORKING",
      statusBadge: "badge-working",
      confidence: 96,
      avatarBg: "rgba(0, 242, 254, 0.15)",
      avatarColor: "#00f2fe",
      initials: "SN",
      tasksCompleted: 42180,
      accuracy: "99.4%",
      latency: "14ms",
      currentTask: "Analyzing behavioral network telemetry for beacon anomalies",
      lastAction: "Flagged anomalous DNS tunneling payload from 10.10.40.18",
      autonomyLevel: "Full Autonomous",
      description: "Continuously parses raw telemetry from EDR, NDR, cloud trails, and perimeter sensors to detect stealthy zero-day attacks and known signatures."
    },
    {
      id: "agent-hunter",
      name: "Hunter Agent",
      role: "Deep Investigation & Correlation",
      status: "WORKING",
      statusBadge: "badge-working",
      confidence: 94,
      avatarBg: "rgba(168, 85, 247, 0.15)",
      avatarColor: "#c084fc",
      initials: "HN",
      tasksCompleted: 18450,
      accuracy: "98.1%",
      latency: "42ms",
      currentTask: "Investigating suspicious privileged login sequence on DB-SERVER-04",
      lastAction: "Correlated credential stuffing with subsequent Mimikatz execution",
      autonomyLevel: "Supervised",
      description: "Chains disparate event anomalies into coherent attack stories, reconstructing the full adversary kill-chain."
    },
    {
      id: "agent-intel",
      name: "Intel Agent",
      role: "Threat Intelligence & Attribution",
      status: "ONLINE",
      statusBadge: "badge-online",
      confidence: 98,
      avatarBg: "rgba(59, 130, 246, 0.15)",
      avatarColor: "#60a5fa",
      initials: "IN",
      tasksCompleted: 35120,
      accuracy: "99.7%",
      latency: "28ms",
      currentTask: "Querying dark web feeds & CTI hashes for LockBit 3.0 payload",
      lastAction: "Matched C2 IP 185.220.101.5 to APT29 (Cozy Bear) infrastructure",
      autonomyLevel: "Full Autonomous",
      description: "Enriches IOCs against global threat intelligence feeds, MITRE ATT&CK patterns, and historical adversary infrastructure."
    },
    {
      id: "agent-risk",
      name: "Risk Agent",
      role: "Risk & Blast Radius Assessment",
      status: "ONLINE",
      statusBadge: "badge-online",
      confidence: 95,
      avatarBg: "rgba(245, 158, 11, 0.15)",
      avatarColor: "#fbbf24",
      initials: "RK",
      tasksCompleted: 14200,
      accuracy: "97.8%",
      latency: "35ms",
      currentTask: "Evaluating crown jewel blast radius across prod Kubernetes cluster",
      lastAction: "Calculated risk score 98/100 on DB-SERVER-04 (Contains PII/Financial)",
      autonomyLevel: "Full Autonomous",
      description: "Dynamically calculates asset criticality, business impact, and blast radius to prioritize defense actions."
    },
    {
      id: "agent-response",
      name: "Response Agent",
      role: "Automated Containment & SOAR",
      status: "WAITING",
      statusBadge: "badge-waiting",
      confidence: 92,
      avatarBg: "rgba(239, 68, 68, 0.15)",
      avatarColor: "#f87171",
      initials: "RS",
      tasksCompleted: 9840,
      accuracy: "99.1%",
      latency: "8ms",
      currentTask: "Awaiting Analyst Approval: Isolate DB-SERVER-04 & Revoke Kerberos Token",
      lastAction: "Executed automatic firewall drop rule on egress port 4444",
      autonomyLevel: "Supervised (Human Gate)",
      description: "Orchestrates instant defensive actions across firewalls, EDR agents, cloud IAM, and network switches with explainable safety rails."
    },
    {
      id: "agent-reporter",
      name: "Reporter Agent",
      role: "Incident Reporting & Compliance",
      status: "ONLINE",
      statusBadge: "badge-online",
      confidence: 99,
      avatarBg: "rgba(16, 185, 129, 0.15)",
      avatarColor: "#34d399",
      initials: "RP",
      tasksCompleted: 8320,
      accuracy: "100%",
      latency: "19ms",
      currentTask: "Synthesizing executive forensic dossier for Incident INC-2048",
      lastAction: "Generated regulatory compliance report (NIST CSF 2.0 & CERT-In)",
      autonomyLevel: "Full Autonomous",
      description: "Translates complex technical evidence into actionable executive summaries, forensic timelines, and regulatory filings."
    }
  ],

  // Active Incidents
  incidents: [
    {
      id: "INC-2048",
      title: "Ransomware Staging & Privileged Credential Compromise",
      threatType: "Ransomware / Lateral Movement",
      severity: "CRITICAL",
      severityBadge: "badge-critical",
      asset: "DB-SERVER-04",
      assetCategory: "Crown Jewel / Financials",
      source: "185.220.101.5 (Bucharest, RO)",
      detectionTime: "12m ago",
      timestamp: "2026-09-12 14:00:12 UTC",
      riskScore: 98,
      confidenceScore: 96,
      assignedAgent: "Hunter Agent",
      status: "Investigating",
      statusBadge: "badge-working",
      summary: "Multiple failed authentication attempts were followed by a successful privileged Kerberos ticket grant from an anomalous foreign IP. Post-exploitation tooling (Cobalt Strike beacon and LockBit 3.0 encrypter pre-staging) was identified in memory on DB-SERVER-04.",
      affectedSystems: ["DB-SERVER-04 (Primary Database)", "AD-DC-01 (Domain Controller)", "BACKUP-NAS-02 (Storage Appliance)"],
      attackSource: "185.220.101.5 -> Tor Exit Node -> VPN Gateway (Mumbai)",
      potentialImpact: "High: Threat actor possesses unconstrained database administrative privileges with staged ransomware payload capable of encrypting 4.2TB of production transactional tables.",
      
      // Kill-Chain Timeline
      timeline: [
        { step: "T1", stage: "Initial Access", title: "VPN Credential Stuffing", time: "13:58:10", status: "completed", desc: "Attacker authenticated to Mumbai Corporate VPN gateway using compromised credentials for service account svc_dbbackup." },
        { step: "T2", stage: "Authentication Failure", title: "Kerberos Pre-Auth Brute Force", time: "14:00:12", status: "completed", desc: "42 rapid failed Kerberos requests followed by successful forged Golden Ticket negotiation." },
        { step: "T3", stage: "Privilege Escalation", title: "Mimikatz LSASS Injection", time: "14:03:45", status: "completed", desc: "Process injection detected targeting lsass.exe via Sysinternals ProcDump evasion technique." },
        { step: "T4", stage: "Lateral Movement", title: "WMI Remote Process Execution", time: "14:07:22", status: "active", desc: "Execution of encoded PowerShell command creating persistent service on DB-SERVER-04." },
        { step: "T5", stage: "Data Staging & Encrypt", title: "LockBit 3.0 Pre-Payload Drop", time: "14:10:05", status: "active", desc: "Shadow copies deleted via vssadmin.exe; staging encrypted binary 'db_sync.exe' in C:\\ProgramData." }
      ],

      // Evidence Locker
      evidence: {
        ips: [
          { ip: "185.220.101.5", role: "C2 / Adversary", country: "Romania", rep: "Known Tor Exit / Malicious C2" },
          { ip: "10.10.40.18", role: "Compromised Host (DB-SERVER-04)", country: "Internal", rep: "Critical Asset" },
          { ip: "10.10.10.4", role: "Target DC (AD-DC-01)", country: "Internal", rep: "Identity Provider" }
        ],
        domains: [
          { domain: "sync-msupdate-cdn.org", threat: "Cobalt Strike Waterhole C2", status: "Blocked by DNS Firewall" },
          { domain: "api.lockbit3-decrypt.cc", threat: "Ransomware Key Exchange", status: "Sinkholed" }
        ],
        hashes: [
          { type: "SHA-256", hash: "9e107d9d372bb6826bd81d3542a419d6a3fd5e1a123f990a427f71b12b591b92", file: "db_sync.exe", verdict: "LockBit 3.0 Encrypter (VT: 68/72)" },
          { type: "SHA-256", hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", file: "mimikatz_x64.dll", verdict: "Credential Dumping Tool" }
        ],
        logs: [
          `[2026-09-12 14:00:12.184] Windows Event ID 4625: An account failed to log on. Account Name: svc_dbbackup. Workstation: UNKNOWN. Source IP: 185.220.101.5.`,
          `[2026-09-12 14:00:44.912] Windows Event ID 4672: Special privileges assigned to new logon. Account: svc_dbbackup (Elevated: SeDebugPrivilege, SeTcbPrivilege).`,
          `[2026-09-12 14:03:45.310] Sysmon Event ID 10: ProcessAccess detected. Source: powershell.exe (PID 8412) -> Target: lsass.exe (PID 640). GrantedAccess: 0x1010.`,
          `[2026-09-12 14:07:22.002] Network Connection Event: Host 10.10.40.18 established TLS socket to 185.220.101.5:443. JA3 Hash: 51c64c77e60f39ac3e739872b35870ac.`,
          `[2026-09-12 14:10:05.819] Sysmon Event ID 1: Process Creation: "vssadmin.exe delete shadows /all /quiet". Parent: db_sync.exe.`
        ]
      },

      // Agent Decision Trace
      decisionTrace: [
        {
          agent: "Sentinel Agent",
          role: "Detection",
          time: "14:00:15 UTC",
          confidence: 98,
          finding: "Detected anomalous login sequence from non-whitelisted geographical origin (Romania/Tor) into corporate VPN.",
          reasoning: "User 'svc_dbbackup' has never authenticated from outside India DC IP range in 180 days. IP matches active Cobalt Strike C2 node.",
          hash: "a4f891b2c83..."
        },
        {
          agent: "Hunter Agent",
          role: "Investigation",
          time: "14:03:52 UTC",
          confidence: 96,
          finding: "Correlated credential authentication with Sysmon LSASS memory dumping and PowerShell script block obfuscation.",
          reasoning: "Attack matches MITRE ATT&CK T1003.001 (OS Credential Dumping). Attacker obtained NTLM hashes for domain admin.",
          hash: "c720e18ab44..."
        },
        {
          agent: "Intel Agent",
          role: "Attribution",
          time: "14:05:10 UTC",
          confidence: 97,
          finding: "Attributed payload and infrastructure to LockBit Affiliated Threat Group with 97% confidence.",
          reasoning: "C2 JA3 fingerprint, PowerShell loader syntax, and shadow copy deletion commands match campaign tracked as FIN12 / LockBit-Affiliate-88.",
          hash: "d31980f83ca..."
        },
        {
          agent: "Risk Agent",
          role: "Blast Radius Evaluation",
          time: "14:07:30 UTC",
          confidence: 95,
          finding: "Identified DB-SERVER-04 as Tier-0 Critical Asset holding core financial transactional records.",
          reasoning: "Compromise poses immediate risk of data extortion and regulatory non-compliance. Blast radius includes 3 linked backup arrays.",
          hash: "e903ba24190..."
        },
        {
          agent: "Response Agent",
          role: "Automated Orchestration",
          time: "14:10:12 UTC",
          confidence: 94,
          finding: "Generated automated containment plan. Requires Human Approval for DB Server network quarantine.",
          reasoning: "Autonomously blocked malicious C2 IP at perimeter firewall. Isolation of DB-SERVER-04 flagged as high-impact (2-Man Rule required).",
          hash: "f10428ad561..."
        }
      ]
    },
    {
      id: "INC-2049",
      title: "APT29 Lateral Movement via Kerberoasting",
      threatType: "Unauthorized Access / PrivEsc",
      severity: "CRITICAL",
      severityBadge: "badge-critical",
      asset: "AD-DC-01",
      assetCategory: "Identity Infrastructure",
      source: "45.154.255.89 (Frankfurt, DE)",
      detectionTime: "24m ago",
      timestamp: "2026-09-12 13:48:00 UTC",
      riskScore: 94,
      confidenceScore: 95,
      assignedAgent: "Hunter Agent",
      status: "Investigating",
      statusBadge: "badge-working"
    },
    {
      id: "INC-2050",
      title: "High-Volume Data Exfiltration via DNS Tunnel",
      threatType: "Data Exfiltration",
      severity: "HIGH",
      severityBadge: "badge-high",
      asset: "PROD-K8S-CLUSTER-02",
      assetCategory: "Cloud Compute",
      source: "91.240.118.22 (St. Petersburg, RU)",
      detectionTime: "45m ago",
      timestamp: "2026-09-12 13:27:14 UTC",
      riskScore: 86,
      confidenceScore: 93,
      assignedAgent: "Sentinel Agent",
      status: "Mitigated",
      statusBadge: "badge-online"
    },
    {
      id: "INC-2051",
      title: "Executive Spear-Phishing & OAuth Token Theft",
      threatType: "Phishing / Identity",
      severity: "HIGH",
      severityBadge: "badge-high",
      asset: "M365-TENANT-PROD",
      assetCategory: "SaaS Identity",
      source: "193.106.191.24 (Kyiv, UA)",
      detectionTime: "1h 10m ago",
      timestamp: "2026-09-12 13:02:19 UTC",
      riskScore: 82,
      confidenceScore: 97,
      assignedAgent: "Response Agent",
      status: "Mitigated",
      statusBadge: "badge-online"
    },
    {
      id: "INC-2052",
      title: "Distributed TCP SYN Flood Targeting Edge Load Balancers",
      threatType: "DDoS Attack",
      severity: "MEDIUM",
      severityBadge: "badge-medium",
      asset: "EDGE-LB-MUMBAI",
      assetCategory: "Perimeter Network",
      source: "Botnet Cluster (12,400 Nodes)",
      detectionTime: "2h ago",
      timestamp: "2026-09-12 12:12:00 UTC",
      riskScore: 68,
      confidenceScore: 99,
      assignedAgent: "Response Agent",
      status: "Resolved",
      statusBadge: "badge-online"
    },
    {
      id: "INC-2053",
      title: "Unencrypted Cloud S3 Bucket Access Pattern Anomaly",
      threatType: "Cloud Security",
      severity: "MEDIUM",
      severityBadge: "badge-medium",
      asset: "AWS-S3-FIN-REPORTS",
      assetCategory: "Cloud Storage",
      source: "203.0.113.88 (Seoul, KR)",
      detectionTime: "3h ago",
      timestamp: "2026-09-12 11:15:30 UTC",
      riskScore: 61,
      confidenceScore: 91,
      assignedAgent: "Risk Agent",
      status: "Resolved",
      statusBadge: "badge-online"
    }
  ],

  // Live Threat Event Stream Initial Data
  liveThreatEvents: [
    { time: "14:12:30", source: "185.220.101.5", type: "Cobalt Strike Beacon", severity: "CRITICAL", asset: "DB-SERVER-04", classification: "Malware C2", status: "Blocked" },
    { time: "14:12:28", source: "103.145.13.11", type: "SQL Injection Attempt", severity: "HIGH", asset: "API-GATEWAY-01", classification: "Web App Attack", status: "Filtered" },
    { time: "14:12:25", source: "45.154.255.89", type: "Kerberos Ticket Forgery", severity: "CRITICAL", asset: "AD-DC-01", classification: "Privilege Escalation", status: "Under Review" },
    { time: "14:12:21", source: "194.26.29.112", type: "Brute Force SSH (Port 22)", severity: "MEDIUM", asset: "DEV-BASTION-03", classification: "Credential Access", status: "Auto-Banned" },
    { time: "14:12:18", source: "10.10.40.18", type: "Suspicious PowerShell Base64", severity: "CRITICAL", asset: "DB-SERVER-04", classification: "Execution", status: "Investigating" },
    { time: "14:12:15", source: "91.240.118.22", type: "High Frequency DNS Query", severity: "HIGH", asset: "DNS-RESOLVER-INT", classification: "Exfiltration", status: "Rate-Limited" },
    { time: "14:12:10", source: "185.196.220.14", type: "Suspicious OAuth Token Exchange", severity: "MEDIUM", asset: "OKTA-AUTH-SVC", classification: "Defense Evasion", status: "Flagged" },
    { time: "14:12:05", source: "89.248.165.71", type: "Port Scan (TCP SYN Sweep)", severity: "LOW", asset: "FIREWALL-PERIM-01", classification: "Reconnaissance", status: "Logged" }
  ],

  // Threat Intelligence Data
  threatIntel: {
    maliciousIPs: [
      { ip: "185.220.101.5", org: "Tor Exit Node Network", country: "Romania", confidence: 99, sightings: 481, threatActor: "APT29 / LockBit" },
      { ip: "45.154.255.89", org: "Stark Industries Solutions", country: "Germany", confidence: 96, sightings: 219, threatActor: "Cozy Bear" },
      { ip: "91.240.118.22", org: "VDSina Hosting Provider", country: "Russia", confidence: 94, sightings: 154, threatActor: "Sandworm" },
      { ip: "193.106.191.24", org: "Cloudflare Warp Bypass", country: "Ukraine", confidence: 91, sightings: 92, threatActor: "Storm-0558" },
      { ip: "103.145.13.11", org: "Bulletproof ASN 49505", country: "Hong Kong", confidence: 98, sightings: 673, threatActor: "Lazarus Group" }
    ],
    maliciousDomains: [
      { domain: "sync-msupdate-cdn.org", registrar: "NameCheap Inc", category: "Cobalt Strike C2", confidence: 98, detected: "2026-09-08" },
      { domain: "auth-microsoft-verify.me", registrar: "Dynadot LLC", category: "Evilginx Phishing Proxy", confidence: 99, detected: "2026-09-10" },
      { domain: "api.lockbit3-decrypt.cc", registrar: "Njalla Privacy", category: "Ransomware Payment Gate", confidence: 97, detected: "2026-09-01" },
      { domain: "telemetry-azure-edge.cloud", registrar: "Porkbun LLC", category: "Data Exfiltration Tunnel", confidence: 92, detected: "2026-09-11" }
    ],
    threatActors: [
      { name: "APT29 (Cozy Bear)", origin: "Russia (SVR)", motivation: "State Espionage & Intelligence", targets: "Gov, Defense, Cloud Providers", activeCampaigns: "Midnight Blizzard, GoldenSAML" },
      { name: "Lazarus Group (APT38)", origin: "North Korea (RGB)", motivation: "Financial Theft & Cryptocurrency", targets: "Banks, Exchanges, Web3", activeCampaigns: "Operation DreamJob, SnatchCrypto" },
      { name: "Volt Typhoon", origin: "China (PLA)", motivation: "Pre-positioning in Critical Infrastructure", targets: "Power Grids, Water, Telecom", activeCampaigns: "Living off the Land (LotL)" },
      { name: "LockBit Affiliated Core", origin: "Transnational Cybercrime", motivation: "Double Extortion Ransomware", targets: "Enterprise Databases, Healthcare, Manufacturing", activeCampaigns: "LockBit 3.0 Black Green" }
    ],
    mitreTechniques: [
      { id: "T1078", name: "Valid Accounts", tactic: "Initial Access", detections: 42, severity: "critical" },
      { id: "T1059", name: "Command & Scripting Interpreter", tactic: "Execution", detections: 118, severity: "critical" },
      { id: "T1003", name: "OS Credential Dumping", tactic: "Credential Access", detections: 29, severity: "critical" },
      { id: "T1021", name: "Remote Services (WMI/WinRM)", tactic: "Lateral Movement", detections: 34, severity: "high" },
      { id: "T1071", name: "Application Layer Protocol", tactic: "Command & Control", detections: 86, severity: "high" },
      { id: "T1486", name: "Data Encrypted for Impact", tactic: "Impact", detections: 8, severity: "critical" },
      { id: "T1566", name: "Phishing: Spearphishing Link", tactic: "Initial Access", detections: 64, severity: "high" },
      { id: "T1048", name: "Exfiltration Over Alternative Protocol", tactic: "Exfiltration", detections: 15, severity: "medium" },
      { id: "T1070", name: "Indicator Removal on Host", tactic: "Defense Evasion", detections: 51, severity: "high" }
    ]
  },

  // Automated Response Playbooks & SOAR Pipeline
  soar: {
    activeRecommendations: [
      {
        id: "REC-104",
        incidentId: "INC-2048",
        threatName: "Ransomware on DB-SERVER-04",
        pipeline: [
          { step: "THREAT DETECTED", status: "done", auto: true },
          { step: "ISOLATE ENDPOINT", status: "pending_approval", auto: false, highImpact: true, desc: "Cut network interface on DB-SERVER-04 to stop ransomware propagation across LAN." },
          { step: "BLOCK MALICIOUS IP", status: "executed", auto: true, desc: "Add 185.220.101.5 to perimeter Palo Alto firewall drop rules." },
          { step: "DISABLE COMPROMISED ACCOUNT", status: "pending_approval", auto: false, highImpact: true, desc: "Revoke Kerberos TGT and lock user 'svc_dbbackup' in Active Directory." },
          { step: "CREATE INCIDENT REPORT", status: "ready", auto: true, desc: "Generate NIST CSF compliant forensic timeline and export evidence bundle." }
        ],
        reason: "Hunter Agent confirmed LSASS dump and staging of LockBit payload. Immediate containment required before data encryption phase executes.",
        riskLevel: "CRITICAL",
        aiConfidence: "96%",
        requiresHumanApproval: true,
        approvalTitle: "CRITICAL ACTION: Network Quarantine DB-SERVER-04",
        approvalDetails: "Target: DB-SERVER-04 (10.10.40.18). Host is a Tier-0 Production Database. Action will disconnect active SQL connections for ~15 minutes while memory is captured and malware neutralized."
      },
      {
        id: "REC-105",
        incidentId: "INC-2049",
        threatName: "APT29 Kerberoasting on AD-DC-01",
        pipeline: [
          { step: "THREAT DETECTED", status: "done", auto: true },
          { step: "ROTATE KRBTGT KEY", status: "pending_approval", auto: false, highImpact: true, desc: "Double-rotate Active Directory krbtgt account password to invalidate all forged Golden Tickets." },
          { step: "BLOCK EGRESS C2", status: "executed", auto: true, desc: "Sinkholed 45.154.255.89 at Edge Gateway." }
        ],
        reason: "Golden ticket negotiation detected. KRBTGT password rotation required to revoke attacker persistence.",
        riskLevel: "CRITICAL",
        aiConfidence: "95%",
        requiresHumanApproval: true,
        approvalTitle: "HIGH ACTION: Double-Rotate KRBTGT Password",
        approvalDetails: "Target: AD Domain Controller AD-DC-01. Action invalidates all current Kerberos sessions domain-wide. Minimal disruption if performed with staggered 10-minute replication."
      }
    ]
  },

  // Pre-configured Copilot Responses
  copilotLibrary: {
    "show me all critical threats": {
      text: "I have identified **2 Active Critical Incidents** requiring urgent triage:",
      cards: [
        { id: "INC-2048", title: "Ransomware Staging on DB-SERVER-04", risk: "98% Risk", agent: "Hunter Agent", action: "Requires Quarantine Approval" },
        { id: "INC-2049", title: "APT29 Kerberoasting on AD-DC-01", risk: "94% Risk", agent: "Hunter Agent", action: "Investigating" }
      ],
      confidence: "98%",
      recommendation: "Prioritize approval of the isolation command for DB-SERVER-04 to prevent encryption execution."
    },
    "why is this incident high risk?": {
      text: "Incident **INC-2048** is scored at **98/100 (CRITICAL)** based on 4 compounding factors calculated by the Risk Agent:",
      points: [
        "**Tier-0 Crown Jewel**: Target asset DB-SERVER-04 stores unencrypted customer transactional records and PII.",
        "**Adversary Privilege**: Threat actor has achieved `SYSTEM` privilege via LSASS injection (Mimikatz).",
        "**Destructive Capability**: Ransomware binary `db_sync.exe` has already initiated volume shadow copy deletion.",
        "**Attribution**: C2 infrastructure matches active FIN12/LockBit syndicate known for multi-million dollar extortion."
      ],
      confidence: "96%",
      recommendation: "Authorize immediate network isolation to contain blast radius."
    },
    "investigate this ip address": {
      text: "Comprehensive CTI telemetry for IP `185.220.101.5`:",
      points: [
        "**Geo Location**: Bucharest, Romania (AS202425 IP Volume Inc)",
        "**Threat Category**: High-Confidence Tor Exit Node / Cobalt Strike C2",
        "**Global Sightings**: 481 detections across 32 corporate networks in the last 72 hours",
        "**Reputation Score**: Malicious (VirusTotal 74/88 vendors flagged)",
        "**Associated MITRE TTPs**: T1071.001 (Web Protocols), T1090.003 (Tor Multi-hop Proxy)"
      ],
      confidence: "99%",
      recommendation: "Global perimeter block is already active. Audit all internal endpoints communicating with this IP over port 443."
    },
    "summarize the attack": {
      text: "The attack sequence on **DB-SERVER-04** began at 13:58 UTC via VPN credential stuffing, using valid credentials for `svc_dbbackup`. Within 5 minutes, the adversary injected into `lsass.exe`, forged an elevated Kerberos ticket, traversed laterally via WMI, and staged the LockBit 3.0 encrypter. Hunter Agent detected the evasion attempt and Sentinel Agent halted outbound exfiltration channels.",
      confidence: "95%",
      recommendation: "View the full step-by-step kill-chain on the Incident Details page."
    },
    "what assets are affected?": {
      text: "Currently **3 enterprise assets** are within the direct compromise boundary:",
      points: [
        "**DB-SERVER-04** (10.10.40.18): Active compromise with staged ransomware.",
        "**AD-DC-01** (10.10.10.4): Target of forged Kerberos Golden Ticket negotiation.",
        "**BACKUP-NAS-02** (10.10.50.6): Attempted SMB connection logged; blocked by Response Agent."
      ],
      confidence: "97%",
      recommendation: "Enforce network segmentation between DB subnet (10.10.40.0/24) and Backup subnet (10.10.50.0/24)."
    },
    "recommend a response": {
      text: "Response Agent and Risk Agent have formulated a 4-step containment playbook for **INC-2048**:",
      points: [
        "1. **Isolate DB-SERVER-04** (Cut network adapter via EDR API while preserving RAM dump for memory forensics)",
        "2. **Revoke Active Directory Session** for user `svc_dbbackup`",
        "3. **Deploy SentinelOne / CrowdStrike remediation script** to delete `C:\\ProgramData\\db_sync.exe`",
        "4. **Mount immutable snapshots** for DB-SERVER-04 from isolated backup vault"
      ],
      confidence: "94%",
      recommendation: "Click 'Approve Response' in the Automated Response tab to execute steps 1 & 2 immediately."
    },
    "generate an incident report": {
      text: "Reporter Agent has compiled the official **Forensic Dossier & Executive Brief** for INC-2048.",
      points: [
        "**Report Title**: Incident Report: LockBit 3.0 Ransomware Containment (INC-2048)",
        "**Compliance Coverage**: NIST CSF 2.0 (RS.CO-03, RS.AN-01), CERT-In Cyber Incident Reporting Guidelines",
        "**Artifacts Included**: 4 SHA-256 binary hashes, 5 PCAP flow records, 3 affected host forensic timelines"
      ],
      confidence: "100%",
      recommendation: "Navigating to Reports screen or click 'Export PDF' to download the finalized executive document."
    }
  }
};

window.AegisData = AegisData;
