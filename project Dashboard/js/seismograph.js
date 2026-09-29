/**
 * Doom Scroller Dashboard - Real-time Volatility Seismograph
 * Renders an animated military ECG / seismograph oscilloscope canvas with dynamic shock spikes.
 */

class VolatilitySeismograph {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.points = [];
    this.maxPoints = 120;
    this.currentVolatility = 45;
    this.targetVolatility = 45;
    this.shockQueue = [];
    this.isRunning = true;
    this.lastRenderTime = performance.now();

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());

    // Fill initial baseline
    for (let i = 0; i < this.maxPoints; i++) {
      this.points.push(40 + (Math.random() * 8 - 4));
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvasSize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 400) * dpr;
    this.canvas.height = 140 * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width || 400;
    this.height = 140;
  }

  // Trigger a shock impulse when a high-volatility event arrives
  injectShock(chaosScore) {
    this.targetVolatility = chaosScore;
    
    // Add shock wave packet to queue
    const shockMagnitude = (chaosScore / 100) * 45;
    this.shockQueue.push(shockMagnitude);
    this.shockQueue.push(-shockMagnitude * 0.7);
    this.shockQueue.push(shockMagnitude * 0.4);
    this.shockQueue.push(-shockMagnitude * 0.2);
  }

  animate(now) {
    if (!this.isRunning) return;

    // Smoothly step volatility towards target with decay
    this.targetVolatility += (45 - this.targetVolatility) * 0.02;
    this.currentVolatility += (this.targetVolatility - this.currentVolatility) * 0.1;

    // Process next shock point
    let nextVal = this.currentVolatility + (Math.random() * 6 - 3);
    if (this.shockQueue.length > 0) {
      nextVal += this.shockQueue.shift();
    }
    nextVal = Math.max(10, Math.min(95, nextVal));

    this.points.push(nextVal);
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const { ctx, width, height } = this;
    if (!ctx || !width || !height) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Tactical Grid & Background
    ctx.fillStyle = 'rgba(6, 8, 14, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal gridlines
    ctx.strokeStyle = 'rgba(255, 18, 68, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical time markers
    for (let x = 20; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Critical Hazard Threshold Line at 90%
    const thresholdY = height - (0.85 * height);
    ctx.strokeStyle = 'rgba(255, 18, 68, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Threshold indicator text
    ctx.fillStyle = 'rgba(255, 18, 68, 0.7)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('CRITICAL DEFCON THRESHOLD [90%]', 8, thresholdY - 4);

    // 2. Waveform Fill Gradient
    const stepX = width / (this.maxPoints - 1);
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let i = 0; i < this.points.length; i++) {
      const x = i * stepX;
      const normalizedY = height - ((this.points[i] / 100) * (height - 20) + 10);
      ctx.lineTo(x, normalizedY);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 18, 68, 0.35)');
    gradient.addColorStop(0.6, 'rgba(255, 18, 68, 0.08)');
    gradient.addColorStop(1, 'rgba(255, 18, 68, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 3. Glowing Neon Waveform Stroke
    ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      const x = i * stepX;
      const normalizedY = height - ((this.points[i] / 100) * (height - 20) + 10);
      if (i === 0) ctx.moveTo(x, normalizedY);
      else ctx.lineTo(x, normalizedY);
    }

    ctx.strokeStyle = '#ff1244';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff1244';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // 4. Leading Needle Pulse Beacon
    const lastX = (this.points.length - 1) * stepX;
    const lastY = height - ((this.points[this.points.length - 1] / 100) * (height - 20) + 10);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff1244';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

window.VolatilitySeismograph = VolatilitySeismograph;
