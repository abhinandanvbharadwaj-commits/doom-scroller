/**
 * Doom Scroller Dashboard - Main Application Controller
 * Orchestrates event feeds, alarm systems, UI filters, telemetry counters, and audio.
 */

class DoomDashboardApp {
  constructor() {
    this.events = [];
    this.selectedEvent = null;
    this.activeFilterDefcon = 'all';
    this.activeFilterCategory = 'all';
    this.searchQuery = '';
    this.isPaused = false;
    this.feedIntervalMs = 2400; // Default feed pace
    this.timerId = null;
    this.totalLiquidationsUsd = 14850000000; // Seed at $14.85B
    this.panicIndex = 84;
    this.alarmActive = false;
    this.alarmAutoSilenceTimer = null;
    this.crtEnabled = true;

    // Sector Volatility States (0 to 100)
    this.sectors = {
      crypto: 88,
      equities: 74,
      cyber: 62,
      geopolitics: 79
    };

    this.init();
  }

  init() {
    // 1. Initialize Seismograph
    this.seismograph = new VolatilitySeismograph('seismograph-canvas');

    // 2. Initialize Seed Events
    const initialEvents = window.chaosEngine.generateInitialHistory(6);
    initialEvents.forEach(evt => {
      this.events.unshift(evt);
      this.totalLiquidationsUsd += evt.lossUsd;
    });

    if (this.events.length > 0) {
      this.selectedEvent = this.events[0];
    }

    // 3. Bind UI Elements
    this.bindControls();
    this.startTacticalClock();
    this.renderFeed();
    this.renderSelectedTelemetry();
    this.updateStatsCounters();
    this.updateSectorBars();

    // 4. Start Event Stream
    this.scheduleNextEvent();

    // 5. Initialize Lucide Icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // 6. Check URL query params (e.g. ?alarm=1 for alarm verification)
    if (window.location.search.includes('alarm=1')) {
      setTimeout(() => {
        this.triggerAlarm("AUTOMATED ALARM VERIFICATION // DEFCON 1 ACTIVE");
      }, 300);
    }
  }

