/**
 * AegisX SOC - Interactive Multi-Agent Communication Graph
 * Visualizes autonomous agent collaboration, message-passing, and neural inferences
 */

class AgentCommunicationGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.animationFrameId = null;

    // Agent Nodes (6 Autonomous agents + Central Orchestration Hub)
    this.nodes = [
      { id: "agent-sentinel", name: "Sentinel", role: "Detection", angle: 0, color: "#00f2fe", radius: 24 },
      { id: "agent-hunter", name: "Hunter", role: "Investigation", angle: Math.PI / 3, color: "#a855f7", radius: 24 },
      { id: "agent-intel", name: "Intel", role: "Intelligence", angle: 2 * Math.PI / 3, color: "#3b82f6", radius: 24 },
      { id: "agent-risk", name: "Risk", role: "Risk Assessment", angle: Math.PI, color: "#f59e0b", radius: 24 },
      { id: "agent-response", name: "Response", role: "Containment", angle: 4 * Math.PI / 3, color: "#ef4444", radius: 24 },
      { id: "agent-reporter", name: "Reporter", role: "Reporting", angle: 5 * Math.PI / 3, color: "#10b981", radius: 24 }
    ];

    // Inter-agent message links
    this.links = [
      { from: 0, to: 1, label: "Telemetry Telemetry" },
      { from: 1, to: 2, label: "IOC Hash Query" },
      { from: 2, to: 3, label: "Attribution Signal" },
      { from: 3, to: 4, label: "Blast Radius Spec" },
      { from: 4, to: 5, label: "Action Audit Log" },
      { from: 1, to: 4, label: "Direct Triage" },
      { from: 0, to: 3, label: "Anomaly Score" }
    ];

    // Dynamic message packets in transit
    this.packets = [
      { linkIndex: 0, progress: 0.2, speed: 0.008, color: "#00f2fe", message: "Kerberos Brute Force Pattern" },
      { linkIndex: 1, progress: 0.7, speed: 0.006, color: "#a855f7", message: "SHA256: 9e107d9d... LockBit" },
      { linkIndex: 2, progress: 0.4, speed: 0.007, color: "#3b82f6", message: "C2 IP 185.220.101.5 Malicious" },
      { linkIndex: 3, progress: 0.85, speed: 0.005, color: "#f59e0b", message: "Target Crown Jewel Risk 98" },
      { linkIndex: 4, progress: 0.1, speed: 0.009, color: "#ef4444", message: "Firewall Drop Rule Staged" }
    ];

    this.activeLog = "Sentinel Agent broadcasting correlated beacon anomalies to Hunter Agent";
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startAnimation();

    // Rotate simulated active log every 4s
    const logs = [
      "Hunter Agent querying Intel Agent for LockBit 3.0 campaign attribution...",
      "Intel Agent verified C2 IP 185.220.101.5 against AlienVault OTX & VirusTotal",
      "Risk Agent calculated DB-SERVER-04 blast radius: High financial exposure",
      "Response Agent awaiting 2-man approval to isolate production database host",
      "Reporter Agent auto-drafting NIST CSF 2.0 forensic compliance timeline"
    ];
    let logIdx = 0;
    setInterval(() => {
      logIdx = (logIdx + 1) % logs.length;
      this.activeLog = logs[logIdx];
      const logEl = document.getElementById("agent-graph-live-log");
      if (logEl) logEl.textContent = this.activeLog;
    }, 4000);
  }

  resize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  startAnimation() {
    const render = () => {
      this.draw();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!ctx || w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const orbitRadius = Math.min(cx, cy) * 0.68;

    // Draw Background Grid Rings
    ctx.strokeStyle = "rgba(0, 242, 254, 0.05)";
    ctx.lineWidth = 1;
    [0.3, 0.68, 0.9].forEach(rRatio => {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(cx, cy) * rRatio, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Calculate node coordinates
    const positions = this.nodes.map(node => {
      const x = cx + Math.cos(node.angle) * orbitRadius;
      const y = cy + Math.sin(node.angle) * orbitRadius;
      return { x, y, ...node };
    });

    // Draw Links Between Agents
    ctx.lineWidth = 1;
    this.links.forEach(link => {
      const src = positions[link.from];
      const dst = positions[link.to];

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(dst.x, dst.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();
    });

    // Draw Central Mesh Hub (Autonomous Neural Core)
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 15, 29, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#00f2fe";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AEGIS", cx, cy - 6);
    ctx.font = "600 8px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("AGENT BUS", cx, cy + 8);

    // Draw Moving Message Packets
    this.packets.forEach(pkt => {
      const link = this.links[pkt.linkIndex];
      const src = positions[link.from];
      const dst = positions[link.to];

      const px = src.x + (dst.x - src.x) * pkt.progress;
      const py = src.y + (dst.y - src.y) * pkt.progress;

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = pkt.color;
      ctx.shadowColor = pkt.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      pkt.progress += pkt.speed;
      if (pkt.progress > 1.0) {
        pkt.progress = 0;
      }
    });

    // Draw Agent Nodes
    positions.forEach(node => {
      // Glow circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner badge
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color + "20";
      ctx.fill();

      // Node Name & Role
      ctx.font = "700 11px 'Inter', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.name, node.x, node.y - 4);

      ctx.font = "500 8.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = node.color;
      ctx.fillText(node.role, node.x, node.y + 7);
    });
  }
}

window.AgentCommunicationGraph = AgentCommunicationGraph;
