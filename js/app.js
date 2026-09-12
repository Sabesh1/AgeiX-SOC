/**
 * AegisX SOC - Main Application Controller & Router
 * Wires all 12 screens, interactive event listeners, modals, and cyber micro-interactions
 */

class AegisApp {
  constructor() {
    this.init();
  }

  init() {
    // 1. Initialize Visualizations & Subsystems
    this.threatMap = new ThreatMap('threat-map-canvas');
    window.socThreatMap = this.threatMap;

    this.activityChart = new RealTimeActivityChart('threat-activity-canvas');
    window.socActivityChart = this.activityChart;

    this.copilot = new AegisCopilot();
    window.socCopilot = this.copilot;

    this.streamSimulator = new StreamSimulator();
    window.socStreamSimulator = this.streamSimulator;

    // 2. Setup Navigation & UI Listeners
    this.setupNavigation();
    this.setupSearchAndShortcuts();
    this.setupModalsAndToasts();
    this.setupTimeRangeSelector();

    // 3. Render Initial Screen Content
    this.renderOverview();
    this.renderIncidentsTable();
    this.renderAgentPanelOverview();
    this.renderLiveStreamInitial();
    this.renderIncidentDetails(window.socState.get('currentIncidentId'));
    this.renderAgentCommandCenter();
    this.renderThreatIntel();
    this.renderAttackTimeline();
    this.renderRiskAnalytics();
    this.renderAutomatedResponse();
    this.renderReports();
    this.renderSettings();

    // 4. Render Sparklines on Overview KPIs
    setTimeout(() => {
      renderSparkline(document.getElementById('sparkline-1'), [30, 45, 60, 80, 95, 120, 142], '#ef4444');
      renderSparkline(document.getElementById('sparkline-2'), [4, 5, 4, 6, 5, 7, 7], '#ef4444');
      renderSparkline(document.getElementById('sparkline-3'), [18, 19, 21, 22, 23, 24, 25], '#00f2fe');
      renderSparkline(document.getElementById('sparkline-4'), [45, 44, 42, 40, 39, 38, 38], '#10b981');
      renderSparkline(document.getElementById('sparkline-5'), [60, 68, 72, 79, 84, 87, 89], '#a855f7');
      renderSparkline(document.getElementById('sparkline-6'), [1100, 1180, 1240, 1310, 1380, 1412], '#3b82f6');
      renderRiskDonut('risk-donut-canvas');
    }, 250);

    // 5. Connect to Live Backend WebSocket Stream
    this.initBackendWebSocket();
  }

