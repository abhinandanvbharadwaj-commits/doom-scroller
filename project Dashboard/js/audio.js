/**
 * Doom Scroller Dashboard - Procedural Audio Synthesizer
 * Uses Web Audio API for zero-dependency military klaxon and tactical alert sound FX.
 */

class TacticalAudioController {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Default muted to comply with browser autoplay policies
    this.isAlarmSounding = false;
    this.alarmOscillators = [];
    this.alarmGainNode = null;
    this.lfo = null;
  }

  // Initialize or resume AudioContext on first user interaction
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(targetState) {
    this.init();
    if (typeof targetState === 'boolean') {
      this.isMuted = targetState;
    } else {
      this.isMuted = !this.isMuted;
    }

    if (this.isMuted && this.isAlarmSounding) {
      this.stopAlarm();
    }

    return this.isMuted;
  }

  // Play a soft digital UI blip for normal incoming events
  playTick(severity = 1) {
    if (this.isMuted || !this.ctx) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Severity determines pitch
      const freq = severity === 3 ? 980 : severity === 2 ? 640 : 380;
      osc.type = severity === 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio tick suppressed:', e);
    }
  }

  // Play a single high-impact sonic boom / alert chord for critical events
  playImpactAlert() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      
      // Heavy sub-bass thud
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(140, now);
      bassOsc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

      bassGain.gain.setValueAtTime(0.25, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.45);

      // Piercing warning ping
      const highOsc = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();
      highOsc.type = 'sine';
      highOsc.frequency.setValueAtTime(1240, now);
      highOsc.frequency.linearRampToValueAtTime(820, now + 0.2);

      highGain.gain.setValueAtTime(0.15, now);
      highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      highOsc.connect(highGain);
      highGain.connect(this.ctx.destination);
      highOsc.start(now);
      highOsc.stop(now + 0.25);
    } catch (e) {
      console.warn('Impact sound suppressed:', e);
    }
  }

  // Start continuous emergency klaxon siren
  startAlarm() {
    if (this.isAlarmSounding) return;
    this.isAlarmSounding = true;
    if (this.isMuted || !this.ctx) return;
    this.init();

    try {
      const now = this.ctx.currentTime;

      // Master alarm gain
      this.alarmGainNode = this.ctx.createGain();
      this.alarmGainNode.gain.setValueAtTime(0.01, now);
      this.alarmGainNode.gain.linearRampToValueAtTime(0.2, now + 0.3);
      this.alarmGainNode.connect(this.ctx.destination);

      // Carrier 1: Sawtooth siren horn
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(600, now);

      // Carrier 2: Square wave second-harmonic
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(604, now); // slight detune for menacing chorus

      // LFO for classic wailing siren pitch modulation
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(1.5, now); // 1.5 cycles per second wail

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(220, now); // swing between ~380Hz and ~820Hz

      this.lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Lowpass filter to give it that megaphone / control room PA speaker acoustic
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.alarmGainNode);

      this.lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      this.alarmOscillators = [osc1, osc2, this.lfo];
    } catch (e) {
      console.warn('Alarm siren startup error:', e);
    }
  }

  // Stop the emergency siren smoothly
  stopAlarm() {
    this.isAlarmSounding = false;
    if (!this.ctx || !this.alarmGainNode) {
      this.alarmOscillators = [];
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.alarmGainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);

      setTimeout(() => {
        this.alarmOscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (err) {}
        });
        this.alarmOscillators = [];
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch (err) {}
          this.lfo = null;
        }
        if (this.alarmGainNode) {
          try { this.alarmGainNode.disconnect(); } catch (err) {}
          this.alarmGainNode = null;
        }
      }, 260);
    } catch (e) {
      this.alarmOscillators = [];
    }
  }
}

// Global audio singleton
window.tacticalAudio = new TacticalAudioController();
