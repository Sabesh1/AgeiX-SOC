"""
AegisX SOC - AI Agents Command Center Router
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import List, Dict, Any
from backend.database import get_db, log_audit_entry
from backend.bus import agent_bus
from backend.models.schemas import AgentConfigUpdate

router = APIRouter(prefix="/api/agents", tags=["AI Agents Command Center"])

@router.get("")
def get_agents() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT id, name, role, status, confidence, accuracy, latency,
                   tasks_completed as tasksCompleted, current_task as currentTask,
                   last_action as lastAction, autonomy_level as autonomyLevel,
                   description, avatar_bg as avatarBg, avatar_color as avatarColor, initials
            FROM agents;
        """).fetchall()

    return [dict(r) for r in rows]

@router.post("/{agent_id}/config")
def update_agent_config(agent_id: str, cfg: AgentConfigUpdate) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        agent = cursor.execute("SELECT name FROM agents WHERE id = ?;", (agent_id,)).fetchone()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        cursor.execute("""
            UPDATE agents
            SET autonomy_level = ?, confidence = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        """, (cfg.autonomy_level, cfg.confidence_threshold, agent_id))
        conn.commit()

    agent_name = agent["name"]
    log_audit_entry("Analyst (Alex Vance)", f"Updated Policy for {agent_name}", agent_id,
                    f"Autonomy: {cfg.autonomy_level}, Threshold: {cfg.confidence_threshold}%")

    return {
        "status": "success",
        "agent_id": agent_id,
        "autonomy_level": cfg.autonomy_level,
        "confidence_threshold": cfg.confidence_threshold
    }

@router.websocket("/ws")
async def agent_websocket_endpoint(websocket: WebSocket):
    await agent_bus.register_agent_socket(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await agent_bus.unregister_agent_socket(websocket)
    except Exception:
        await agent_bus.unregister_agent_socket(websocket)