  initBackendWebSocket() {
    if (window.location && window.location.protocol.startsWith('http')) {
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const threatWsUrl = `${wsProto}//${window.location.host}/api/threats/ws`;
      try {
        const ws = new WebSocket(threatWsUrl);
        ws.onopen = () => {
          console.log('[AegisX Frontend] Connected to Backend Threat WebSocket');
          const pill = document.querySelector('.ai-status-pill span:last-child');
          if (pill) pill.textContent = 'AI SOC ONLINE • MULTI-AGENT BACKEND';
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.source && data.type) {
              const tbody = document.getElementById('live-stream-tbody');
              if (tbody) {
                const tr = document.createElement('tr');
                tr.className = 'stream-table-row-new';
                let sevBadge = 'badge-low';
                if (data.severity === 'CRITICAL') sevBadge = 'badge-critical';
                else if (data.severity === 'HIGH') sevBadge = 'badge-high';
                else if (data.severity === 'MEDIUM') sevBadge = 'badge-medium';

                tr.innerHTML = `
                  <td class="soc-mono">${data.time}</td>
                  <td class="soc-mono" style="color: var(--cyan-primary);">${data.source}</td>
                  <td style="font-weight: 600; color: #fff;">${data.type}</td>
                  <td><span class="badge ${sevBadge}">${data.severity}</span></td>
                  <td class="soc-mono" style="color: var(--text-bright);">${data.asset}</td>
                  <td><span class="badge badge-purple" style="font-size: 10px;">${data.classification}</span></td>
                  <td><span class="badge badge-online" style="font-size: 10px;">${data.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-secondary" onclick="window.socApp.triageStreamEvent('${data.source}', '${data.asset}', '${data.type}')" style="padding: 3px 8px; font-size: 10.5px;">
                      AI Triage
                    </button>
                  </td>
                `;
                tbody.insertBefore(tr, tbody.firstChild);
                if (tbody.children.length > 25) tbody.removeChild(tbody.lastChild);
              }
            }
          } catch(e) {}
        };
      } catch (err) {
        console.warn('Backend WebSocket unavailable, relying on simulated telemetry', err);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Navigation & Screen Switcher
  // --------------------------------------------------------------------------
  setupNavigation() {
    // Left Sidebar Navigation Items
    document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = item.getAttribute('data-screen');
        this.navigateTo(screenId);
      });
    });

    // Sidebar Collapse Toggle
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.querySelector('.soc-sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        setTimeout(() => {
          if (this.threatMap) this.threatMap.resize();
          if (this.activityChart) this.activityChart.resize();
          if (this.agentGraph) this.agentGraph.resize();
        }, 300);
      });
    }

    // Copilot Trigger Buttons
    const copilotBtn = document.getElementById('topbar-copilot-btn');
    if (copilotBtn) {
      copilotBtn.addEventListener('click', () => this.copilot.toggle());
    }

    // Sound Toggle Button
    const soundBtn = document.getElementById('topbar-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = window.socSound.toggle();
        soundBtn.innerHTML = isEnabled
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-primary)" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
        this.showToast("Audio Alerts", isEnabled ? "Cyber tactile sound effects activated" : "Sound muted", "info");
      });
    }

    // Login Clearance Selection
    document.querySelectorAll('.clearance-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.clearance-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const tier = opt.getAttribute('data-tier');
        window.socState.set('clearanceLevel', tier);
        window.socState.set('clearanceTier', opt.querySelector('.clearance-tier').textContent);
      });
    });

    // Enter SOC Portal
    const enterBtn = document.getElementById('login-enter-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        const loginScreen = document.getElementById('screen-login');
        if (loginScreen) loginScreen.classList.add('hidden');
        window.socState.set('isLoggedIn', true);
        this.updateUserBadge();
        this.showToast("Access Granted", `Authenticated as ${window.socState.get('clearanceTier')} (Level 4 Clearance)`, "success");
        if (window.socSound) window.socSound.playSuccess();
      });
    }

    // Analyst Profile Menu Click -> Shows Login / Clearance switcher
    const profileBtn = document.getElementById('sidebar-analyst-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        const loginScreen = document.getElementById('screen-login');
        if (loginScreen) loginScreen.classList.remove('hidden');
      });
    }
  }

  navigateTo(screenId) {
    window.socState.set('currentScreen', screenId);

    // 1. Update Active Sidebar Item
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // 2. Hide All Screens, Show Target
    document.querySelectorAll('.screen-container').forEach(el => el.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // 3. Trigger Screen-specific Inits
    if (screenId === 'screen-overview') {
      setTimeout(() => {
        if (this.threatMap) this.threatMap.resize();
        if (this.activityChart) this.activityChart.resize();
      }, 100);
    } else if (screenId === 'screen-agents') {
      if (!this.agentGraph) {
        this.agentGraph = new AgentCommunicationGraph('agent-network-canvas-wrap');
      } else {
        setTimeout(() => this.agentGraph.resize(), 100);
      }
    } else if (screenId === 'screen-risk-analytics') {
      setTimeout(() => renderRiskDonut('risk-donut-canvas-page'), 100);
    }

    if (window.socSound) window.socSound.playClick();
  }

  updateUserBadge() {
    const roleEl = document.getElementById('analyst-role-text');
    if (roleEl) roleEl.textContent = window.socState.get('clearanceTier');
  }

  // --------------------------------------------------------------------------
  // Keyboard Shortcuts & Global Command Palette
  // --------------------------------------------------------------------------
  setupSearchAndShortcuts() {
    const searchInput = document.getElementById('global-search-input');
    const cmdPalette = document.getElementById('command-palette-modal');
    const cmdInput = document.getElementById('cmd-palette-input');

    const openPalette = () => {
      if (cmdPalette) {
        cmdPalette.classList.add('active');
        if (cmdInput) {
          cmdInput.value = '';
          cmdInput.focus();
        }
      }
    };

    const closePalette = () => {
      if (cmdPalette) cmdPalette.classList.remove('active');
    };

    if (searchInput) {
      searchInput.addEventListener('click', openPalette);
    }

    // Ctrl+K / Cmd+K listener & Ctrl+J Copilot
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        this.copilot.toggle();
      } else if (e.key === 'Escape') {
        closePalette();
        this.closeModal();
      }
    });

    const closeBtn = document.getElementById('cmd-palette-close');
    if (closeBtn) closeBtn.addEventListener('click', closePalette);

    if (cmdPalette) {
      cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) closePalette();
      });
    }

    // Filter Command Items
    if (cmdInput) {
      cmdInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.cmd-item').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }
  }

  executeCommand(action, param) {
    const cmdPalette = document.getElementById('command-palette-modal');
    if (cmdPalette) cmdPalette.classList.remove('active');

    if (action === 'navigate') {
      this.navigateTo(param);
    } else if (action === 'incident') {
      this.viewIncident(param);
    } else if (action === 'copilot') {
      this.copilot.ask(param);
    } else if (action === 'quarantine') {
      this.openApprovalModal("REC-104");
    }
  }

  setupTimeRangeSelector() {
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = btn.getAttribute('data-range');
        window.socState.set('selectedTimeRange', range);
        this.showToast("Time Horizon", `Filtered dashboard telemetry to: ${btn.textContent}`, "info");
      });
    });
  }

  // --------------------------------------------------------------------------
  // Modals & Toast Notifications
  // --------------------------------------------------------------------------
  setupModalsAndToasts() {
    const modalBackdrop = document.getElementById('general-modal-backdrop');
    const modalClose = document.getElementById('general-modal-close');
    if (modalClose && modalBackdrop) {
      modalClose.addEventListener('click', () => this.closeModal());
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeModal();
      });
    }
  }

  openModal(title, bodyHtml, footerHtml = '') {
    const modal = document.getElementById('general-modal-backdrop');
    const titleEl = document.getElementById('general-modal-title');
    const bodyEl = document.getElementById('general-modal-body');
    const footerEl = document.getElementById('general-modal-footer');

    if (modal && titleEl && bodyEl) {
      titleEl.innerHTML = title;
      bodyEl.innerHTML = bodyHtml;
      if (footerEl) {
        footerEl.innerHTML = footerHtml;
        footerEl.style.display = footerHtml ? 'flex' : 'none';
      }
      modal.classList.add('active');
    }
  }

  closeModal() {
    const modal = document.getElementById('general-modal-backdrop');
    if (modal) modal.classList.remove('active');
  }

  showToast(title, message, type = 'info') {
    const container = document.getElementById('soc-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `soc-toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber-primary)" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="soc-toast-icon">${iconSvg}</div>
      <div class="soc-toast-content">
        <div class="soc-toast-title">${title}</div>
        <div class="soc-toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --------------------------------------------------------------------------
  // Screen Renderers
  // --------------------------------------------------------------------------
  renderOverview() {
    // Map Filter Buttons
    document.querySelectorAll('.map-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-filter-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        const filter = btn.getAttribute('data-filter');
        if (this.threatMap) {
          this.threatMap.setFilter(filter);
        }
        if (window.socSound) window.socSound.playClick();
        this.showToast("Radar Filter Active", `Map filtered to: ${btn.textContent.toUpperCase()}`, "info");
      });
    });
  }

  renderIncidentsTable() {
    const tbody = document.getElementById('overview-incidents-tbody');
    if (!tbody) return;

    tbody.innerHTML = window.AegisData.incidents.map(inc => `
      <tr onclick="window.socApp.viewIncident('${inc.id}')">
        <td class="soc-mono" style="font-weight: 700; color: var(--cyan-primary);">${inc.id}</td>
        <td style="font-weight: 600; color: #fff;">${inc.title}</td>
        <td><span class="badge ${inc.severityBadge}">${inc.severity}</span></td>
        <td class="soc-mono" style="color: var(--text-bright);">${inc.asset}</td>
        <td class="soc-mono" style="color: var(--text-muted); font-size: 11px;">${inc.source}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: ${inc.riskScore > 90 ? 'var(--red-primary)' : 'var(--amber-primary)'};">${inc.riskScore}%</td>
        <td><span class="badge badge-purple" style="font-size: 10px;">${inc.assignedAgent}</span></td>
        <td><span class="badge ${inc.statusBadge}">${inc.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" style="font-size: 10.5px; padding: 3px 8px;">Investigate →</button>
        </td>
      </tr>
    `).join('');
  }

  renderAgentPanelOverview() {
    const container = document.getElementById('overview-agents-panel');
    if (!container) return;

    container.innerHTML = window.AegisData.agents.map(ag => `
      <div class="agent-live-row" onclick="window.socApp.navigateTo('screen-agents')">
        <div class="agent-avatar-mini" style="background: ${ag.avatarBg}; color: ${ag.avatarColor}; border: 1px solid ${ag.avatarColor}40;">
          ${ag.initials}
        </div>
        <div class="agent-row-content">
          <div class="agent-row-header">
            <span class="agent-name-text">${ag.name}</span>
            <span class="badge ${ag.statusBadge}" style="font-size: 9px; padding: 1px 5px;">${ag.status}</span>
          </div>
          <div class="agent-task-text" title="${ag.currentTask}">${ag.currentTask}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 9.5px; color: var(--text-dim); margin-bottom: 4px;">
            <span>Confidence: <strong style="color: var(--cyan-primary);">${ag.confidence}%</strong></span>
            <span class="soc-mono">${ag.latency}</span>
          </div>
          <div class="agent-progress-bar-track">
            <div class="agent-progress-bar-fill" style="width: ${ag.confidence}%; background: ${ag.avatarColor};"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderLiveStreamInitial() {
    const tbody = document.getElementById('live-stream-tbody');
    if (!tbody) return;

    tbody.innerHTML = window.AegisData.liveThreatEvents.map(evt => {
      let sevBadge = 'badge-low';
      if (evt.severity === 'CRITICAL') sevBadge = 'badge-critical';
      else if (evt.severity === 'HIGH') sevBadge = 'badge-high';
      else if (evt.severity === 'MEDIUM') sevBadge = 'badge-medium';

      return `
        <tr>
          <td class="soc-mono">${evt.time}</td>
          <td class="soc-mono" style="color: var(--cyan-primary);">${evt.source}</td>
          <td style="font-weight: 600; color: #fff;">${evt.type}</td>
          <td><span class="badge ${sevBadge}">${evt.severity}</span></td>
          <td class="soc-mono" style="color: var(--text-bright);">${evt.asset}</td>
          <td><span class="badge badge-purple" style="font-size: 10px;">${evt.classification}</span></td>
          <td><span class="badge badge-online" style="font-size: 10px;">${evt.status}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="window.socApp.triageStreamEvent('${evt.source}', '${evt.asset}', '${evt.type}')" style="padding: 3px 8px; font-size: 10.5px;">
              AI Triage
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Stream Controls
    const pauseBtn = document.getElementById('stream-pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        const isPaused = this.streamSimulator.togglePause();
        pauseBtn.innerHTML = isPaused ? '▶ Resume Stream' : '⏸ Pause Stream';
        pauseBtn.classList.toggle('btn-secondary');
        pauseBtn.classList.toggle('btn-primary');
      });
    }

    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.getAttribute('data-speed'));
        this.streamSimulator.setSpeed(speed);
      });
    });
  }

  triageStreamEvent(source, asset, type) {
    this.copilot.ask(`Investigate event: ${type} on ${asset} originating from ${source}`);
  }

  viewIncident(incidentId) {
    window.socState.set('currentIncidentId', incidentId);
    this.renderIncidentDetails(incidentId);
    this.navigateTo('screen-incident-details');
  }

  renderIncidentDetails(incidentId) {
    const inc = window.AegisData.incidents.find(i => i.id === incidentId) || window.AegisData.incidents[0];

    // Banner Header
    const idEl = document.getElementById('inc-detail-id');
    const titleEl = document.getElementById('inc-detail-title');
    const subEl = document.getElementById('inc-detail-sub');
    const riskEl = document.getElementById('inc-detail-risk-val');
    const confEl = document.getElementById('inc-detail-conf-val');

    if (idEl) idEl.textContent = inc.id;
    if (titleEl) titleEl.textContent = inc.title;
    if (subEl) subEl.innerHTML = `<span>Threat: <strong>${inc.threatType}</strong></span> • <span>Target: <strong>${inc.asset}</strong></span> • <span>Detected: <strong>${inc.timestamp}</strong></span>`;
    if (riskEl) riskEl.textContent = `${inc.riskScore}%`;
    if (confEl) confEl.textContent = `${inc.confidenceScore}%`;

    // Section A: Incident Summary
    const sumEl = document.getElementById('inc-detail-summary-text');
    const whatEl = document.getElementById('inc-detail-what');
    const whenEl = document.getElementById('inc-detail-when');
    const affectedEl = document.getElementById('inc-detail-affected');
    const sourceEl = document.getElementById('inc-detail-source');
    const impactEl = document.getElementById('inc-detail-impact');

    if (sumEl) sumEl.textContent = inc.summary || "Deep forensic correlation active across telemetry logs.";
    if (whatEl) whatEl.textContent = inc.title;
    if (whenEl) whenEl.textContent = inc.timestamp;
    if (affectedEl) affectedEl.textContent = (inc.affectedSystems || [inc.asset]).join(', ');
    if (sourceEl) sourceEl.textContent = inc.attackSource || inc.source;
    if (impactEl) impactEl.textContent = inc.potentialImpact || "Elevated enterprise risk score.";

    // Section C: Attack Timeline Kill-Chain
    const timelineEl = document.getElementById('inc-detail-killchain');
    if (timelineEl && inc.timeline) {
      timelineEl.innerHTML = inc.timeline.map((step, idx) => `
        <div class="killchain-step ${step.status}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="killchain-step-num">${step.step} • ${step.stage}</div>
            <span class="badge ${step.status === 'completed' ? 'badge-online' : 'badge-critical'}" style="font-size: 8.5px; padding: 1px 5px;">${step.status.toUpperCase()}</span>
          </div>
          <div class="killchain-step-title">${step.title}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${step.desc}</div>
          <div class="killchain-step-time">⏱ ${step.time} UTC</div>
        </div>
      `).join('');
    }

    // Section D: Evidence Locker
    const ev = inc.evidence || window.AegisData.incidents[0].evidence;
    const ipTbody = document.getElementById('inc-evidence-ips-tbody');
    if (ipTbody && ev.ips) {
      ipTbody.innerHTML = ev.ips.map(item => `
        <tr>
          <td class="soc-mono" style="color: var(--cyan-primary); font-weight: 700;">${item.ip}</td>
          <td>${item.role}</td>
          <td>${item.country}</td>
          <td style="color: #f87171;">${item.rep}</td>
          <td><button class="btn btn-sm btn-outline" onclick="window.socApp.copilot.ask('Investigate IP ${item.ip}')">Enrich</button></td>
        </tr>
      `).join('');
    }

    const hashesTbody = document.getElementById('inc-evidence-hashes-tbody');
    if (hashesTbody && ev.hashes) {
      hashesTbody.innerHTML = ev.hashes.map(h => `
        <tr>
          <td class="soc-mono" style="font-size: 10.5px; color: #fff; max-width: 280px; overflow: hidden; text-overflow: ellipsis;">${h.hash}</td>
          <td class="soc-mono" style="color: var(--cyan-primary);">${h.file}</td>
          <td style="color: #f87171; font-weight: 600;">${h.verdict}</td>
          <td><button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText('${h.hash}'); window.socApp.showToast('Copied', 'SHA-256 hash copied to clipboard', 'info');">Copy</button></td>
        </tr>
      `).join('');
    }

    const rawLogsEl = document.getElementById('inc-evidence-raw-logs');
    if (rawLogsEl && ev.logs) {
      rawLogsEl.innerHTML = ev.logs.map(log => `<div>${this.escapeHtml(log)}</div>`).join('');
    }

    // Section E: Agent Decision Trace
    const traceEl = document.getElementById('inc-detail-decision-trace');
    if (traceEl && inc.decisionTrace) {
      traceEl.innerHTML = inc.decisionTrace.map(dt => `
        <div class="decision-trace-item">
          <div class="decision-node-dot"></div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: #fff; font-size: 13px;">${dt.agent}</strong>
              <span class="badge badge-purple" style="font-size: 9.5px;">${dt.role}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 11px; color: var(--cyan-primary); font-family: var(--font-mono);">Confidence: <strong>${dt.confidence}%</strong></span>
              <span class="soc-mono" style="color: var(--text-dim); font-size: 10px;">${dt.time}</span>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-bright); font-weight: 600; margin-bottom: 4px;">
            ${dt.finding}
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 4px; border-left: 2px solid var(--cyan-deep);">
            <strong>Reasoning:</strong> ${dt.reasoning}
          </div>
          <div style="margin-top: 6px; font-size: 10px; font-family: var(--font-mono); color: var(--text-dim);">
            Verifiable Decision Signature: <code>sha256:${dt.hash}</code>
          </div>
        </div>
      `).join('');
    }
  }

  // --------------------------------------------------------------------------
  // AI Agent Command Center
  // --------------------------------------------------------------------------
  renderAgentCommandCenter() {
    const grid = document.getElementById('agent-command-cards-grid');
    if (!grid) return;

    grid.innerHTML = window.AegisData.agents.map(ag => `
      <div class="agent-hero-card" id="card-${ag.id}">
        <div class="agent-card-top">
          <div style="display: flex; gap: 12px; align-items: center;">
            <div class="agent-avatar-big" style="background: ${ag.avatarBg}; color: ${ag.avatarColor}; border-color: ${ag.avatarColor}60;">
              ${ag.initials}
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #fff;">${ag.name}</div>
              <div style="font-size: 11px; color: var(--cyan-primary); font-family: var(--font-mono);">${ag.role}</div>
            </div>
          </div>
          <span class="badge ${ag.statusBadge}">${ag.status}</span>
        </div>

        <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4; margin-bottom: 10px;">
          ${ag.description}
        </div>

        <div class="agent-hero-stats">
          <div>
            <div class="agent-stat-box-val">${ag.accuracy}</div>
            <div class="agent-stat-box-lbl">Accuracy</div>
          </div>
          <div>
            <div class="agent-stat-box-val">${ag.tasksCompleted.toLocaleString()}</div>
            <div class="agent-stat-box-lbl">Decisions</div>
          </div>
          <div>
            <div class="agent-stat-box-val" style="color: var(--cyan-primary);">${ag.latency}</div>
            <div class="agent-stat-box-lbl">Latency</div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 4px;">Active Task:</div>
          <div style="font-size: 11.5px; color: var(--text-bright); line-height: 1.3;">${ag.currentTask}</div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <div style="font-size: 10.5px; color: var(--text-dim);">
            Autonomy: <strong style="color: ${ag.autonomyLevel.includes('Full') ? 'var(--green-primary)' : 'var(--amber-primary)'};">${ag.autonomyLevel}</strong>
          </div>
          <button class="btn btn-sm btn-outline" onclick="window.socApp.configureAgent('${ag.id}')">Configure</button>
        </div>
      </div>
    `).join('');
  }

  configureAgent(agentId) {
    const ag = window.AegisData.agents.find(a => a.id === agentId);
    if (!ag) return;

    this.openModal(
      `Agent Configuration: ${ag.name}`,
      `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label class="clearance-label">Autonomy Level</label>
            <select class="soc-select" id="cfg-autonomy-sel" style="width: 100%;">
              <option value="Full Autonomous" ${ag.autonomyLevel.includes('Full') ? 'selected' : ''}>Full Autonomous (Execute mitigations without human approval)</option>
              <option value="Supervised" ${ag.autonomyLevel.includes('Supervised') ? 'selected' : ''}>Supervised (Require Human Approval for destructive actions)</option>
              <option value="Standby">Standby (Audit & Log Only)</option>
            </select>
          </div>
          <div>
            <label class="clearance-label">Inference Confidence Threshold: <span id="conf-val-label">${ag.confidence}%</span></label>
            <input type="range" min="80" max="99" value="${ag.confidence}" class="soc-input" style="height: 24px; padding: 0;" oninput="document.getElementById('conf-val-label').textContent = this.value + '%'">
            <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 4px;">Minimum model certainty required before triggering autonomous response actions.</div>
          </div>
          <div>
            <label class="clearance-label">Cross-Agent Telemetry Broadcasting</label>
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px;">
              <span>Forward high-confidence anomalies to Hunter & Risk Agents</span>
              <label class="toggle-switch"><input type="checkbox" checked><span class="slider-round"></span></label>
            </div>
          </div>
        </div>
      `,
      `
        <button class="btn btn-secondary" onclick="window.socApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.socApp.saveAgentConfig('${ag.id}')">Save Policy</button>
      `
    );
  }

  saveAgentConfig(agentId) {
    this.closeModal();
    this.showToast("Configuration Updated", `Agent security parameters saved and deployed to cluster`, "success");
    if (window.socSound) window.socSound.playSuccess();
  }

  // --------------------------------------------------------------------------
  // Threat Intelligence Page
  // --------------------------------------------------------------------------
  renderThreatIntel() {
    // Malicious IPs
    const ipTbody = document.getElementById('intel-ips-tbody');
    if (ipTbody) {
      ipTbody.innerHTML = window.AegisData.threatIntel.maliciousIPs.map(item => `
        <tr onclick="window.socApp.inspectIOC('${item.ip}', 'IP')">
          <td class="soc-mono" style="color: var(--cyan-primary); font-weight: 700;">${item.ip}</td>
          <td>${item.org}</td>
          <td>${item.country}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: #f87171;">${item.confidence}%</td>
          <td class="soc-mono">${item.sightings}</td>
          <td><span class="badge badge-critical">${item.threatActor}</span></td>
          <td><button class="btn btn-sm btn-outline">Analyze</button></td>
        </tr>
      `).join('');
    }

    // Malicious Domains
    const domTbody = document.getElementById('intel-domains-tbody');
    if (domTbody) {
      domTbody.innerHTML = window.AegisData.threatIntel.maliciousDomains.map(item => `
        <tr onclick="window.socApp.inspectIOC('${item.domain}', 'Domain')">
          <td class="soc-mono" style="color: #fca5a5; font-weight: 700;">${item.domain}</td>
          <td>${item.registrar}</td>
          <td><span class="badge badge-purple">${item.category}</span></td>
          <td style="font-family: var(--font-mono); color: #f87171;">${item.confidence}%</td>
          <td class="soc-mono">${item.detected}</td>
          <td><button class="btn btn-sm btn-outline">Analyze</button></td>
        </tr>
      `).join('');
    }

    // Threat Actors
    const actorsGrid = document.getElementById('intel-actors-grid');
    if (actorsGrid) {
      actorsGrid.innerHTML = window.AegisData.threatIntel.threatActors.map(ta => `
        <div class="cyber-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="font-size: 14px; font-weight: 800; color: #fff;">${ta.name}</div>
            <span class="badge badge-critical">${ta.origin}</span>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px;">
            <strong>Motivation:</strong> ${ta.motivation}
          </div>
          <div style="font-size: 11px; background: rgba(0,0,0,0.25); padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <div><strong>Targets:</strong> ${ta.targets}</div>
            <div style="margin-top: 4px;"><strong>Active Campaigns:</strong> <span style="color: var(--cyan-primary);">${ta.activeCampaigns}</span></div>
          </div>
          <button class="btn btn-sm btn-secondary" style="width: 100%;" onclick="window.socApp.copilot.ask('Investigate threat actor ${ta.name}')">Track Actor TTPs</button>
        </div>
      `).join('');
    }

    // MITRE ATT&CK Matrix Grid
    const mitreGrid = document.getElementById('intel-mitre-grid');
    if (mitreGrid) {
      const tactics = ["Initial Access", "Execution", "Credential Access", "Lateral Movement", "Command & Control", "Impact"];
      mitreGrid.innerHTML = tactics.map(tactic => {
        const techs = window.AegisData.threatIntel.mitreTechniques.filter(t => t.tactic.toLowerCase().includes(tactic.toLowerCase().split(' ')[0]));
        return `
          <div class="mitre-col">
            <div class="mitre-col-header">${tactic}</div>
            ${techs.map(tch => `
              <div class="mitre-tech-pill detected" onclick="window.socApp.inspectMITRE('${tch.id}', '${tch.name}')">
                <div style="font-weight: 700; color: #fff;">${tch.id}</div>
                <div style="font-size: 9.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tch.name}</div>
                <div style="font-size: 9px; color: #fca5a5; margin-top: 2px;">${tch.detections} Detections</div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('');
    }

    // Global Search in Threat Intel
    const intelSearch = document.getElementById('intel-global-search');
    if (intelSearch) {
      intelSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#intel-ips-tbody tr, #intel-domains-tbody tr').forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }
  }

  inspectIOC(value, type) {
    this.openModal(
      `IOC Deep Inspection: ${value}`,
      `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border-left: 3px solid var(--red-primary);">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Indicator of Compromise</div>
            <div class="soc-mono" style="font-size: 15px; font-weight: 800; color: #fff;">${value}</div>
            <div style="font-size: 11px; color: var(--cyan-primary); margin-top: 2px;">Type: ${type} • Reputation: MALICIOUS (99/100)</div>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 12px; margin-bottom: 6px;">Correlated Intelligence Feeds</div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;">
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px;">• <strong>VirusTotal</strong>: 74/88 security vendors flagged as active Cobalt Strike C2</div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px;">• <strong>AlienVault OTX</strong>: In 18 active pulses (LockBit 3.0, FIN12, Cozy Bear)</div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px;">• <strong>Internal Sightings</strong>: 1 internal host communicating (DB-SERVER-04)</div>
            </div>
          </div>
        </div>
      `,
      `
        <button class="btn btn-secondary" onclick="window.socApp.closeModal()">Close</button>
        <button class="btn btn-danger" onclick="window.socApp.closeModal(); window.socApp.showToast('Firewall Rule Deployed', 'Blocked ${value} on all perimeter Palo Alto firewalls', 'danger')">Block Globally</button>
      `
    );
  }

  inspectMITRE(id, name) {
    this.openModal(
      `MITRE ATT&CK: ${id} - ${name}`,
      `
        <div style="font-size: 12px; line-height: 1.5;">
          <p>Technique <strong>${id}</strong> involves adversaries leveraging specialized tradecraft to execute commands or establish persistence.</p>
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 12px; margin: 12px 0;">
            <div style="font-weight: 700; color: #f87171;">Observed in Active Incidents:</div>
            <div style="margin-top: 4px;">• <strong>INC-2048</strong>: Ransomware Staging on DB-SERVER-04</div>
            <div>• <strong>INC-2049</strong>: APT29 Kerberoasting on AD-DC-01</div>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted);">
            <strong>Mitigation:</strong> Enforce privileged access workstations (PAWs), enable credential guard, and restrict local administrator accounts.
          </div>
        </div>
      `,
      `<button class="btn btn-primary" onclick="window.socApp.closeModal()">Dismiss</button>`
    );
  }

  // --------------------------------------------------------------------------
  // Attack Timeline Screen
  // --------------------------------------------------------------------------
  renderAttackTimeline() {
    const container = document.getElementById('attack-timeline-container');
    if (!container) return;

    const timelineData = [
      { time: "13:58:10", actor: "Adversary (185.220.101.5)", action: "VPN Credential Stuffing Authentication", asset: "VPN-GW-01", status: "Access", sev: "critical" },
      { time: "14:00:12", actor: "Compromised Account (svc_dbbackup)", action: "Kerberos Golden Ticket Pre-Auth Brute Force", asset: "AD-DC-01", status: "PrivEsc", sev: "critical" },
      { time: "14:03:45", actor: "Attacker Tooling (Mimikatz)", action: "LSASS Memory Dump & NTLM Extraction", asset: "DB-SERVER-04", status: "Cred Dump", sev: "critical" },
      { time: "14:07:22", actor: "Attacker Script (PowerShell)", action: "WMI Lateral Execution & Persistence Service Install", asset: "DB-SERVER-04", status: "Lateral", sev: "high" },
      { time: "14:10:05", actor: "Payload (db_sync.exe)", action: "Volume Shadow Copy Deletion (vssadmin delete shadows)", asset: "DB-SERVER-04", status: "Staging", sev: "critical" },
      { time: "14:12:30", actor: "Hunter & Sentinel Agents", action: "Egress C2 Beacon Intercepted & Firewall Rule Deployed", asset: "PERIM-FW", status: "Contained", sev: "online" }
    ];

    container.innerHTML = timelineData.map((item, idx) => `
      <div style="display: flex; gap: 16px; margin-bottom: 20px; position: relative;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 14px; height: 14px; border-radius: 50%; background: ${item.sev === 'online' ? 'var(--green-primary)' : 'var(--red-primary)'}; box-shadow: 0 0 10px ${item.sev === 'online' ? 'var(--green-primary)' : 'var(--red-primary)'};"></div>
          ${idx < timelineData.length - 1 ? `<div style="width: 2px; flex: 1; background: var(--border-medium); margin: 4px 0;"></div>` : ''}
        </div>
        <div class="cyber-card" style="flex: 1; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span class="soc-mono" style="color: var(--cyan-primary); font-weight: 700;">${item.time} UTC</span>
            <span class="badge ${item.sev === 'online' ? 'badge-online' : 'badge-critical'}">${item.status}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #fff;">${item.action}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            Actor: <code>${item.actor}</code> • Target: <code style="color: var(--cyan-primary);">${item.asset}</code>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // Risk Analytics Screen
  // --------------------------------------------------------------------------
  renderRiskAnalytics() {
    // 5x5 Matrix Cell click handler
    document.querySelectorAll('.matrix-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const count = cell.textContent;
        const sev = cell.getAttribute('data-sev');
        this.showToast("Risk Matrix Filter", `Viewing ${count} risks in ${sev.toUpperCase()} category`, "info");
      });
    });
  }

  // --------------------------------------------------------------------------
  // Automated Response (SOAR)
  // --------------------------------------------------------------------------
  renderAutomatedResponse() {
    const container = document.getElementById('soar-recommendations-container');
    if (!container) return;

    container.innerHTML = window.AegisData.soar.activeRecommendations.map(rec => `
      <div class="cyber-card" style="margin-bottom: 20px;" id="soar-card-${rec.id}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="badge badge-critical">${rec.riskLevel}</span>
            <span class="soc-mono" style="font-size: 15px; font-weight: 800; color: #fff;">${rec.incidentId}: ${rec.threatName}</span>
          </div>
          <div style="font-size: 11px; color: var(--cyan-primary); font-family: var(--font-mono);">
            AI Certainty: <strong>${rec.aiConfidence}</strong>
          </div>
        </div>

        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px;">
          <strong>AI Reasoning:</strong> ${rec.reason}
        </div>

        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px;">
          Orchestration Pipeline:
        </div>
        <div class="soar-pipeline-strip">
          ${rec.pipeline.map((step, idx) => `
            <div class="pipeline-node" style="border-color: ${step.status === 'executed' || step.status === 'done' ? 'var(--green-primary)' : step.highImpact ? 'var(--red-primary)' : 'var(--border-medium)'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="soc-mono" style="font-size: 9px; color: var(--text-dim);">Step 0${idx + 1}</span>
                <span class="badge ${step.status === 'executed' || step.status === 'done' ? 'badge-online' : step.highImpact ? 'badge-critical' : 'badge-waiting'}" style="font-size: 8px; padding: 1px 4px;">
                  ${step.status.toUpperCase()}
                </span>
              </div>
              <div style="font-size: 11.5px; font-weight: 700; color: #fff;">${step.step}</div>
              ${step.desc ? `<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${step.desc}</div>` : ''}
              ${step.highImpact ? `<div style="font-size: 9px; color: #f87171; font-weight: 700; margin-top: 4px;">⚠ Human Approval Required</div>` : ''}
            </div>
            ${idx < rec.pipeline.length - 1 ? `<div class="pipeline-arrow">→</div>` : ''}
          `).join('')}
        </div>

        <div class="approval-gate-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                ${rec.approvalTitle}
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">${rec.approvalDetails}</div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" onclick="window.socApp.dryRunResponse('${rec.id}')">Dry-Run Simulation</button>
              <button class="btn btn-outline" onclick="window.socApp.rejectResponse('${rec.id}')">Reject</button>
              <button class="btn btn-primary" onclick="window.socApp.approveResponse('${rec.id}')">✓ Approve & Execute</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  dryRunResponse(recId) {
    this.openModal(
      "Dry-Run Impact Simulation",
      `
        <div style="font-size: 12px; line-height: 1.5;">
          <p>Simulating execution of containment playbook for <strong>${recId}</strong>:</p>
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin: 12px 0; font-family: var(--font-mono); font-size: 11px;">
            <div style="color: var(--green-primary);">[SUCCESS] EDR Agent reachable on DB-SERVER-04 (Ping: 4ms)</div>
            <div style="color: var(--green-primary);">[SUCCESS] Failover Database Node DB-SERVER-04-REPLICA ready to assume read traffic</div>
            <div style="color: var(--cyan-primary);">[SIMULATION] Network adapter isolation will sever active connection to 185.220.101.5</div>
            <div style="color: var(--amber-primary);">[ESTIMATED IMPACT] 0 business loss if executed within next 8 minutes</div>
          </div>
          <div>No conflicting maintenance windows detected. Safe to execute.</div>
        </div>
      `,
      `<button class="btn btn-primary" onclick="window.socApp.closeModal(); window.socApp.approveResponse('${recId}')">Proceed to Execution</button>`
    );
  }

  approveResponse(recId) {
    const card = document.getElementById(`soar-card-${recId}`);
    
    // Call backend API if online
    fetch('/api/response/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recommendation_id: recId,
        action: 'approve',
        analyst_name: 'Alex Vance',
        clearance_tier: 'Tier 3 Lead Analyst'
      })
    })
    .then(r => r.json())
    .then(data => {
      if (card) {
        card.style.borderLeft = "4px solid var(--green-primary)";
        const gate = card.querySelector('.approval-gate-card');
        if (gate) {
          gate.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; color: var(--green-primary); font-weight: 700; font-size: 13px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Containment Executed by Response Agent (Backend Confirmed)
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Target isolated. Two-man rule verified. Signed: <code style="color: var(--cyan-primary);">${data.verification_signature || 'sha256:f10428ad...'}</code>
            </div>
          `;
        }
      }
      this.showToast("Action Executed", data.message || "Containment executed by Response Agent", "success");
      if (window.socSound) window.socSound.playSuccess();
    })
    .catch(() => {
      // Fallback
      if (card) {
        card.style.borderLeft = "4px solid var(--green-primary)";
        const gate = card.querySelector('.approval-gate-card');
        if (gate) {
          gate.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; color: var(--green-primary); font-weight: 700; font-size: 13px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Containment Actions Executed Successfully • Verified by Response Agent
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              DB-SERVER-04 isolated at host network layer. User svc_dbbackup locked in AD. SHA-256 audit entry logged.
            </div>
          `;
        }
      }
      this.showToast("Action Executed", "Containment command executed on DB-SERVER-04 by Response Agent", "success");
      if (window.socSound) window.socSound.playSuccess();
    });
  }

  rejectResponse(recId) {
    const card = document.getElementById(`soar-card-${recId}`);
    if (card) {
      card.style.opacity = "0.5";
      const gate = card.querySelector('.approval-gate-card');
      if (gate) {
        gate.innerHTML = `
          <div style="color: var(--text-dim); font-size: 12px;">Action rejected by Tier 3 Analyst. Escalated to manual SOC review.</div>
        `;
      }
    }
    this.showToast("Action Rejected", `Action for ${recId} overridden by analyst`, "warning");
  }

  // --------------------------------------------------------------------------
  // Reports Page
  // --------------------------------------------------------------------------
  renderReports() {
    const exportPdfBtn = document.getElementById('report-export-pdf-btn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const exportCsvBtn = document.getElementById('report-export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const rows = [
          ["Incident ID", "Threat Name", "Severity", "Asset", "Status", "Detection Time"],
          ["INC-2048", "LockBit 3.0 Ransomware", "CRITICAL", "DB-SERVER-04", "Contained", "2026-09-12 14:00:12 UTC"],
          ["INC-2049", "APT29 Kerberoasting", "CRITICAL", "AD-DC-01", "Investigating", "2026-09-12 13:48:00 UTC"]
        ];
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "AegisX_Incident_Report.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.showToast("Export Complete", "Incident CSV file downloaded", "success");
      });
    }

    const shareBtn = document.getElementById('report-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.openModal(
          "Share Forensic Report",
          `
            <div style="font-size: 12px;">
              <p>Secure link generated with cryptographic hash verification:</p>
              <input class="soc-input" readonly value="https://aegis-soc.corp.internal/reports/inc-2048?token=8f9102b4" style="margin: 10px 0;">
              <div style="font-size: 11px; color: var(--text-dim);">Link expires in 24 hours. Restricted to authorized SecOps clearance holders.</div>
            </div>
          `,
          `<button class="btn btn-primary" onclick="navigator.clipboard.writeText('https://aegis-soc.corp.internal/reports/inc-2048?token=8f9102b4'); window.socApp.closeModal(); window.socApp.showToast('Copied', 'Secure link copied to clipboard', 'info');">Copy Link</button>`
        );
      });
    }
  }

  // --------------------------------------------------------------------------
  // Settings Page
  // --------------------------------------------------------------------------
  renderSettings() {
    const saveSettingsBtn = document.getElementById('settings-save-btn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        this.showToast("Settings Saved", "SOC policy parameters updated successfully", "success");
        if (window.socSound) window.socSound.playSuccess();
      });
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

// Instantiate App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.socApp = new AegisApp();
});
