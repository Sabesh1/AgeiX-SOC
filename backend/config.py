"""
AegisX SOC - Configuration & Server Settings
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "backend" / "aegisx_soc.db"

HOST = os.getenv("AEGIS_HOST", "0.0.0.0")
PORT = int(os.getenv("AEGIS_PORT", "8000"))
DEBUG = os.getenv("AEGIS_DEBUG", "True").lower() in ("true", "1")

# Agent Autonomy & Risk Thresholds
DEFAULT_CONFIDENCE_THRESHOLD = 90  # 90% confidence required for autonomous action
TWO_MAN_RULE_ENABLED = True        # High-impact containment requires 2-man authorization
HMAC_SECRET = os.getenv("AEGIS_HMAC_SECRET", "aegisx-quantum-secure-soc-key-2026")
