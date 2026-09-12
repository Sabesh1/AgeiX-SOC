/**
 * AegisX SOC - Web Audio API Synthetic Cyber Sound Effects
 * Completely self-contained synthetic tactical audio cues with mute toggle
 */

class SoundSystem {
  constructor() {
    this.enabled = false; // Muted by default so it doesn't startle the user, can be enabled via topbar
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch (e) {
        console.warn("Web Audio not supported", e);
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.playBeep(880, 0.08, 'sine', 0.1);
    }
    return this.enabled;
  }

  playBeep(freq = 440, duration = 0.08, type = 'sine', gainVal = 0.05) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // Tactical click
  playClick() {
    this.playBeep(1200, 0.04, 'sine', 0.03);
  }

  // Cyber Alert / Incident Detected
  playAlert() {
    if (!this.enabled || !this.ctx) return;
    this.playBeep(520, 0.15, 'sawtooth', 0.06);
    setTimeout(() => this.playBeep(780, 0.2, 'sawtooth', 0.06), 120);
  }

  // Response approved / success chime
  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    this.playBeep(659.25, 0.1, 'triangle', 0.05); // E5
    setTimeout(() => this.playBeep(880, 0.15, 'sine', 0.05), 100); // A5
  }

  // Radar ping
  playRadar() {
    this.playBeep(1800, 0.06, 'sine', 0.02);
  }
}

window.socSound = new SoundSystem();
