"""
AegisX SOC - Risk Analytics Router
"""
from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/api/risk", tags=["Risk Analytics"])

@router.get("/overview")
def get_risk_overview() -> Dict[str, Any]:
    return {
        "overallScore": 74,
        "status": "ELEVATED",
        "breakdown": [
            {"label": "Ransomware", "value": 34, "color": "#ef4444"},
            {"label": "Lateral Movement", "value": 28, "color": "#a855f7"},
            {"label": "DNS Exfil", "value": 18, "color": "#00f2fe"},
            {"label": "Credential Theft", "value": 14, "color": "#f59e0b"},
            {"label": "Cloud Misconfig", "value": 6, "color": "#3b82f6"}
        ],
        "matrixCellCounts": {
            "catastrophic": [4, 8, 12, 14, 18],
            "critical": [2, 6, 9, 15, 16],
            "moderate": [1, 3, 7, 11, 13],
            "minor": [0, 1, 4, 5, 10],
            "insignificant": [0, 0, 1, 2, 3]
        }
    }

@router.get("/assets")
def get_vulnerable_assets() -> List[Dict[str, Any]]:
    return [
        {
            "hostname": "DB-SERVER-04",
            "classification": "Crown Jewel (Tier-0)",
            "ip": "10.10.40.18",
            "cve": "CVE-2023-38606 (Kernel PrivEsc)",
            "cvss": 9.8,
            "blastRadius": "3 Linked Backup Arrays",
            "recommendedAction": "Isolate Endpoint"
        },
        {
            "hostname": "AD-DC-01",
            "classification": "Identity Hub",
            "ip": "10.10.10.4",
            "cve": "CVE-2022-37969 (Kerberos PAC)",
            "cvss": 9.6,
            "blastRadius": "Entire Active Directory Domain",
            "recommendedAction": "Rotate KRBTGT Password"
        },
        {
            "hostname": "PROD-K8S-CLUSTER-02",
            "classification": "Cloud Compute",
            "ip": "172.24.8.12",
            "cve": "Misconfigured RBAC ServiceAccount",
            "cvss": 8.4,
            "blastRadius": "42 Microservices",
            "recommendedAction": "Enforce ServiceAccount RBAC"
        }
    ]
