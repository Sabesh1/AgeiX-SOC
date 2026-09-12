"""
AegisX SOC - Main FastAPI Backend Application
Serves REST APIs, WebSockets, background autonomous agents, and static UI assets.
"""
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure workspace root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.config import HOST, PORT, DEBUG
from backend.database import init_db
from backend.seed_data import seed_initial_data
from backend.agents import agent_engine

# Routers
from backend.routers import threats, incidents, agents, intel, risk, response, copilot, reports, integrations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize DB & Seed Baseline Intelligence
    init_db()
    seed_initial_data()

    # 2. Boot Autonomous Agent Engine
    await agent_engine.start_all()

    yield

    # 3. Gracefully Stop Agents
    await agent_engine.stop_all()

app = FastAPI(
    title="AegisX SOC Intelligence Platform API",
    description="Autonomous Multi-Agent Security Operations Center Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include API Routers
app.include_router(threats.router)
app.include_router(incidents.router)
app.include_router(agents.router)
app.include_router(intel.router)
app.include_router(risk.router)
app.include_router(response.router)
app.include_router(copilot.router)
app.include_router(reports.router)
app.include_router(integrations.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AegisX Multi-Agent SOC Core",
        "agents_active": 6,
        "database": "sqlite_wal_active"
    }

# Mount Frontend Static Assets
# Serves index.html, css/, js/, and assets at http://localhost:8000/
app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host=HOST, port=PORT, reload=DEBUG)
