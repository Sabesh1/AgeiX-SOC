/**
 * AegisX SOC - Application Reactive State Manager
 */

class SOCState {
  constructor() {
    this.state = {
      isLoggedIn: true, // Enabled for instant access, user can switch to login anytime
      currentScreen: 'screen-overview',
      currentIncidentId: 'INC-2048',
      clearanceTier: 'Tier 3 Lead Analyst',
      clearanceLevel: 'tier-3',
      soundEnabled: false,
      sidebarCollapsed: false,
      selectedTimeRange: '24h',
      streamPaused: false,
      streamSpeed: 1,
      approvedResponses: new Set(),
      rejectedResponses: new Set(),
      agentAutonomyLevels: {
        "agent-sentinel": "Full Autonomous",
        "agent-hunter": "Supervised",
        "agent-intel": "Full Autonomous",
        "agent-risk": "Full Autonomous",
        "agent-response": "Supervised (Human Gate)",
        "agent-reporter": "Full Autonomous"
      }
    };

    this.listeners = [];
  }

  get(key) {
    return this.state[key];
  }

  set(key, val) {
    this.state[key] = val;
    this.notify(key, val);
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify(key, val) {
    this.listeners.forEach(fn => fn(key, val, this.state));
  }
}

window.socState = new SOCState();
