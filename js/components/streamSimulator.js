/**
 * AegisX SOC - Real-Time Telemetry Stream Simulator
 * Continuously pushes realistic security events into the live stream and SOC counters
 */

class StreamSimulator {
  constructor() {
    this.intervalId = null;
    this.isPaused = false;
    this.speed = 2500; // default 2.5s interval
    this.eventCounter = 142;

    this.sampleThreats = [
      { source: "185.220.101.5", type: "Cobalt Strike Beacon", severity: "CRITICAL", asset: "DB-SERVER-04", classification: "Malware C2", status: "Blocked" },
      { source: "103.145.13.11", type: "Blind SQL Injection (xp_cmdshell)", severity: "HIGH", asset: "API-GATEWAY-01", classification: "Web App Attack", status: "Filtered" },
      { source: "45.154.255.89", type: "Kerberos TGT Golden Ticket Request", severity: "CRITICAL", asset: "AD-DC-01", classification: "Privilege Escalation", status: "Under Review" },
      { source: "194.26.29.112", type: "SSH Password Spray (Port 22)", severity: "MEDIUM", asset: "DEV-BASTION-03", classification: "Credential Access", status: "Auto-Banned" },
      { source: "10.10.40.18", type: "Base64 Obfuscated PowerShell Command", severity: "CRITICAL", asset: "DB-SERVER-04", classification: "Execution", status: "Investigating" },
      { source: "91.240.118.22", type: "Anomalous DNS TXT Exfiltration Tunnel", severity: "HIGH", asset: "DNS-RESOLVER-INT", classification: "Exfiltration", status: "Rate-Limited" },
      { source: "185.196.220.14", type: "OAuth Device Code Authorization Phish", severity: "MEDIUM", asset: "OKTA-AUTH-SVC", classification: "Defense Evasion", status: "Flagged" },
      { source: "89.248.165.71", type: "SYN Stealth Port Sweep (Top 1000)", severity: "LOW", asset: "FIREWALL-PERIM-01", classification: "Reconnaissance", status: "Logged" },
      { source: "198.51.100.44", type: "Unauthorized AWS IAM Role Assumption", severity: "HIGH", asset: "AWS-IAM-ADMIN-ROLE", classification: "Cloud Privilege", status: "Quarantined" }
    ];

    this.start();
  }

  start() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.generateEvent();
      }
    }, this.speed);
  }

  setSpeed(multiplier) {
    clearInterval(this.intervalId);
    this.speed = Math.round(2500 / multiplier);
    this.start();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  generateEvent() {
    const raw = this.sampleThreats[Math.floor(Math.random() * this.sampleThreats.length)];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const event = {
      time: timeStr,
      source: raw.source,
      type: raw.type,
      severity: raw.severity,
      asset: raw.asset,
      classification: raw.classification,
      status: raw.status
    };

    // 1. Prepend to Live Threats table if present
    const streamBody = document.getElementById('live-stream-tbody');
    if (streamBody) {
      const tr = document.createElement('tr');
      tr.className = 'stream-table-row-new';

      let sevBadge = 'badge-low';
      if (event.severity === 'CRITICAL') sevBadge = 'badge-critical';
      else if (event.severity === 'HIGH') sevBadge = 'badge-high';
      else if (event.severity === 'MEDIUM') sevBadge = 'badge-medium';

      tr.innerHTML = `
        <td class="soc-mono">${event.time}</td>
        <td class="soc-mono" style="color: var(--cyan-primary);">${event.source}</td>
        <td style="font-weight: 600; color: #fff;">${event.type}</td>
        <td><span class="badge ${sevBadge}">${event.severity}</span></td>
        <td class="soc-mono" style="color: var(--text-bright);">${event.asset}</td>
        <td><span class="badge badge-purple" style="font-size: 10px;">${event.classification}</span></td>
        <td><span class="badge badge-online" style="font-size: 10px;">${event.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="window.socApp.triageStreamEvent('${event.source}', '${event.asset}', '${event.type}')" style="padding: 3px 8px; font-size: 10.5px;">
            AI Triage
          </button>
        </td>
      `;

      streamBody.insertBefore(tr, streamBody.firstChild);

      // Keep table at max 25 rows
      if (streamBody.children.length > 25) {
        streamBody.removeChild(streamBody.lastChild);
      }
    }

    // 2. Increment active threats counter occasionally
    this.eventCounter++;
    const threatCountEl = document.getElementById('kpi-active-threats-val');
    if (threatCountEl && Math.random() > 0.6) {
      threatCountEl.textContent = this.eventCounter;
      threatCountEl.style.color = "var(--red-primary)";
      setTimeout(() => {
        if (threatCountEl) threatCountEl.style.color = "var(--text-bright)";
      }, 400);
    }

    // 3. Trigger arc on Threat Map if map is initialized
    if (window.socThreatMap && Math.random() > 0.4) {
      window.socThreatMap.spawnRandomArc();
    }
  }
}

window.StreamSimulator = StreamSimulator;
