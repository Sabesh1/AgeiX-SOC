"""
Vercel Serverless Entrypoint for AegisX SOC API
"""
import sys
import os
from pathlib import Path

# Set environment to Vercel mode
os.environ["VERCEL"] = "1"

# Add project root to Python module path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.database import init_db
from backend.seed_data import seed_initial_data
from backend.app import app

# Ensure database tables and initial threat telemetry exist on cold start
init_db()
seed_initial_data()
