/**
 * AegisX SOC - Interactive Canvas Threat Map
 * Displays real-time animated cyber attack trajectories, origins, targets, and tactical radar pulses
 * Full support for interactive filtering (All Attacks, Ransomware, C2 Beacons, DDoS)
 */

class ThreatMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.animationFrameId = null;
    this.filter = 'all';

    // Target Enterprise Hubs (Normalized Coordinates 0.0 to 1.0)
    this.targets = [
      { id: "tgt-mum", name: "Mumbai Datacenter (DC-01)", x: 0.68, y: 0.52, isCrownJewel: true, type: "Core DB" },
      { id: "tgt-blr", name: "Bangalore Cloud VPC", x: 0.69, y: 0.56, isCrownJewel: false, type: "K8s Cluster" },
      { id: "tgt-fra", name: "Frankfurt AWS Hub", x: 0.49, y: 0.32, isCrownJewel: false, type: "Egress Gateway" },
      { id: "tgt-iad", name: "US-East Ashburn HQ", x: 0.24, y: 0.36, isCrownJewel: true, type: "Identity Provider" }
    ];

    // Adversary Origin Hubs
    this.origins = {
      bucharest: { id: "orig-ro", name: "Bucharest, RO", ip: "185.220.101.5", x: 0.53, y: 0.33, severity: "critical", threat: "LockBit 3.0 Encrypter", category: "ransomware" },
      stpetersburg: { id: "orig-ru", name: "St. Petersburg, RU", ip: "91.240.118.22", x: 0.56, y: 0.23, severity: "high", threat: "DNS Tunnel / Exfil", category: "c2" },
      frankfurt_tor: { id: "orig-de", name: "Frankfurt, DE (Tor)", ip: "45.154.255.89", x: 0.48, y: 0.31, severity: "critical", threat: "APT29 Kerberoasting C2", category: "c2" },
      pyongyang: { id: "orig-kp", name: "Pyongyang, KP", ip: "175.45.176.1", x: 0.81, y: 0.38, severity: "critical", threat: "Lazarus C2 Beacon", category: "c2" },
      shanghai: { id: "orig-cn", name: "Shanghai, CN", ip: "103.145.13.11", x: 0.79, y: 0.43, severity: "high", threat: "Distributed TCP SYN Flood", category: "ddos" },
      rio: { id: "orig-br", name: "Rio de Janeiro, BR", ip: "177.12.89.4", x: 0.34, y: 0.74, severity: "medium", threat: "Botnet Cluster (12k Nodes)", category: "ddos" },
      lagos: { id: "orig-ng", name: "Lagos, NG", ip: "102.164.21.9", x: 0.47, y: 0.58, severity: "critical", threat: "BlackCat Ransomware Stager", category: "ransomware" }
    };

    // All Pre-Configured Attack Trajectories with Categories
    this.masterArcs = [
      // 1. Ransomware Trajectories
      { id: "arc-ro-mum", origin: this.origins.bucharest, target: this.targets[0], progress: 0.15, speed: 0.007, color: "#ef4444", label: "LockBit 3.0 Ransomware Staging", category: "ransomware", severity: "critical" },
      { id: "arc-ng-mum", origin: this.origins.lagos, target: this.targets[0], progress: 0.55, speed: 0.006, color: "#ef4444", label: "BlackCat Pre-Encrypt Vector", category: "ransomware", severity: "critical" },
      
      // 2. C2 Beacons
      { id: "arc-de-iad", origin: this.origins.frankfurt_tor, target: this.targets[3], progress: 0.65, speed: 0.006, color: "#a855f7", label: "APT29 Tor C2 Beacon", category: "c2", severity: "critical" },
      { id: "arc-kp-fra", origin: this.origins.pyongyang, target: this.targets[2], progress: 0.30, speed: 0.005, color: "#00f2fe", label: "Lazarus C2 Data Exfil", category: "c2", severity: "high" },
      { id: "arc-ru-blr", origin: this.origins.stpetersburg, target: this.targets[1], progress: 0.42, speed: 0.006, color: "#3b82f6", label: "DNS Tunneling Protocol", category: "c2", severity: "high" },
      
      // 3. DDoS Trajectories
      { id: "arc-cn-mum", origin: this.origins.shanghai, target: this.targets[0], progress: 0.88, speed: 0.010, color: "#f59e0b", label: "TCP SYN Flood (45Gbps)", category: "ddos", severity: "high" },
      { id: "arc-br-fra", origin: this.origins.rio, target: this.targets[2], progress: 0.20, speed: 0.009, color: "#f59e0b", label: "UDP Amp Flood (12k Botnet)", category: "ddos", severity: "medium" }
    ];

    this.arcs = [...this.masterArcs];
    this.pulseRadius = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startAnimation();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  setFilter(type) {
    this.filter = type;
    this.updateStatsBadge();
  }

  updateStatsBadge() {
    const badge = document.getElementById('map-stats-badge');
    if (!badge) return;

    if (this.filter === 'ransomware') {
      badge.innerHTML = `
        <span>ACTIVE ARCS: <strong style="color: var(--red-primary);">2 Ransomware Trajectories</strong></span>
        <span>TARGET: <strong style="color: #fff;">DB-SERVER-04 (Mumbai DC-01)</strong></span>
      `;
    } else if (this.filter === 'c2') {
      badge.innerHTML = `
        <span>ACTIVE ARCS: <strong style="color: var(--purple-primary);">3 C2 Beacons Active</strong></span>
        <span>THREAT: <strong style="color: #fff;">Cobalt Strike / APT29 / Tor</strong></span>
      `;
    } else if (this.filter === 'ddos') {
      badge.innerHTML = `
        <span>ACTIVE ARCS: <strong style="color: var(--amber-primary);">2 Volumetric Floods</strong></span>
        <span>PEAK: <strong style="color: #fff;">45 Gbps SYN Flood</strong></span>
      `;
    } else {
      badge.innerHTML = `
        <span>ACTIVE ARCS: <strong style="color: var(--cyan-primary);">7 Trajectories</strong></span>
        <span>GEO ORIGINS: <strong style="color: var(--red-primary);">7 Hubs Active</strong></span>
      `;
    }
  }

  spawnRandomArc() {
    // Keep active trajectory pool healthy
    const origList = Object.values(this.origins);
    const orig = origList[Math.floor(Math.random() * origList.length)];
    const tgt = this.targets[Math.floor(Math.random() * this.targets.length)];
    const colors = { ransomware: "#ef4444", c2: "#00f2fe", ddos: "#f59e0b" };
    
    this.arcs.push({
      id: "arc-dynamic-" + Date.now(),
      origin: orig,
      target: tgt,
      progress: 0,
      speed: 0.005 + Math.random() * 0.005,
      color: colors[orig.category] || "#00f2fe",
      label: orig.threat,
      category: orig.category,
      severity: orig.severity
    });

    if (this.arcs.length > 10) {
      this.arcs.shift();
    }
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

    // 1. Draw Tactical Grid Background
    ctx.strokeStyle = "rgba(0, 242, 254, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Draw World Continent Outlines
    this.drawStylizedMap(ctx, w, h);

    // 3. Filter Arcs Based on Active Filter
    const activeArcs = this.filter === 'all' 
      ? this.arcs 
      : this.arcs.filter(a => a.category === this.filter);

    // Filter Active Origins
    const activeOrigins = this.filter === 'all'
      ? Object.values(this.origins)
      : Object.values(this.origins).filter(o => o.category === this.filter);

    // 4. Draw On-Canvas HUD Filter Indicator Banner if filtered
    if (this.filter !== 'all') {
      const bannerColor = this.filter === 'ransomware' ? '#ef4444' : this.filter === 'c2' ? '#a855f7' : '#f59e0b';
      ctx.save();
      ctx.fillStyle = bannerColor + '18';
      ctx.strokeStyle = bannerColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(14, 54, 380, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = "700 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = bannerColor;
      ctx.fillText(`● ACTIVE RADAR FILTER: ${this.filter.toUpperCase()} STAGING`, 24, 72);
      ctx.restore();
    }

    // 5. Draw Target Enterprise Hubs
    this.targets.forEach(tgt => {
      const tx = tgt.x * w;
      const ty = tgt.y * h;
      const isTargeted = activeArcs.some(a => a.target.id === tgt.id);

      // Glow ring
      ctx.beginPath();
      ctx.arc(tx, ty, isTargeted ? 18 : 12, 0, Math.PI * 2);
      ctx.fillStyle = isTargeted ? (tgt.isCrownJewel ? "rgba(239, 68, 68, 0.12)" : "rgba(0, 242, 254, 0.12)") : "rgba(255, 255, 255, 0.03)";
      ctx.fill();
      ctx.strokeStyle = isTargeted ? (tgt.isCrownJewel ? "#ef4444" : "#00f2fe") : "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer diamond
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = tgt.isCrownJewel ? "#ef4444" : "#00f2fe";
      ctx.lineWidth = isTargeted ? 2 : 1;
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.fillStyle = tgt.isCrownJewel ? "#ef4444" : "#00f2fe";
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();

      // Label
      ctx.font = isTargeted ? "700 10.5px 'JetBrains Mono', monospace" : "500 9.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = isTargeted ? "#ffffff" : "#94a3b8";
      ctx.fillText(tgt.name, tx + 14, ty + 3);

      ctx.font = "400 9px 'Inter', sans-serif";
      ctx.fillStyle = tgt.isCrownJewel ? "rgba(239, 68, 68, 0.9)" : "rgba(0, 242, 254, 0.8)";
      ctx.fillText(`[${tgt.type}]`, tx + 14, ty + 14);
    });

    // 6. Draw Adversary Origins with Radar Rings
    this.pulseRadius = (this.pulseRadius + 0.35) % 26;

    activeOrigins.forEach(orig => {
      const ox = orig.x * w;
      const oy = orig.y * h;
      const color = orig.category === "ransomware" ? "#ef4444" : orig.category === "c2" ? "#00f2fe" : "#f59e0b";

      // Pulsing radar ring
      ctx.beginPath();
      ctx.arc(ox, oy, this.pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = Math.max(0, 1 - this.pulseRadius / 26);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Core dot
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Origin tag
      ctx.font = "600 10px 'Inter', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(orig.name, ox + 10, oy - 4);

      ctx.font = "500 8.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = color;
      ctx.fillText(orig.threat, ox + 10, oy + 7);
    });

    // 7. Draw Attack Trajectory Arcs with Traveling Glowing Photons
    activeArcs.forEach(arc => {
      const sx = arc.origin.x * w;
      const sy = arc.origin.y * h;
      const ex = arc.target.x * w;
      const ey = arc.target.y * h;

      // Curved control point
      const dx = ex - sx;
      const dy = ey - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cx = (sx + ex) / 2 - dy * 0.25;
      const cy = (sy + ey) / 2 + dx * 0.25 - dist * 0.15;

      // Draw faint trajectory path
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cx, cy, ex, ey);
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = this.filter !== 'all' ? 2 : 1.2;
      ctx.globalAlpha = this.filter !== 'all' ? 0.45 : 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Calculate photon position along quadratic bezier curve
      const t = arc.progress;
      const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
      const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey;

      // Draw glowing projectile particle
      ctx.beginPath();
      ctx.arc(px, py, this.filter !== 'all' ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = arc.color;
      ctx.shadowColor = arc.color;
      ctx.shadowBlur = this.filter !== 'all' ? 16 : 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw trailing tail
      const tailT = Math.max(0, t - 0.05);
      const txTail = (1 - tailT) * (1 - tailT) * sx + 2 * (1 - tailT) * tailT * cx + tailT * tailT * ex;
      const tyTail = (1 - tailT) * (1 - tailT) * sy + 2 * (1 - tailT) * tailT * cy + tailT * tailT * ey;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(txTail, tyTail);
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Advance progress
      arc.progress += arc.speed;
      if (arc.progress > 1.0) {
        arc.progress = 0;
      }
    });
  }

  drawStylizedMap(ctx, w, h) {
    const landClusters = [
      { cx: 0.22, cy: 0.32, rx: 0.12, ry: 0.10, points: 18 },
      { cx: 0.32, cy: 0.66, rx: 0.07, ry: 0.14, points: 14 },
      { cx: 0.50, cy: 0.28, rx: 0.08, ry: 0.08, points: 16 },
      { cx: 0.52, cy: 0.55, rx: 0.09, ry: 0.15, points: 18 },
      { cx: 0.70, cy: 0.38, rx: 0.16, ry: 0.14, points: 26 },
      { cx: 0.83, cy: 0.72, rx: 0.08, ry: 0.07, points: 12 }
    ];

    ctx.fillStyle = "rgba(148, 163, 184, 0.06)";
    landClusters.forEach(c => {
      const centerX = c.cx * w;
      const centerY = c.cy * h;
      const radX = c.rx * w;
      const radY = c.ry * h;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radX, radY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0, 242, 254, 0.12)";
      for (let i = 0; i < c.points; i++) {
        const angle = (i / c.points) * Math.PI * 2;
        const rFactor = 0.3 + (i % 3) * 0.25;
        const px = centerX + Math.cos(angle) * radX * rFactor;
        const py = centerY + Math.sin(angle) * radY * rFactor;
        ctx.fillRect(px, py, 2, 2);
      }
      ctx.fillStyle = "rgba(148, 163, 184, 0.06)";
    });
  }
}

window.ThreatMap = ThreatMap;
