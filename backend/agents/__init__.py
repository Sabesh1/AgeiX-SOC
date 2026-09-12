"""
AegisX SOC - Multi-Agent Engine Package
"""
from backend.agents.sentinel import SentinelAgent
from backend.agents.hunter import HunterAgent
from backend.agents.intel import IntelAgent
from backend.agents.risk import RiskAgent
from backend.agents.response import ResponseAgent
from backend.agents.reporter import ReporterAgent

class MultiAgentEngine:
    def __init__(self):
        self.sentinel = SentinelAgent()
        self.hunter = HunterAgent()
        self.intel = IntelAgent()
        self.risk = RiskAgent()
        self.response = ResponseAgent()
        self.reporter = ReporterAgent()

        self.agents = [
            self.sentinel,
            self.hunter,
            self.intel,
            self.risk,
            self.response,
            self.reporter
        ]

    async def start_all(self):
        print("[MultiAgentEngine] Booting 6 autonomous agents...")
        for agent in self.agents:
            await agent.start()

    async def stop_all(self):
        print("[MultiAgentEngine] Stopping agents...")
        for agent in self.agents:
            await agent.stop()

# Global multi-agent engine instance
agent_engine = MultiAgentEngine()
