/**
 * Universal Input Manager for PC Keyboard and Mobile Touch / Gyroscope Controls.
 * Supports smooth steering interpolation, multi-touch virtual pedals, and tilt steering.
 */

export class InputManager {
  constructor() {
    this.keys = {};

    // Smoothed inputs
    this.throttle = 0;
    this.brake = 0;
    this.steer = 0;
    this.handbrake = 0;
    this.nitro = 0;

    // Mobile touch states
    this.touchSteerLeft = false;
    this.touchSteerRight = false;
    this.touchThrottle = false;
    this.touchBrake = false;
    this.touchHandbrake = false;
    this.touchNitro = false;

    // Tilt Steering (DeviceOrientation)
    this.tiltEnabled = false;
    this.tiltGamma = 0; // roll angle
    this.tiltCalibratedOffset = 0;
    this.tiltSensitivity = 1.0;

    // Action Triggers (one-shot events)
    this.onPause = null;
    this.onReset = null;
    this.onCycleCamera = null;
    this.onToggleMute = null;

    this.initKeyboard();
    this.initMobileControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Escape') {
        if (this.onPause) this.onPause();
      } else if (e.code === 'KeyC') {
        if (this.onCycleCamera) this.onCycleCamera();
      } else if (e.code === 'KeyR') {
        if (this.onReset) this.onReset();
      } else if (e.code === 'KeyM') {
        if (this.onToggleMute) this.onToggleMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  initMobileControls() {
    // Touch helper with passive: false to prevent gestures
    const bindTouch = (id, onStart, onEnd) => {
      const el = document.getElementById(id);
      if (!el) return;

      const handleStart = (e) => {
        e.preventDefault();
        onStart();
        el.classList.add('active');
      };

      const handleEnd = (e) => {
        e.preventDefault();
        onEnd();
        el.classList.remove('active');
      };

      el.addEventListener('touchstart', handleStart, { passive: false });
      el.addEventListener('touchend', handleEnd, { passive: false });
      el.addEventListener('touchcancel', handleEnd, { passive: false });
      el.addEventListener('mousedown', handleStart);
      el.addEventListener('mouseup', handleEnd);
      el.addEventListener('mouseleave', handleEnd);
    };

    bindTouch(
      'btn-steer-left',
      () => (this.touchSteerLeft = true),
      () => (this.touchSteerLeft = false)
    );
    bindTouch(
      'btn-steer-right',
      () => (this.touchSteerRight = true),
      () => (this.touchSteerRight = false)
    );
    bindTouch(
      'btn-gas',
      () => (this.touchThrottle = true),
      () => (this.touchThrottle = false)
    );
    bindTouch(
      'btn-brake',
      () => (this.touchBrake = true),
      () => (this.touchBrake = false)
    );
    bindTouch(
      'btn-handbrake',
      () => (this.touchHandbrake = true),
      () => (this.touchHandbrake = false)
    );
    bindTouch(
      'btn-nitro',
      () => (this.touchNitro = true),
      () => (this.touchNitro = false)
    );

    // Header buttons
    const bindClick = (id, callback) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', callback);
    };

    bindClick('btn-pause-hud', () => this.onPause && this.onPause());
    bindClick('btn-cam-hud', () => this.onCycleCamera && this.onCycleCamera());
    bindClick('btn-reset-hud', () => this.onReset && this.onReset());

    // Device Tilt Steering
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (!this.tiltEnabled) return;
        // In landscape mode, beta/gamma depends on orientation
        const isLandscape = window.innerWidth > window.innerHeight;
        let angle = isLandscape ? e.beta : e.gamma;
        if (angle !== null) {
          this.tiltGamma = angle - this.tiltCalibratedOffset;
        }
      });
    }
  }

  enableTilt(enable) {
    this.tiltEnabled = enable;
    if (enable && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(console.error);
    }
  }

  calibrateTilt() {
    this.tiltCalibratedOffset += this.tiltGamma;
  }

  update(dt) {
    // 1. Raw Target Steering
    // In camera space: left arrow / A turns towards screen-left (+1.0), right arrow / D turns towards screen-right (-1.0)
    let rawSteer = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.touchSteerLeft) {
      rawSteer += 1.0; // Steer LEFT
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.touchSteerRight) {
      rawSteer -= 1.0; // Steer RIGHT
    }

    if (this.tiltEnabled && Math.abs(this.tiltGamma) > 2.0) {
      // Clamped tilt between -30 and +30 degrees
      const tiltNorm = Math.min(Math.max(this.tiltGamma / 25.0, -1.0), 1.0);
      rawSteer = -tiltNorm * this.tiltSensitivity;
    }

    // Smooth steering ramp-up & return-to-center
    const steerSpeed = rawSteer !== 0 ? 8.0 : 12.0;
    this.steer += (rawSteer - this.steer) * Math.min(steerSpeed * dt, 1.0);

    // 2. Throttle
    const rawThrottle =
      this.keys['KeyW'] || this.keys['ArrowUp'] || this.touchThrottle ? 1.0 : 0.0;
    this.throttle += (rawThrottle - this.throttle) * Math.min(10.0 * dt, 1.0);

    // 3. Brake / Reverse
    const rawBrake =
      this.keys['KeyS'] || this.keys['ArrowDown'] || this.touchBrake ? 1.0 : 0.0;
    this.brake += (rawBrake - this.brake) * Math.min(10.0 * dt, 1.0);

    // 4. Handbrake
    const rawHandbrake =
      this.keys['Space'] || this.touchHandbrake ? 1.0 : 0.0;
    this.handbrake = rawHandbrake;

    // 5. Nitro
    const rawNitro =
      this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchNitro ? 1.0 : 0.0;
    this.nitro = rawNitro;
  }

  getState() {
    return {
      throttle: this.throttle,
      brake: this.brake,
      steer: this.steer,
      handbrake: this.handbrake,
      nitro: this.nitro,
    };
  }
}
