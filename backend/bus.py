"""
AegisX SOC - Inter-Agent Asynchronous Pub/Sub Message Broker & WebSocket Multiplexer
Facilitates real-time neural message passing between autonomous agents and streams live telemetry to frontend clients.
"""
import asyncio
import json
from typing import List, Dict, Any, Callable
from fastapi import WebSocket

class AgentMessageBus:
    def __init__(self):
        self.agent_subscribers: Dict[str, List[Callable]] = {}
        self.threat_websockets: List[WebSocket] = []
        self.agent_websockets: List[WebSocket] = []
        self._lock = asyncio.Lock()

    def subscribe(self, agent_name: str, handler: Callable):
        """Subscribes an agent callback to the bus"""
        if agent_name not in self.agent_subscribers:
            self.agent_subscribers[agent_name] = []
        self.agent_subscribers[agent_name].append(handler)

    async def publish(self, sender: str, recipient: str, topic: str, payload: Dict[str, Any]):
        """Broadcasts a message from one agent to another and out to WebSockets"""
        message = {
            "timestamp": payload.get("timestamp"),
            "sender": sender,
            "recipient": recipient,
            "topic": topic,
            "payload": payload
        }

        # Deliver to recipient agent handlers
        if recipient in self.agent_subscribers:
            for handler in self.agent_subscribers[recipient]:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        asyncio.create_task(handler(message))
                    else:
                        handler(message)
                except Exception as e:
                    print(f"Error delivering message to {recipient}: {e}")

        # Broadcast to connected agent graph WebSockets
        await self.broadcast_agent_event(message)

    async def register_threat_socket(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.threat_websockets.append(ws)

    async def unregister_threat_socket(self, ws: WebSocket):
        async with self._lock:
            if ws in self.threat_websockets:
                self.threat_websockets.remove(ws)

    async def broadcast_threat(self, threat: Dict[str, Any]):
        """Pushes a live security event to all connected dashboard clients"""
        dead_sockets = []
        msg_str = json.dumps(threat)
        async with self._lock:
            for ws in self.threat_websockets:
                try:
                    await ws.send_text(msg_str)
                except Exception:
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                if ws in self.threat_websockets:
                    self.threat_websockets.remove(ws)

    async def register_agent_socket(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.agent_websockets.append(ws)

    async def unregister_agent_socket(self, ws: WebSocket):
        async with self._lock:
            if ws in self.agent_websockets:
                self.agent_websockets.remove(ws)

    async def broadcast_agent_event(self, event: Dict[str, Any]):
        """Pushes an inter-agent communication packet to the frontend graph visualizer"""
        dead_sockets = []
        msg_str = json.dumps(event)
        async with self._lock:
            for ws in self.agent_websockets:
                try:
                    await ws.send_text(msg_str)
                except Exception:
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                if ws in self.agent_websockets:
                    self.agent_websockets.remove(ws)

# Global message bus singleton
agent_bus = AgentMessageBus()
