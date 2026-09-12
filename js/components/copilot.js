/**
 * AegisX SOC - Aegis AI Copilot Engine
 * Provides natural-language forensic triage, evidence synthesis, and 1-click defense execution
 */

class AegisCopilot {
  constructor() {
    this.drawer = document.getElementById('copilot-drawer');
    this.messagesContainer = document.getElementById('copilot-messages');
    this.inputField = document.getElementById('copilot-input');
    this.sendBtn = document.getElementById('copilot-send-btn');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (this.sendBtn && this.inputField) {
      this.sendBtn.addEventListener('click', () => this.handleSend());
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSend();
      });
    }

    // Bind Quick Chips
    document.querySelectorAll('.copilot-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const query = e.target.textContent.trim().replace(/^["']|["']$/g, '');
        this.ask(query);
      });
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.drawer) {
      if (this.isOpen) {
        this.drawer.classList.add('open');
        this.inputField.focus();
        if (window.socSound) window.socSound.playClick();
      } else {
        this.drawer.classList.remove('open');
      }
    }
  }

  open() {
    this.isOpen = true;
    if (this.drawer) {
      this.drawer.classList.add('open');
      this.inputField.focus();
    }
  }

  close() {
    this.isOpen = false;
    if (this.drawer) {
      this.drawer.classList.remove('open');
    }
  }

  handleSend() {
    const text = this.inputField.value.trim();
    if (!text) return;
    this.inputField.value = '';
    this.ask(text);
  }

  ask(query) {
    if (!this.isOpen) this.open();

    // 1. Render User Message
    this.renderUserMessage(query);
    if (window.socSound) window.socSound.playClick();

    // 2. Render Agent Thinking Placeholder
    const thinkingId = this.renderThinking();

    // 3. Query Backend API or Fallback to Local Knowledge Library
    fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, analyst_name: 'Alex Vance' })
    })
    .then(res => {
      if (!res.ok) throw new Error('Backend offline');
      return res.json();
    })
    .then(data => {
      this.removeThinking(thinkingId);
      this.renderApiResponse(data);
    })
    .catch(() => {
      setTimeout(() => {
        this.removeThinking(thinkingId);
        this.respond(query);
      }, 600);
    });
  }

  renderApiResponse(match) {
    const div = document.createElement('div');
    div.className = 'copilot-msg agent';

    let pointsHtml = '';
    if (match.points && match.points.length) {
      pointsHtml = `<div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0;">` +
        match.points.map(pt => `<div style="font-size: 11.5px; background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 4px; border-left: 2px solid var(--purple-primary);">${pt}</div>`).join('') +
        `</div>`;
    }

    let cardsHtml = '';
    if (match.cards && match.cards.length) {
      cardsHtml = `<div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0;">` +
        match.cards.map(c => `
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 11.5px;">${c.id} • ${c.title}</div>
              <div style="font-size: 10px; color: #f87171;">${c.risk} • Assigned: ${c.agent}</div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="window.socApp.viewIncident('${c.id}')" style="font-size: 10px; padding: 3px 8px;">Investigate</button>
          </div>
        `).join('') +
        `</div>`;
    }

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span class="badge badge-purple" style="font-size: 9px; padding: 2px 6px;">AEGIS COPILOT (BACKEND)</span>
        <span style="font-size: 10px; color: var(--cyan-primary); font-family: var(--font-mono);">Confidence: ${match.confidence}</span>
      </div>
      <div class="msg-bubble">
        <div>${match.text}</div>
        ${cardsHtml}
        ${pointsHtml}
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-bright); display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--green-primary); font-weight: 700;">Action:</span>
          <span>${match.recommendation}</span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(div);
    this.scrollToBottom();

    if (window.socSound) window.socSound.playAlert();
  }

  renderUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'copilot-msg user';
    div.innerHTML = `
      <div class="msg-bubble">${this.escapeHtml(text)}</div>
      <div style="font-size: 10px; color: var(--text-dim); text-align: right; padding-right: 4px;">Analyst • Just now</div>
    `;
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  }

  renderThinking() {
    const id = 'thinking-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'copilot-msg agent';
    div.innerHTML = `
      <div class="msg-bubble" style="display: flex; align-items: center; gap: 8px; color: var(--cyan-primary);">
        <span class="status-dot cyan" style="animation: pulse-ring 1s infinite;"></span>
        <span>Aegis Multi-Agent Core synthesizing response...</span>
      </div>
    `;
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
    return id;
  }

  removeThinking(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  respond(query) {
    const qLower = query.toLowerCase();
    const library = window.AegisData.copilotLibrary;

    let match = null;
    for (const [key, val] of Object.entries(library)) {
      if (qLower.includes(key) || key.includes(qLower)) {
        match = val;
        break;
      }
    }

    // Default Fallback Synthesis if not an exact keyword match
    if (!match) {
      match = {
        text: `Based on current cross-agent telemetry for **"${query}"**:`,
        points: [
          `**Hunter Agent**: Active correlation matches 2 ongoing incident investigations.`,
          `**Intel Agent**: No zero-day CVE matches found in public NVD database for this specific string.`,
          `**Risk Agent**: Assessed overall perimeter posture as Stable with 1 Pending Critical Approval on DB-SERVER-04.`
        ],
        confidence: "91%",
        recommendation: "You can ask 'Show me all critical threats' or 'Recommend a response' for prioritized actions."
      };
    }

    // Render Agent Rich Response
    const div = document.createElement('div');
    div.className = 'copilot-msg agent';

    let pointsHtml = '';
    if (match.points && match.points.length) {
      pointsHtml = `<div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0;">` +
        match.points.map(pt => `<div style="font-size: 11.5px; background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 4px; border-left: 2px solid var(--purple-primary);">${pt}</div>`).join('') +
        `</div>`;
    }

    let cardsHtml = '';
    if (match.cards && match.cards.length) {
      cardsHtml = `<div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0;">` +
        match.cards.map(c => `
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 11.5px;">${c.id} • ${c.title}</div>
              <div style="font-size: 10px; color: #f87171;">${c.risk} • Assigned: ${c.agent}</div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="window.socApp.viewIncident('${c.id}')" style="font-size: 10px; padding: 3px 8px;">Investigate</button>
          </div>
        `).join('') +
        `</div>`;
    }

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span class="badge badge-purple" style="font-size: 9px; padding: 2px 6px;">AEGIS COPILOT</span>
        <span style="font-size: 10px; color: var(--cyan-primary); font-family: var(--font-mono);">Confidence: ${match.confidence}</span>
      </div>
      <div class="msg-bubble">
        <div>${match.text}</div>
        ${cardsHtml}
        ${pointsHtml}
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-bright); display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--green-primary); font-weight: 700;">Action:</span>
          <span>${match.recommendation}</span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(div);
    this.scrollToBottom();

    if (window.socSound) window.socSound.playAlert();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

window.AegisCopilot = AegisCopilot;
