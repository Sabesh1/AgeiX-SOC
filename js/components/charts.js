/**
 * AegisX SOC - Real-Time Canvas Charts & Visualizations
 * Multi-series streaming activity graph, risk donut chart, and KPI sparklines
 */

class RealTimeActivityChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.maxPoints = 40;

    // 5 Categories: Network, Malware, Phishing, Unauthorized, Exfiltration
    this.series = [
      { name: "Network Attacks", color: "#3b82f6", data: [], base: 35, variance: 15 },
      { name: "Malware", color: "#ef4444", data: [], base: 22, variance: 12 },
      { name: "Phishing", color: "#f59e0b", data: [], base: 18, variance: 8 },
      { name: "Unauthorized Access", color: "#a855f7", data: [], base: 14, variance: 9 },
      { name: "Data Exfiltration", color: "#00f2fe", data: [], base: 9, variance: 6 }
    ];

    // Seed initial history
    for (let i = 0; i < this.maxPoints; i++) {
      this.series.forEach(s => {
        const val = Math.max(2, Math.round(s.base + (Math.random() * 2 - 1) * s.variance));
        s.data.push(val);
      });
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startStreaming();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  startStreaming() {
    // Push new telemetry data point every 1200ms
    setInterval(() => {
      this.series.forEach(s => {
        const lastVal = s.data[s.data.length - 1];
        const delta = (Math.random() * 2 - 1) * (s.variance * 0.4);
        const newVal = Math.max(3, Math.min(80, Math.round(lastVal + delta)));
        s.data.push(newVal);
        if (s.data.length > this.maxPoints) {
          s.data.shift();
        }
      });
      this.draw();
    }, 1200);

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!ctx || w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw Grid Lines & Value Scale
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartH / ySteps) * i;
      const val = Math.round(80 - (80 / ySteps) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(val.toString(), 10, y + 3);
    }

    // Draw Time Axis Markers
    const xLabels = ["-45s", "-30s", "-15s", "LIVE NOW"];
    xLabels.forEach((label, idx) => {
      const x = padding.left + (chartW / (xLabels.length - 1)) * idx;
      ctx.fillText(label, x - (idx === xLabels.length - 1 ? 40 : 10), h - 8);
    });

    // Draw Each Line Series
    this.series.forEach(s => {
      if (s.data.length < 2) return;

      const stepX = chartW / (this.maxPoints - 1);

      // Area Fill
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartH);

      s.data.forEach((val, i) => {
        const x = padding.left + i * stepX;
        const y = padding.top + chartH - (val / 80) * chartH;
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          // Smooth curve
          const prevX = padding.left + (i - 1) * stepX;
          const prevY = padding.top + chartH - (s.data[i - 1] / 80) * chartH;
          const cx = (prevX + x) / 2;
          ctx.bezierCurveTo(cx, prevY, cx, y, x, y);
        }
      });

      ctx.lineTo(padding.left + (s.data.length - 1) * stepX, padding.top + chartH);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, s.color + "25");
      grad.addColorStop(1, s.color + "02");
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      s.data.forEach((val, i) => {
        const x = padding.left + i * stepX;
        const y = padding.top + chartH - (val / 80) * chartH;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = padding.left + (i - 1) * stepX;
          const prevY = padding.top + chartH - (s.data[i - 1] / 80) * chartH;
          const cx = (prevX + x) / 2;
          ctx.bezierCurveTo(cx, prevY, cx, y, x, y);
        }
      });

      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Pulsing head point on newest entry
      const lastX = padding.left + (s.data.length - 1) * stepX;
      const lastY = padding.top + chartH - (s.data[s.data.length - 1] / 80) * chartH;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
}

// Sparklines for KPI cards
function renderSparkline(canvas, data, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.clientWidth || 120;
  const h = canvas.height = 24;

  ctx.clearRect(0, 0, w, h);
  if (!data || data.length < 2) return;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;
  const step = w / (data.length - 1);

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = i * step;
    const y = h - ((val - min) / range) * (h - 6) - 3;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Donut Chart for Risk Analytics
function renderRiskDonut(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.clientWidth || 240;
  const h = canvas.height = 200;

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(cx, cy) - 25;
  const innerRadius = radius * 0.68;

  const data = [
    { label: "Ransomware", value: 34, color: "#ef4444" },
    { label: "Lateral Movement", value: 28, color: "#a855f7" },
    { label: "DNS Exfil", value: 18, color: "#00f2fe" },
    { label: "Credential Theft", value: 14, color: "#f59e0b" },
    { label: "Cloud Misconfig", value: 6, color: "#3b82f6" }
  ];

  const total = data.reduce((acc, d) => acc + d.value, 0);
  let startAngle = -Math.PI / 2;

  data.forEach(item => {
    const sliceAngle = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "#0a0f1d";
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += sliceAngle;
  });

  // Center Score
  ctx.font = "700 22px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("74", cx, cy - 6);

  ctx.font = "600 10px 'Inter', sans-serif";
  ctx.fillStyle = "#ef4444";
  ctx.fillText("ELEVATED", cx, cy + 12);
}

window.RealTimeActivityChart = RealTimeActivityChart;
window.renderSparkline = renderSparkline;
window.renderRiskDonut = renderRiskDonut;
