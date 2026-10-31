/**
 * Procedural Audio System using Web Audio API
 * Generates dynamic engine sounds, tire screeches, nitro bursts, crashes, UI sounds,
 * and high-energy synthwave racing music without any external audio files.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicEnabled = true;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    // Engine Nodes
    this.engineRunning = false;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineOsc3 = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.turboOsc = null;
    this.turboGain = null;

    // Tire Screech Nodes
    this.screechGain = null;
    this.screechFilter = null;
    this.screechSource = null;

    // Nitro Sound Nodes
    this.nitroGain = null;
    this.nitroSource = null;

    // Music Sequencer State
    this.musicTimer = null;
    this.step = 0;
    this.tempo = 128; // BPM
    this.currentTrackIntensity = 1.0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gains
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.initEngineAudio();
      this.initTireAudio();
      this.initNitroAudio();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create pink/white noise buffer for tires and impacts
  createNoiseBuffer(duration = 2.0) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.15;
    }
    return buffer;
  }

  initEngineAudio() {
    if (!this.ctx) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // Osc 1: fundamental crank frequency
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(32, this.ctx.currentTime);

    // Osc 2: sub harmonic / exhaust resonance
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(64, this.ctx.currentTime);

    // Osc 3: intake rumble
    this.engineOsc3 = this.ctx.createOscillator();
    this.engineOsc3.type = 'sawtooth';
    this.engineOsc3.frequency.setValueAtTime(48, this.ctx.currentTime);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineOsc3.connect(this.engineFilter);

    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.engineOsc3.start();

    // Turbo spool whistle
    this.turboGain = this.ctx.createGain();
    this.turboGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.turboOsc = this.ctx.createOscillator();
    this.turboOsc.type = 'sine';
    this.turboOsc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.sfxGain);
    this.turboOsc.start();

    this.engineRunning = true;
  }

  initTireAudio() {
    if (!this.ctx) return;

    const noiseBuffer = this.createNoiseBuffer(3.0);
    this.screechSource = this.ctx.createBufferSource();
    this.screechSource.buffer = noiseBuffer;
    this.screechSource.loop = true;

    this.screechFilter = this.ctx.createBiquadFilter();
    this.screechFilter.type = 'bandpass';
    this.screechFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    this.screechFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.screechGain = this.ctx.createGain();
    this.screechGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.screechSource.connect(this.screechFilter);
    this.screechFilter.connect(this.screechGain);
    this.screechGain.connect(this.sfxGain);
    this.screechSource.start();
  }

  initNitroAudio() {
    if (!this.ctx) return;

    const noiseBuffer = this.createNoiseBuffer(2.0);
    this.nitroSource = this.ctx.createBufferSource();
    this.nitroSource.buffer = noiseBuffer;
    this.nitroSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.nitroGain = this.ctx.createGain();
    this.nitroGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.nitroSource.connect(filter);
    filter.connect(this.nitroGain);
    this.nitroGain.connect(this.sfxGain);
    this.nitroSource.start();
  }

  updateEngine(rpm, throttle, speedKmh, isNitro, isDrifting, driftFactor) {
    if (!this.ctx || !this.engineRunning) return;

    const now = this.ctx.currentTime;
    const clampedRpm = Math.min(Math.max(rpm || 1000, 800), 8500);
    const rpmFrac = (clampedRpm - 800) / (8500 - 800);

    // Fundamental frequencies
    const f0 = 24 + rpmFrac * 170;
    this.engineOsc1.frequency.setTargetAtTime(f0, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(f0 * 1.5, now, 0.05);
    this.engineOsc3.frequency.setTargetAtTime(f0 * 2.0, now, 0.05);

    // Filter cutoff opens with throttle and RPM
    const cutoff = 300 + throttle * 2200 + rpmFrac * 1800;
    this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.04);

    // Engine volume
    const targetEngineVol = 0.25 + throttle * 0.35 + rpmFrac * 0.25;
    this.engineGain.gain.setTargetAtTime(targetEngineVol, now, 0.04);

    // Turbo spool
    if (throttle > 0.5 && rpmFrac > 0.4) {
      const turboPitch = 1200 + rpmFrac * 3200;
      this.turboOsc.frequency.setTargetAtTime(turboPitch, now, 0.1);
      this.turboGain.gain.setTargetAtTime(0.08 * throttle, now, 0.1);
    } else {
      this.turboGain.gain.setTargetAtTime(0.001, now, 0.15);
    }

    // Tire Screech
    if (this.screechGain) {
      let screechVol = 0.001;
      if (isDrifting && speedKmh > 12) {
        screechVol = Math.min(0.05 + driftFactor * 0.4, 0.5);
      } else if (throttle === 0 && rpmFrac < 0.2 && speedKmh > 30) {
        // Hard braking screech
        screechVol = 0.2;
      }
      this.screechGain.gain.setTargetAtTime(screechVol, now, 0.06);
      const screechFreq = 900 + (speedKmh / 200) * 800;
      this.screechFilter.frequency.setTargetAtTime(screechFreq, now, 0.08);
    }

    // Nitro sound
    if (this.nitroGain) {
      const nitroVol = isNitro ? 0.45 : 0.001;
      this.nitroGain.gain.setTargetAtTime(nitroVol, now, 0.06);
    }
  }

  // Blow-off valve turbo flutter sound when letting off throttle
  playBlowOff() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playCollision(intensity = 1.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const strength = Math.min(Math.max(intensity, 0.2), 2.0);

    // Deep sub impact
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 * strength, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    oscGain.gain.setValueAtTime(0.5 * strength, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);

    // Metal crunch noise
    const noiseBuffer = this.createNoiseBuffer(0.4);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.setValueAtTime(1.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * strength, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  playCountdown(step) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (step > 0) {
      // 3, 2, 1 beeps
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // GO! High pitch cheer beep
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.62);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
  }

  playCheckpoint() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  playVictory() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.42);
    });
  }

  playClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /* ================= Procedural Synthwave Music Generator ================= */

  startMusic() {
    if (!this.ctx || !this.musicEnabled || this.musicTimer) return;

    this.step = 0;
    const stepDuration = 60 / (this.tempo * 4); // 16th note in seconds

    // Bassline chord progression in F minor / D# / C# / C
    const bassline = [
      43.65, 43.65, 43.65, 43.65, 43.65, 43.65, 87.31, 43.65, // F1
      38.89, 38.89, 38.89, 38.89, 38.89, 38.89, 77.78, 38.89, // D#1
      34.65, 34.65, 34.65, 34.65, 34.65, 34.65, 69.30, 34.65, // C#1
      32.70, 32.70, 32.70, 32.70, 65.41, 77.78, 65.41, 48.99, // C1
    ];

    // Arpeggio lead melody notes
    const arpNotes = [
      174.61, 220.0, 261.63, 349.23, 261.63, 220.0, 174.61, 261.63,
      155.56, 196.0, 233.08, 311.13, 233.08, 196.0, 155.56, 233.08,
      138.59, 174.61, 207.65, 277.18, 207.65, 174.61, 138.59, 207.65,
      130.81, 164.81, 196.0, 261.63, 196.0, 164.81, 196.0, 246.94
    ];

    const playNextStep = () => {
      if (!this.musicEnabled || !this.ctx) return;

      const now = this.ctx.currentTime;
      const s = this.step % 32;

      // 1. Kick on beats 0, 4, 8, 12, 16, 20, 24, 28 (4-on-the-floor)
      if (s % 4 === 0) {
        this.synthKick(now);
      }

      // 2. Snare on beats 4, 12, 20, 28 (backbeat)
      if (s % 8 === 4) {
        this.synthSnare(now);
      }

      // 3. Hi-hat on offbeats
      if (s % 2 === 1) {
        this.synthHiHat(now);
      }

      // 4. Bass pulse every 16th note
      const bassFreq = bassline[s];
      if (bassFreq) {
        this.synthBass(now, bassFreq, stepDuration * 0.9);
      }

      // 5. Arpeggio lead synth
      if (this.currentTrackIntensity > 0.6) {
        const arpFreq = arpNotes[s];
        if (arpFreq) {
          this.synthLead(now, arpFreq, stepDuration * 0.7);
        }
      }

      this.step++;
      this.musicTimer = setTimeout(playNextStep, stepDuration * 1000);
    };

    playNextStep();
  }

  stopMusic() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  synthKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  synthSnare(time) {
    // Noise snap
    const noiseBuffer = this.createNoiseBuffer(0.18);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    noise.start(time);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.11);
  }

  synthHiHat(time) {
    const noiseBuffer = this.createNoiseBuffer(0.05);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    noise.start(time);
  }

  synthBass(time, freq, dur) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320 * this.currentTrackIntensity, time);
    filter.Q.setValueAtTime(4.0, time);

    gain.gain.setValueAtTime(0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  synthLead(time, freq, dur) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(2.0, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(sfxVol, musicVol) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfxVol, now);
    if (this.musicGain) this.musicGain.gain.setValueAtTime(musicVol, now);
  }
}
