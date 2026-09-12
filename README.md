# AegisX SOC — Autonomous Multi-Agent Security Operations Center Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.14+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![uv](https://img.shields.io/badge/uv-Package_Manager-DE5FE9.svg)](https://github.com/astral-sh/uv)
[![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time_Telemetry-010101.svg)](https://websockets.readthedocs.io/)
[![License](https://img.shields.io/badge/License-Proprietary_Enterprise-blue.svg)]()

> **AegisX SOC** is an enterprise-grade, real-time autonomous security operations center intelligence platform where **6 collaborative AI agents** continuously detect, investigate, assess blast radius, formulate SOAR responses, enforce two-man rule human approvals, and sign forensic audit dossiers with cryptographic integrity.

---

## Key Highlights & Capabilities

- **Real-Time Telemetry Pipeline**: Streaming security events over WebSockets with live canvas radar & trajectory arcs (DDoS, Ransomware, C2 Beaconing).
- **6 Autonomous Security Agents**:
  1. **Sentinel Agent (DETECTION)**: Ingests raw telemetry, scores anomaly confidence, flags high-fidelity security incidents.
  2. **Hunter Agent (INVESTIGATION)**: Performs entity resolution, pivots across process trees, files, hosts, and IP addresses.
  3. **Intel Agent (CTI)**: Correlates indicators with MITRE ATT&CK tactics, threat actors, and CVE vulnerability databases.
  4. **Risk Agent (BLAST RADIUS)**: Calculates crown-jewel exposure, likelihood vs. impact matrices, and propagation probability.
  5. **Response Agent (SOAR)**: Formulates multi-step containment plans with dry-run simulation and **Two-Man Rule** human approval gates.
  6. **Reporter Agent (COMPLIANCE)**: Generates forensic executive dossiers signed with immutable HMAC-SHA256 audit hashes.
- **12 Mission-Critical Operations Views**:
  - **Login & Clearance Portal**: Multi-tier clearance simulation (Tier 1 Triage, Tier 2 Hunter, Tier 3 Commander, SecOps Admin).
  - **SOC Overview Dashboard**: 6 KPI cards, Canvas Live Threat Map, real-time Threat Activity streaming charts, Active Incidents table, and AI Agent live status panel.
  - **Live Threats Telemetry**: High-density interactive event stream with pause/resume, speed multiplier, severity filters, and manual ingest.
  - **Incident Investigation (`INC-2048`)**: Deep-dive forensic workbench for LockBit 3.0 Ransomware, 5-stage MITRE kill-chain, and 3-tab evidence locker.
  - **AI Agent Command Center**: 6 Agent hero cards, inter-agent neural communication canvas, and dynamic autonomy level sliders.
  - **Threat Intelligence (CTI Hub)**: Live IOC search, malicious infrastructure feeds, threat actor profiles, and MITRE matrix navigator.
  - **Attack Timeline**: Interactive chronological reconstruction across enterprise endpoints and identity providers.
  - **Risk Analytics**: 5x5 Likelihood vs. Impact risk matrix, crown jewel exposure hierarchy, and blast radius gauges.
  - **Automated Response (SOAR)**: One-click containment actions, rollback capabilities, and Two-Man Rule cryptographically-verified approvals.
  - **Aegis AI Copilot**: Slide-over drawer with 7 quick prompt chips and step-by-step reasoning engine.
  - **Forensic Reports**: Executive dossier generation with live HTML print/PDF export and raw CSV export.
  - **Platform Settings**: Autonomy configurations, SIEM/EDR integration connectors, and cryptographic audit logs.

---

## System Architecture

```
                                  [ AegisX Web Client ]
                                (HTML5 / Vanilla CSS / JS)
                                            |
                         +------------------+------------------+
                         |                                     |
               HTTP REST API (/api/*)                 WebSocket (/api/threats/ws)
                         |                                     |
                         v                                     v
                 [ FastAPI Application Factory (backend/app.py) ]
                                            |
         +----------------------------------+----------------------------------+
         |                                                                     |
         v                                                                     v
 [ In-Memory Inter-Agent Bus ]                                        [ SQLite Database (WAL) ]
     (backend/bus.py)                                                  (backend/database.py)
         |                                                                     |
         +-----------------------+-----------------------+                     |
         |                       |                       |                     |
         v                       v                       v                     |
 [ Sentinel Agent ]       [ Hunter Agent ]        [ Intel Agent ]              |
         |                       |                       |                     |
         v                       v                       v                     |
  [ Risk Agent ]         [ Response Agent ]      [ Reporter Agent ]            |
                                                                               |
                                 +---------------------------------------------+
                                 v
                     [ Tables & Schemas ]
             - incidents           - threat_events
             - agents              - soar_recommendations
             - threat_intel        - audit_logs (HMAC-SHA256)
```

---

## Deployment Options

### Option A: 1-Click Deploy to Vercel (Cloud Serverless)

Deploy AegisX SOC with zero configuration to Vercel's global edge network:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSabesh1%2FAgeiX-SOC)

1. Click the **Deploy with Vercel** button above or import `Sabesh1/AgeiX-SOC` directly in your [Vercel Dashboard](https://vercel.com).
2. Vercel automatically detects [`vercel.json`](file:///c:/Users/HP/New%20folder/vercel.json) and builds both the static frontend CDN assets and the Python serverless API backend ([`api/index.py`](file:///c:/Users/HP/New%20folder/api/index.py)).
3. No environment variables are required for baseline operation — the platform automatically provisions in-memory/`/tmp` SQLite persistence with baseline incident telemetry.

---

### Option B: Run Locally with Python & `uv`

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sabesh1/AgeiX-SOC.git
   cd AgeiX-SOC
   ```

2. **Run with `uv` (Recommended)**:
   ```bash
   uv run python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
   ```

3. **Or launch via PowerShell script (Windows)**:
   ```powershell
   .\run_backend.ps1
   ```

4. **Access the platform**:
   - **SOC Application**: [http://localhost:8000](http://localhost:8000)
   - **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Alternative OpenAPI Specification (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Option C: Production Docker Container

```bash
# Build and run container with docker-compose
docker compose up -d --build
```
Access the containerized instance at `http://localhost:8000`.

---

## Testing & Diagnostics

A comprehensive 27-point diagnostic suite tests all REST routes, WebSocket feeds, external SIEM/EDR connectors, CTI reputation lookups, and outbound alert webhooks:

```bash
uv run python test_backend_complete.py
```

```
[TEST SUITE SUMMARY]
============================================================
TOTAL TESTS RUN: 24
PASSED:          24
FAILED:          0
SUCCESS RATE:    100.0%
============================================================
```

---

## Security & Human-in-the-Loop Governance

- **Two-Man Rule Protocol**: Destructive containment operations (e.g., isolating core database servers, revoking domain admin credentials) require dual cryptographic authentication before execution.
- **HMAC-SHA256 Audit Trail**: Every SOAR execution, containment decision, and analyst action is cryptographically signed and stored in the immutable `audit_logs` ledger.
- **Dynamic Autonomy Tiers**: Support for autonomous mode, supervised semi-autonomous mode, or fully manual approval mode per agent.

---

## Project Structure

```
AgeiX-SOC/
├── backend/
│   ├── agents/            # Autonomous worker agents (Sentinel, Hunter, Intel, Risk, Response, Reporter)
│   ├── models/            # Pydantic data schemas
│   ├── routers/           # FastAPI REST endpoints
│   ├── app.py             # App entrypoint and static mount
│   ├── bus.py             # Agent pub/sub bus & WebSocket manager
│   ├── config.py          # Platform settings
│   ├── database.py        # SQLite schema & session management
│   └── seed_data.py       # Enterprise incident & IOC seeds
├── css/
│   ├── variables.css      # Design tokens, color palette, glassmorphism
│   ├── base.css           # Global typography & layout rules
│   ├── components.css     # Buttons, badges, tables, modals
│   └── screens.css        # Specific layouts for all 12 views
├── js/
│   ├── components/        # Canvas threat map, charts, agent graph, copilot
│   ├── app.js             # Router, controller, backend API sync
│   ├── data.js            # Initial dataset definitions
│   ├── sound.js           # Web Audio API synthetic alert sound effects
│   └── state.js           # Reactive UI state container
├── index.html             # Master application shell
├── pyproject.toml         # Dependencies and project metadata
├── README.md              # Project documentation
├── run_backend.ps1        # One-click backend launcher
└── test_backend_complete.py # 24-point test suite
```

---

## License
Proprietary — Developed for Enterprise Security Operations & Autonomous Incident Response.