  // Bind all interactive event listeners
  bindControls() {
    // DEFCON Filter buttons
    const defconBtns = document.querySelectorAll('[data-filter-defcon]');
    defconBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        defconBtns.forEach(b => b.classList.remove('active-defcon-filter', 'border-red-500', 'bg-red-950/60', 'text-white'));
        defconBtns.forEach(b => b.classList.add('border-neutral-800', 'bg-neutral-900/50', 'text-neutral-400'));

        btn.classList.add('active-defcon-filter', 'border-red-500', 'bg-red-950/60', 'text-white');
        btn.classList.remove('border-neutral-800', 'bg-neutral-900/50', 'text-neutral-400');

        this.activeFilterDefcon = btn.getAttribute('data-filter-defcon');
        this.renderFeed();
      });
    });

    // Category Filter buttons
    const catBtns = document.querySelectorAll('[data-filter-category]');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active-cat-filter', 'border-red-500', 'bg-red-950/60', 'text-red-400'));
        catBtns.forEach(b => b.classList.add('border-neutral-800', 'bg-neutral-900/50', 'text-neutral-400'));

        btn.classList.add('active-cat-filter', 'border-red-500', 'bg-red-950/60', 'text-red-400');
        btn.classList.remove('border-neutral-800', 'bg-neutral-900/50', 'text-neutral-400');

        this.activeFilterCategory = btn.getAttribute('data-filter-category');
        this.renderFeed();
      });
    });

    // Search input
    const searchInput = document.getElementById('search-feed-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderFeed();
      });
    }

    // Feed Pace / Speed Slider
    const speedSlider = document.getElementById('speed-slider');
    const speedLabel = document.getElementById('speed-label');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        // Slider value 1 (Slow = 4500ms) to 5 (Hyperspeed = 700ms)
        const speeds = { 1: 4800, 2: 3200, 3: 2200, 4: 1300, 5: 650 };
        const labels = { 1: '0.2x (CALM)', 2: '0.6x (STEADY)', 3: '1.0x (TACTICAL)', 4: '2.0x (HIGH RISK)', 5: '4.0x (TOTAL COLLAPSE)' };

        this.feedIntervalMs = speeds[val] || 2200;
        if (speedLabel) speedLabel.textContent = labels[val] || '1.0x';

        // Reschedule
        if (!this.isPaused) {
          clearTimeout(this.timerId);
          this.scheduleNextEvent();
        }
      });
    }

    // Play/Pause Button
    const playPauseBtn = document.getElementById('btn-pause-feed');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        const iconSpan = playPauseBtn.querySelector('.pause-icon');
        const textSpan = playPauseBtn.querySelector('.pause-text');

        if (this.isPaused) {
          clearTimeout(this.timerId);
          playPauseBtn.classList.add('border-amber-500', 'text-amber-400');
          if (iconSpan) iconSpan.setAttribute('data-lucide', 'play');
          if (textSpan) textSpan.textContent = 'RESUME FEED';
        } else {
          this.scheduleNextEvent();
          playPauseBtn.classList.remove('border-amber-500', 'text-amber-400');
          if (iconSpan) iconSpan.setAttribute('data-lucide', 'pause');
          if (textSpan) textSpan.textContent = 'PAUSE STREAM';
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Audio Mute/Unmute Toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = window.tacticalAudio.toggleMute();
        this.updateAudioButtonState(audioBtn, isMuted);
      });
    }

    // Force Black Swan Panic Button
    const blackSwanBtn = document.getElementById('btn-inject-black-swan');
    if (blackSwanBtn) {
      blackSwanBtn.addEventListener('click', () => {
        this.injectCriticalEvent();
      });
    }

    // Test Klaxon Siren Button
    const testAlarmBtn = document.getElementById('btn-test-klaxon');
    if (testAlarmBtn) {
      testAlarmBtn.addEventListener('click', () => {
        this.triggerAlarm("MANUAL KLAXON DRILL // DEFCON 1 READINESS TEST");
      });
    }

    // Alarm Silence / Dismiss Button
    const silenceBtn = document.getElementById('btn-silence-alarm');
    if (silenceBtn) {
      silenceBtn.addEventListener('click', () => {
        this.silenceAlarm();
      });
    }

    // CRT Scanlines Toggle
    const crtBtn = document.getElementById('btn-toggle-crt');
    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        this.crtEnabled = !this.crtEnabled;
        const crtOverlay = document.getElementById('crt-overlay');
        if (crtOverlay) {
          crtOverlay.style.display = this.crtEnabled ? 'block' : 'none';
        }
        crtBtn.classList.toggle('text-red-400', this.crtEnabled);
        crtBtn.classList.toggle('text-neutral-500', !this.crtEnabled);
      });
    }

    // Clear Feed
    const clearBtn = document.getElementById('btn-clear-feed');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.events = [];
        this.renderFeed();
        this.updateStatsCounters();
      });
    }
  }

  updateAudioButtonState(button, isMuted) {
    const icon = button.querySelector('[data-lucide]');
    const label = button.querySelector('.audio-label');
    if (isMuted) {
      button.classList.remove('border-red-500', 'bg-red-950/40', 'text-red-400', 'neon-glow-red');
      button.classList.add('border-neutral-800', 'text-neutral-400');
      if (icon) icon.setAttribute('data-lucide', 'volume-x');
      if (label) label.textContent = 'AUDIO: MUTED';
    } else {
      button.classList.add('border-red-500', 'bg-red-950/40', 'text-red-400', 'neon-glow-red');
      button.classList.remove('border-neutral-800', 'text-neutral-400');
      if (icon) icon.setAttribute('data-lucide', 'volume-2');
      if (label) label.textContent = 'AUDIO: LIVE';
      window.tacticalAudio.playTick(2);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // Tactical Clock with UTC & milliseconds
  startTacticalClock() {
    const clockEl = document.getElementById('tactical-clock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      const pad = (n, len = 2) => String(n).padStart(len, '0');
      const timeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}.${pad(Math.floor(now.getUTCMilliseconds() / 10))} UTC`;
      clockEl.textContent = timeStr;
      requestAnimationFrame(updateClock);
    };
    requestAnimationFrame(updateClock);
  }

  // Event Engine Scheduler
  scheduleNextEvent() {
    if (this.isPaused) return;

    // Small jitter to interval for organic feel
    const jitter = (Math.random() * 400) - 200;
    const interval = Math.max(400, this.feedIntervalMs + jitter);

    this.timerId = setTimeout(() => {
      this.generateAndProcessEvent();
      this.scheduleNextEvent();
    }, interval);
  }

  // Generate next simulated event
  generateAndProcessEvent(forceCritical = false) {
    const newEvent = window.chaosEngine.generateEvent(null, forceCritical);
    this.events.unshift(newEvent);

    // Limit maximum stored memory to 150 events
    if (this.events.length > 150) {
      this.events.pop();
    }

    // Accumulate total USD liquidations
    this.totalLiquidationsUsd += newEvent.lossUsd;

    // Inject shock into seismograph
    if (this.seismograph) {
      this.seismograph.injectShock(newEvent.chaosScore);
    }

    // Update sector stress
    if (this.sectors[newEvent.category] !== undefined) {
      const delta = (newEvent.chaosScore - 50) * 0.15;
      this.sectors[newEvent.category] = Math.min(99, Math.max(25, Math.round(this.sectors[newEvent.category] + delta)));
      this.updateSectorBars();
    }

    // Check Alarm Threshold
    if (newEvent.defcon === 1 || newEvent.chaosScore >= 90) {
      this.triggerAlarm(newEvent.title);
      window.tacticalAudio.playImpactAlert();
    } else {
      window.tacticalAudio.playTick(newEvent.defcon === 2 ? 2 : 1);
    }

    // Render updates
    this.renderFeed();
    this.updateStatsCounters();
    this.updateMarquee(newEvent);

    // If no event is selected, select the latest
    if (!this.selectedEvent) {
      this.selectedEvent = newEvent;
      this.renderSelectedTelemetry();
    }
  }

  injectCriticalEvent() {
    // Trigger visual screen shake
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      mainContainer.classList.remove('screen-shake');
      void mainContainer.offsetWidth; // trigger reflow
      mainContainer.classList.add('screen-shake');
    }

    this.generateAndProcessEvent(true);
  }

  // EMERGENCY ALARM CONTROLS
  triggerAlarm(causeTitle) {
    this.alarmActive = true;
    
    // Activate perimeter flashing strobe and alert banner
    const strobe = document.getElementById('perimeter-strobe');
    const klaxonBanner = document.getElementById('klaxon-emergency-banner');
    const klaxonText = document.getElementById('klaxon-emergency-text');
    const headerStatusBadge = document.getElementById('header-defcon-status');

    if (strobe) strobe.classList.remove('hidden');
    if (klaxonBanner) klaxonBanner.classList.remove('hidden');
    if (klaxonText) klaxonText.textContent = `CRITICAL CHAOS EVENT: ${causeTitle}`;
    if (headerStatusBadge) {
      headerStatusBadge.textContent = 'DEFCON 1: CRITICAL SPIKE';
      headerStatusBadge.className = 'font-display px-2 py-0.5 text-xs font-bold uppercase rounded border bg-red-600/30 text-red-300 border-red-500 neon-glow-red animate-pulse';
    }

    // Start audio klaxon
    window.tacticalAudio.startAlarm();

    // Auto-silence siren after 7s to prevent ear fatigue, but keep visual alert on until dismissed
    clearTimeout(this.alarmAutoSilenceTimer);
    this.alarmAutoSilenceTimer = setTimeout(() => {
      window.tacticalAudio.stopAlarm();
    }, 7000);
  }

  silenceAlarm() {
    this.alarmActive = false;
    window.tacticalAudio.stopAlarm();
    clearTimeout(this.alarmAutoSilenceTimer);

    const strobe = document.getElementById('perimeter-strobe');
    const klaxonBanner = document.getElementById('klaxon-emergency-banner');
    const headerStatusBadge = document.getElementById('header-defcon-status');

    if (strobe) strobe.classList.add('hidden');
    if (klaxonBanner) klaxonBanner.classList.add('hidden');
    if (headerStatusBadge) {
      headerStatusBadge.textContent = 'DEFCON 2: ELEVATED WATCH';
      headerStatusBadge.className = 'font-display px-2 py-0.5 text-xs font-bold uppercase rounded border bg-amber-950/40 text-amber-400 border-amber-500/50';
    }
  }

  // Render Live Feed Items
  renderFeed() {
    const feedContainer = document.getElementById('feed-container');
    const feedCountEl = document.getElementById('feed-item-count');
    if (!feedContainer) return;

    // Filter events
    const filtered = this.events.filter(evt => {
      // Defcon match
      if (this.activeFilterDefcon !== 'all') {
        const targetDefcon = parseInt(this.activeFilterDefcon, 10);
        if (evt.defcon !== targetDefcon) return false;
      }
      // Category match
      if (this.activeFilterCategory !== 'all') {
        if (evt.category !== this.activeFilterCategory) return false;
      }
      // Search query
      if (this.searchQuery) {
        const text = `${evt.title} ${evt.impact} ${evt.details} ${evt.affectedAssets.join(' ')}`.toLowerCase();
        if (!text.includes(this.searchQuery)) return false;
      }
      return true;
    });

    if (feedCountEl) {
      feedCountEl.textContent = `${filtered.length} / ${this.events.length} EVENTS`;
    }

    if (filtered.length === 0) {
      feedContainer.innerHTML = `
        <div class="p-8 text-center border border-dashed border-neutral-800 rounded bg-black/40 text-neutral-500 font-mono text-xs">
          <div class="text-red-500/80 mb-2 font-display text-sm">[ NO MATCHING CHAOS TELEMETRY ]</div>
          Adjust DEFCON level, clear active search filter, or press "INJECT BLACK SWAN".
        </div>
      `;
      return;
    }

    // Build event cards
    feedContainer.innerHTML = filtered.map((evt, idx) => {
      const isSelected = this.selectedEvent && this.selectedEvent.id === evt.id;
      const isLatest = idx === 0;

      // Color tier styles
      let borderClass = 'border-amber-500/30 hover:border-amber-500/70 bg-neutral-950/80';
      let defconBadge = '<span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-950/50 text-amber-400 border border-amber-500/40">DEFCON 3</span>';
      let impactClass = 'text-amber-400';

      if (evt.defcon === 1) {
        borderClass = 'border-red-600/60 hover:border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(255,18,68,0.15)]';
        defconBadge = '<span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-600/40 text-red-200 border border-red-500 animate-pulse">DEFCON 1: CRITICAL</span>';
        impactClass = 'text-red-400 font-bold';
      } else if (evt.defcon === 2) {
        borderClass = 'border-orange-500/50 hover:border-orange-400 bg-orange-950/20';
        defconBadge = '<span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-orange-950/60 text-orange-300 border border-orange-500/50">DEFCON 2: SEVERE</span>';
        impactClass = 'text-orange-400 font-semibold';
      }

      if (isSelected) {
        borderClass += ' ring-1 ring-red-500 bg-red-950/30';
      }

      const catBadges = {
        crypto: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30',
        equities: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
        cyber: 'text-purple-400 border-purple-500/30 bg-purple-950/30',
        geopolitics: 'text-rose-400 border-rose-500/30 bg-rose-950/30'
      };

      const timeAgo = this.formatTimeAgo(evt.timestamp);

      return `
        <article 
          onclick="window.app.selectEvent('${evt.id}')"
          class="cursor-pointer transition-all duration-200 border rounded p-3 mb-2.5 relative group ${borderClass} ${isLatest ? 'event-entry' : ''}"
        >
          <div class="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <div class="flex items-center gap-1.5">
              ${defconBadge}
              <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${catBadges[evt.category] || 'text-neutral-400'}">
                ${evt.category}
              </span>
            </div>
            <div class="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
              <span class="inline-block w-1.5 h-1.5 rounded-full ${evt.defcon === 1 ? 'bg-red-500 animate-ping' : 'bg-neutral-600'}"></span>
              ${timeAgo}
            </div>
          </div>

          <h3 class="font-tech text-sm text-neutral-100 font-semibold leading-snug group-hover:text-red-300 transition-colors mb-2">
            ${evt.title}
          </h3>

          <div class="flex items-center justify-between text-xs pt-1 border-t border-neutral-900/80">
            <div class="font-mono text-[11px] ${impactClass}">
              [IMPACT: ${evt.impact}]
            </div>
            <div class="text-[10px] font-mono text-neutral-400">
              CHAOS: <span class="font-bold text-red-400">${evt.chaosScore}/100</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Select Event for Detail Telemetry View
  selectEvent(eventId) {
    const found = this.events.find(e => e.id === eventId);
    if (found) {
      this.selectedEvent = found;
      this.renderFeed();
      this.renderSelectedTelemetry();
      window.tacticalAudio.playTick(1);
    }
  }

  // Render Selected Event into Detail Telemetry Drawer
  renderSelectedTelemetry() {
    const container = document.getElementById('selected-telemetry-container');
    if (!container || !this.selectedEvent) return;

    const evt = this.selectedEvent;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Header Incident ID -->
        <div class="flex items-center justify-between border-b border-red-500/20 pb-2">
          <div>
            <div class="text-[10px] uppercase tracking-widest text-neutral-400">INCIDENT DOSSIER</div>
            <div class="font-display text-base font-black text-red-400 neon-text-red">${evt.id}</div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 text-xs font-bold rounded ${evt.defcon === 1 ? 'bg-red-950 text-red-300 border border-red-600' : 'bg-amber-950 text-amber-300 border border-amber-600'}">
              DEFCON ${evt.defcon}
            </span>
          </div>
        </div>

        <!-- Headline & Impact -->
        <div>
          <h4 class="font-tech text-sm font-bold text-white mb-2 leading-tight">
            ${evt.title}
          </h4>
          <div class="p-2.5 rounded bg-black/60 border border-red-500/30 flex items-center justify-between">
            <span class="text-xs text-neutral-400 font-mono">FINANCIAL DAMAGE:</span>
            <span class="font-mono text-sm font-black text-red-400">
              $${(evt.lossUsd / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M USD
            </span>
          </div>
        </div>

        <!-- Narrative Analysis -->
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-red-400 uppercase tracking-wider flex items-center gap-1">
            <span class="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            INCIDENT ASSESSMENT
          </div>
          <p class="text-xs text-neutral-300 font-mono leading-relaxed bg-neutral-950/70 p-2.5 rounded border border-neutral-800">
            ${evt.details}
          </p>
        </div>

        <!-- Affected Asset Classes -->
        <div>
          <div class="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
            AFFECTED VECTORS & ASSETS
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${evt.affectedAssets.map(asset => `
              <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/40 border border-red-500/30 text-red-300">
                ${asset}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Tactical Recommendation Protocol -->
        <div class="p-3 rounded bg-red-950/20 border border-red-500/40 text-xs font-mono space-y-1">
          <div class="text-[10px] text-red-400 font-bold uppercase tracking-wider">
            [ RISK MITIGATION PROTOCOL ]
          </div>
          <div class="text-neutral-200 text-[11px]">
            ${evt.recommendation}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex gap-2">
          <button 
            onclick="window.app.acknowledgeCurrentIncident()"
            class="flex-1 py-1.5 px-3 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50 hover:border-red-400 text-xs font-mono font-bold uppercase transition-all"
          >
            ACKNOWLEDGE INCIDENT
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  acknowledgeCurrentIncident() {
    window.tacticalAudio.playTick(3);
    const container = document.getElementById('selected-telemetry-container');
    if (container) {
      const banner = document.createElement('div');
      banner.className = 'p-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs text-center rounded animate-pulse mt-2';
      banner.textContent = `[✓] INCIDENT ${this.selectedEvent?.id} LOGGED BY COMMAND DESK`;
      container.appendChild(banner);
      setTimeout(() => banner.remove(), 2500);
    }
  }

  // Update Top Ticker Stats & Panic Volatility Gauge
  updateStatsCounters() {
    const totalLiqEl = document.getElementById('stat-total-liquidations');
    const panicIndexEl = document.getElementById('stat-panic-index');
    const panicBarEl = document.getElementById('stat-panic-bar');
    const activeAlertsEl = document.getElementById('stat-active-alerts');

    if (totalLiqEl) {
      const billions = (this.totalLiquidationsUsd / 1000000000).toFixed(2);
      totalLiqEl.textContent = `$${billions}B`;
    }

    // Dynamic Panic Index calculation based on recent 8 events
    if (this.events.length > 0) {
      const recent = this.events.slice(0, 8);
      const avgChaos = recent.reduce((sum, e) => sum + e.chaosScore, 0) / recent.length;
      this.panicIndex = Math.min(99.4, Math.max(40, avgChaos + (Math.random() * 2 - 1))).toFixed(1);
    }

    if (panicIndexEl) {
      panicIndexEl.textContent = `${this.panicIndex} / 100`;
    }
    if (panicBarEl) {
      panicBarEl.style.width = `${this.panicIndex}%`;
    }

    if (activeAlertsEl) {
      const defcon1Count = this.events.filter(e => e.defcon === 1).length;
      activeAlertsEl.textContent = `${defcon1Count} SEV-1`;
    }
  }

  // Sector Bars in Left Column
  updateSectorBars() {
    const updateBar = (id, percent) => {
      const bar = document.getElementById(`sector-bar-${id}`);
      const val = document.getElementById(`sector-val-${id}`);
      if (bar) bar.style.width = `${percent}%`;
      if (val) val.textContent = `${percent}%`;
    };

    updateBar('crypto', this.sectors.crypto);
    updateBar('equities', this.sectors.equities);
    updateBar('cyber', this.sectors.cyber);
    updateBar('geopolitics', this.sectors.geopolitics);
  }

  // Update Bottom/Top Marquee with the latest headline
  updateMarquee(latestEvent) {
    const marqueeEl = document.getElementById('marquee-headline');
    if (marqueeEl && latestEvent) {
      marqueeEl.textContent = `[LATEST DISRUPTION] ${latestEvent.title} (${latestEvent.impact}) // `;
    }
  }

  formatTimeAgo(date) {
    const diffSec = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  }
}

// Instantiate global app once DOM loads
window.addEventListener('DOMContentLoaded', () => {
  window.app = new DoomDashboardApp();
});
