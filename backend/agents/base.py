"""
AegisX SOC - Base Autonomous Security Agent
Base class providing lifecycle management, metric tracking, and inter-agent communication.
"""
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.bus import agent_bus
from backend.database import get_db, log_audit_entry

class BaseAgent:
    def __init__(self, agent_id: str, name: str, role: str):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.status = "ONLINE"
        self.confidence = 95
        self.tasks_completed = 0
        self.current_task = "Idle"
        self.last_action = "Agent Initialized"
        self.autonomy_level = "Full Autonomous"
        self._running = False
        self._task_handle: Optional[asyncio.Task] = None

        # Subscribe to messages addressed to this agent or broadcast
        agent_bus.subscribe(self.name, self.handle_message)
        agent_bus.subscribe("*", self.handle_message)

    async def start(self):
        """Starts agent background monitoring loop"""
        self._running = True
        self.status = "WORKING"
        self._task_handle = asyncio.create_task(self.run_loop())
        print(f"[{self.name}] Autonomous agent started ({self.autonomy_level})")

    async def stop(self):
        self._running = False
        if self._task_handle:
            self._task_handle.cancel()
        self.status = "ONLINE"
        print(f"[{self.name}] Stopped")

    async def run_loop(self):
        """Override in subclasses for periodic detection/analysis behaviors"""
        pass

    async def handle_message(self, message: Dict[str, Any]):
        """Override in subclasses to handle incoming inter-agent communications"""
        pass

    async def send_message(self, recipient: str, topic: str, payload: Dict[str, Any]):
        """Dispatches a message to another agent via the bus"""
        payload["timestamp"] = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
        await agent_bus.publish(self.name, recipient, topic, payload)

    def update_status(self, current_task: str, last_action: str, confidence: int = None):
        self.current_task = current_task
        self.last_action = last_action
        if confidence is not None:
            self.confidence = confidence
        self.tasks_completed += 1

        with get_db() as conn:
            conn.execute("""
                UPDATE agents 
                SET status = ?, current_task = ?, last_action = ?, confidence = ?, tasks_completed = tasks_completed + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (self.status, self.current_task, self.last_action, self.confidence, self.agent_id))
            conn.commit()
