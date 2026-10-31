/**
 * Professional Racing HUD & UI Manager
 * Handles Speedometer, Tachometer, Nitro bar, Minimap radar, Lap times,
 * Position badge, Drift alerts, Main Menu, Pause Menu, and Results Screen.
 */

export class UIManager {
  constructor() {
    // DOM Elements
    this.hud = document.getElementById('game-hud');
    this.speedVal = document.getElementById('speed-value');
    this.gearVal = document.getElementById('gear-value');
    this.rpmBar = document.getElementById('rpm-fill');
    this.needle = document.getElementById('tach-needle');
    this.nitroBar = document.getElementById('nitro-fill');
    this.lapCounter = document.getElementById('lap-value');
    this.posCounter = document.getElementById('pos-value');
    this.curTimeEl = document.getElementById('cur-time');
    this.bestTimeEl = document.getElementById('best-time');
    this.driftAlert = document.getElementById('drift-alert');
    this.driftScoreEl = document.getElementById('drift-score');
    this.wrongWayEl = document.getElementById('wrong-way-alert');
    this.countdownEl = document.getElementById('countdown-overlay');

    // Minimap Canvas
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // Menus
    this.mainMenu = document.getElementById('main-menu');
    this.pauseMenu = document.getElementById('pause-menu');
    this.resultsModal = document.getElementById('results-modal');
    this.settingsModal = document.getElementById('settings-modal');

    this.driftHideTimer = null;
    this.lastDriftScore = 0;
  }

  formatTime(seconds) {
    if (!seconds || seconds <= 0 || !isFinite(seconds)) return '--:--.--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  }

  showHUD(show) {
    if (this.hud) this.hud.style.display = show ? 'block' : 'none';
  }

  showMainMenu(show) {
    if (this.mainMenu) this.mainMenu.style.display = show ? 'flex' : 'none';
  }

  showPauseMenu(show) {
    if (this.pauseMenu) this.pauseMenu.style.display = show ? 'flex' : 'none';
  }

  showResults(show, resultsData) {
    if (!this.resultsModal) return;
    this.resultsModal.style.display = show ? 'flex' : 'none';

    if (show && resultsData) {
      document.getElementById('res-title').textContent =
        resultsData.position === 1 ? '🏆 VICTORY!' : resultsData.position <= 3 ? '🥉 PODIUM FINISH!' : 'RACE FINISHED';
      document.getElementById('res-pos').textContent = `${resultsData.position}${this.getOrdinal(resultsData.position)}`;
      document.getElementById('res-total-time').textContent = this.formatTime(resultsData.totalTime);
      document.getElementById('res-best-lap').textContent = this.formatTime(resultsData.bestLap);
      document.getElementById('res-drift-score').textContent = Math.floor(resultsData.driftScore || 0);

      // Points earned
      const pts = [25, 18, 15, 12, 10, 8, 6, 4][resultsData.position - 1] || 2;
      document.getElementById('res-points').textContent = `+${pts} PTS`;
    }
  }

  getOrdinal(n) {
    const s = ['TH', 'ST', 'ND', 'RD'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  showCountdown(text) {
    if (!this.countdownEl) return;
    if (text) {
      this.countdownEl.textContent = text;
      this.countdownEl.style.display = 'block';
      this.countdownEl.classList.remove('pulse');
      void this.countdownEl.offsetWidth; // retrigger css animation
      this.countdownEl.classList.add('pulse');
    } else {
      this.countdownEl.style.display = 'none';
    }
  }

  updateHUD(carState, raceState) {
    // 1. Digital Speedometer
    const speed = Math.round(carState.speedKmh || 0);
    if (this.speedVal) this.speedVal.textContent = speed;

    // 2. Gear & RPM
    const gear = Math.round(carState.gear || 1);
    if (this.gearVal) {
      this.gearVal.textContent = carState.speedKmh < 0.5 && carState.brake > 0.5 ? 'R' : gear;
    }

    const rpm = carState.rpm || 1000;
    const rpmFrac = Math.min(Math.max((rpm - 950) / (8200 - 950), 0), 1.0);
    if (this.rpmBar) {
      this.rpmBar.style.width = `${rpmFrac * 100}%`;
      // Flash red near redline
      if (rpmFrac > 0.88) {
        this.rpmBar.style.backgroundColor = '#ff0033';
      } else {
        this.rpmBar.style.backgroundColor = '#00f0ff';
      }
    }

    // Tachometer needle rotation (-120deg to +120deg)
    if (this.needle) {
      const angle = -120 + rpmFrac * 240;
      this.needle.style.transform = `rotate(${angle}deg)`;
    }

    // 3. Nitro Bar
    const nitroAmount = carState.nitroAmount !== undefined ? carState.nitroAmount : 100;
    if (this.nitroBar) {
      this.nitroBar.style.width = `${nitroAmount}%`;
      if (carState.nitro > 0.5 && nitroAmount > 1) {
        this.nitroBar.classList.add('active-boost');
      } else {
        this.nitroBar.classList.remove('active-boost');
      }
    }

    // 4. Lap, Position, and Times
    if (raceState) {
      if (this.lapCounter) {
        this.lapCounter.textContent = `${Math.min(raceState.currentLap, raceState.totalLaps)} / ${raceState.totalLaps}`;
      }
      if (this.posCounter) {
        this.posCounter.textContent = `${raceState.position}${this.getOrdinal(raceState.position)}`;
      }
      if (this.curTimeEl) {
        this.curTimeEl.textContent = this.formatTime(raceState.currentLapTime);
      }
      if (this.bestTimeEl) {
        this.bestTimeEl.textContent = this.formatTime(raceState.bestLapTime);
      }

      // Wrong Way Alert
      if (this.wrongWayEl) {
        this.wrongWayEl.style.display = raceState.isWrongWay ? 'block' : 'none';
      }
    }

    // 5. Drift Score Banner
    const curScore = Math.floor(carState.driftScore || 0);
    if (carState.isDrifting > 0.5) {
      if (this.driftHideTimer) {
        clearTimeout(this.driftHideTimer);
        this.driftHideTimer = null;
      }
      if (this.driftAlert) {
        this.driftAlert.style.display = 'block';
        if (this.driftScoreEl) {
          const combo = curScore > 2000 ? ' 🔥 INSANE DRIFT' : curScore > 800 ? ' ⚡ GREAT DRIFT' : '';
          this.driftScoreEl.textContent = `+${curScore}${combo}`;
        }
      }
    } else {
      if (this.driftAlert && !this.driftHideTimer && this.driftAlert.style.display === 'block') {
        this.driftHideTimer = setTimeout(() => {
          if (this.driftAlert) this.driftAlert.style.display = 'none';
          this.driftHideTimer = null;
        }, 1200);
      }
    }
  }

  // Draw 2D Minimap Radar
  drawMinimap(trackPoints, playerCar, aiCars) {
    if (!this.minimapCtx || !trackPoints || trackPoints.length === 0) return;

    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Compute bounding box of track
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (let p of trackPoints) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }

    const pad = 24;
    const trackSpanX = maxX - minX || 1;
    const trackSpanZ = maxZ - minZ || 1;
    const scale = Math.min((w - pad * 2) / trackSpanX, (h - pad * 2) / trackSpanZ);

    const mapX = (x) => pad + (x - minX) * scale;
    const mapY = (z) => pad + (z - minZ) * scale;

    // Draw Track Line Ribbon
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < trackPoints.length; i++) {
      const p = trackPoints[i];
      const sx = mapX(p.x);
      const sy = mapY(p.z);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();

    // Start / Finish Line marker
    const startP = trackPoints[0];
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(mapX(startP.x), mapY(startP.z), 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw AI opponent dots (Orange)
    if (aiCars) {
      ctx.fillStyle = '#ff9900';
      for (let ai of aiCars) {
        const ax = mapX(ai.carState.x);
        const ay = mapY(ai.carState.z);
        ctx.beginPath();
        ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Player marker (Cyan / Red with heading arrow)
    if (playerCar) {
      const px = mapX(playerCar.x);
      const py = mapY(playerCar.z);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(playerCar.yaw);

      // Player Arrow
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.lineTo(-4, -5);
      ctx.lineTo(0, -2);
      ctx.lineTo(4, -5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}
