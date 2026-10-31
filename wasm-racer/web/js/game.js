/**
 * Master Game Loop & Race Mode Coordinator
 * Supports Quick Race, Championship Mode, Time Trial, Free Drive, and AI Elimination.
 */

import { WasmBridge } from './wasm_bridge.js';
import { AudioManager } from './audio.js';
import { CarBuilder, CAR_MODELS } from './car_builder.js';
import { TrackBuilder, TRACK_CONFIGS } from './tracks.js';
import { RacingCamera } from './camera.js';
import { ParticleSystem } from './particles.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { AICar, AI_NAMES } from './ai.js';
import { CarState } from './physics.js';

export const GAME_MODES = {
  QUICK_RACE: 'quick_race',
  CHAMPIONSHIP: 'championship',
  TIME_TRIAL: 'time_trial',
  FREE_DRIVE: 'free_drive',
  ELIMINATION: 'elimination',
};

export class Game {
  constructor() {
    this.canvas = document.getElementById('render-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.racingCamera = null;

    // Subsystems
    this.wasmBridge = new WasmBridge();
    this.audio = new AudioManager();
    this.input = new InputManager();
    this.ui = new UIManager();
    this.particles = null;

    // Game Config & State
    this.selectedCarConfig = CAR_MODELS[0];
    this.selectedTrackConfig = TRACK_CONFIGS[0];
    this.currentMode = GAME_MODES.QUICK_RACE;
    this.totalLaps = 3;
    this.numAiOpponents = 4;

    // Race State
    this.isRacing = false;
    this.isPaused = false;
    this.countdownTimer = 0;
    this.raceTimer = 0;
    this.currentLap = 1;
    this.currentLapTime = 0;
    this.bestLapTime = Infinity;
    this.raceFinished = false;

    // Championship Cup State
    this.championshipTrackIdx = 0;
    this.championshipPoints = 0;

    // Elimination Timer
    this.eliminationTimer = 45;

    // Entities
    this.trackData = null;
    this.playerCar = null;
    this.playerVisual = null;
    this.aiCars = [];

    // Lighting
    this.dirLight = null;
    this.hemiLight = null;

    // Performance & Delta time
    this.lastTime = performance.now();
    this.fpsCount = 0;
    this.fpsTime = 0;
  }

  async init() {
    this.initThree();

    // Init WebAssembly
    await this.wasmBridge.init();

    // Particles
    this.particles = new ParticleSystem(this.scene);

    // Audio on first interaction
    const startAudio = () => {
      this.audio.init();
      this.audio.resume();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);
    window.addEventListener('touchstart', startAudio);

    // Input Action Listeners
    this.input.onPause = () => this.togglePause();
    this.input.onReset = () => this.resetPlayerToTrack();
    this.input.onCycleCamera = () => {
      const modeName = this.racingCamera.cycleMode();
      console.log('Camera switched to:', modeName);
    };
    this.input.onToggleMute = () => {
      const muted = this.audio.toggleMute();
      console.log('Audio muted:', muted);
    };

    // Load Initial Track
    this.loadTrack(this.selectedTrackConfig);

    // Spawn Initial Player Car
    this.spawnPlayer(this.selectedCarConfig);

    // Start Master Render Loop
    this.animate();
  }

  initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.2, 2400);
    this.racingCamera = new RacingCamera(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Window Resize Handling
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Lighting Setup - Bright, crisp, vibrant arcade lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.2);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.9);
    this.dirLight.position.set(120, 180, 80);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 450;
    const d = 110;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // Dynamic Fill Light centered over player car
    this.carFillLight = new THREE.PointLight(0xffffff, 1.8, 35, 1.2);
    this.carFillLight.position.set(0, 4.0, 0);
    this.scene.add(this.carFillLight);
  }

  loadTrack(trackConfig) {
    if (this.trackData && this.trackData.group) {
      this.scene.remove(this.trackData.group);
    }

    this.selectedTrackConfig = trackConfig;
    this.trackData = TrackBuilder.buildTrack(this.scene, trackConfig);

    // Set Scene Environment & Fog
    this.scene.background = new THREE.Color(trackConfig.skyColor);
    this.scene.fog = new THREE.FogExp2(trackConfig.fogColor, trackConfig.fogDensity);

    this.hemiLight.color.setHex(trackConfig.ambientColor);
    this.dirLight.color.setHex(trackConfig.sunColor);

    if (trackConfig.theme === 'night') {
      this.ambientLight.intensity = 0.95;
      this.ambientLight.color.setHex(0xaaccff);
      this.dirLight.intensity = 1.6;
      this.hemiLight.intensity = 1.1;
      this.carFillLight.intensity = 2.2;
    } else {
      this.ambientLight.intensity = 1.15;
      this.ambientLight.color.setHex(0xffffff);
      this.dirLight.intensity = 2.1;
      this.hemiLight.intensity = 1.4;
      this.carFillLight.intensity = 1.2;
    }

    // Pass track waypoints to WASM Bridge
    this.wasmBridge.setWaypoints(trackConfig.waypoints);
  }

  spawnPlayer(carConfig) {
    if (this.playerVisual && this.playerVisual.group) {
      this.scene.remove(this.playerVisual.group);
    }

    this.selectedCarConfig = carConfig;
    this.playerVisual = CarBuilder.createCar(carConfig, true);
    this.scene.add(this.playerVisual.group);

    this.playerCar = new CarState(carConfig);
    this.playerCar.respawn(this.trackData, -2.5); // Grid slot 1
    this.playerCar.syncMesh(this.playerVisual.group);

    // Night mode check
    CarBuilder.setNightMode(this.playerVisual, this.selectedTrackConfig.theme === 'night');
  }

  spawnAICars() {
    // Clear existing AI
    for (let ai of this.aiCars) {
      ai.destroy(this.scene);
    }
    this.aiCars = [];

    if (this.currentMode === GAME_MODES.FREE_DRIVE) {
      return; // No AI opponents in free drive
    }

    const availableConfigs = CAR_MODELS.filter((c) => c.id !== this.selectedCarConfig.id);
    const gridOffsets = [
      { lane: 2.5, z: -12 },
      { lane: -2.5, z: -24 },
      { lane: 2.5, z: -36 },
      { lane: -2.5, z: -48 },
      { lane: 2.5, z: -60 },
      { lane: -2.5, z: -72 },
    ];

    const count = Math.min(this.numAiOpponents, gridOffsets.length);
    for (let i = 0; i < count; i++) {
      const cfg = availableConfigs[i % availableConfigs.length];
      const name = AI_NAMES[i % AI_NAMES.length];
      const slot = gridOffsets[i];

      const ai = new AICar(i + 1, name, cfg, this.scene, this.trackData, slot.lane, slot.z);
      CarBuilder.setNightMode(ai.carVisual, this.selectedTrackConfig.theme === 'night');
      this.aiCars.push(ai);
    }
  }

  startRace(mode = GAME_MODES.QUICK_RACE) {
    this.currentMode = mode;
    this.isRacing = false;
    this.isPaused = false;
    this.raceFinished = false;

    this.currentLap = 1;
    this.raceTimer = 0;
    this.currentLapTime = 0;
    this.bestLapTime = Infinity;
    this.eliminationTimer = 45;

    // Reset player & AI positions on starting grid
    this.playerCar.respawn(this.trackData, -2.5);
    this.playerCar.lap = 1;
    this.playerCar.currentWaypointIdx = 0;
    this.playerCar.syncMesh(this.playerVisual.group);

    this.spawnAICars();

    // UI & Audio
    this.ui.showMainMenu(false);
    this.ui.showPauseMenu(false);
    this.ui.showResults(false);
    this.ui.showHUD(true);

    this.audio.resume();
    this.audio.startMusic();

    // 3, 2, 1, GO! Countdown
    this.countdownTimer = 3.6;
    this.countdownStep = 3;
    this.ui.showCountdown('3');
    this.audio.playCountdown(3);
  }

  togglePause() {
    if (!this.isRacing && this.countdownTimer <= 0) return;
    this.isPaused = !this.isPaused;
    this.ui.showPauseMenu(this.isPaused);
    if (this.isPaused) {
      this.audio.stopMusic();
    } else {
      this.audio.startMusic();
    }
  }

  resetPlayerToTrack() {
    if (!this.playerCar || !this.trackData) return;

    // Find nearest track point to safely respawn in center of road
    const closestIdx = this.findClosestTrackIndex(this.playerCar.x, this.playerCar.z);
    const p = this.trackData.samplePoints[closestIdx];
    const data = this.trackData.sampledData[closestIdx];

    this.playerCar.x = p.x;
    this.playerCar.y = p.y;
    this.playerCar.z = p.z;
    this.playerCar.vx = 0;
    this.playerCar.vy = 0;
    this.playerCar.vz = 0;
    this.playerCar.yaw = Math.atan2(data.forward.x, data.forward.z);
    this.playerCar.pitch = 0;
    this.playerCar.roll = 0;
    this.playerCar.speedKmh = 0;
    this.playerCar.syncMesh(this.playerVisual.group);
  }

  findClosestTrackIndex(x, z) {
    const samples = this.trackData.samplePoints;
    let minDistSq = Infinity;
    let bestIdx = 0;
    for (let i = 0; i < samples.length; i += 2) {
      const p = samples[i];
      const dx = p.x - x;
      const dz = p.z - z;
      const dSq = dx * dx + dz * dz;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  updateRaceLogic(dt) {
    // 1. Countdown handling
    if (this.countdownTimer > 0) {
      this.countdownTimer -= dt;
      if (this.countdownTimer > 2.4) {
        if (this.countdownStep !== 3) {
          this.countdownStep = 3;
          this.ui.showCountdown('3');
          this.audio.playCountdown(3);
        }
      } else if (this.countdownTimer > 1.4) {
        if (this.countdownStep !== 2) {
          this.countdownStep = 2;
          this.ui.showCountdown('2');
          this.audio.playCountdown(2);
        }
      } else if (this.countdownTimer > 0.4) {
        if (this.countdownStep !== 1) {
          this.countdownStep = 1;
          this.ui.showCountdown('1');
          this.audio.playCountdown(1);
        }
      } else if (this.countdownTimer > 0) {
        if (this.countdownStep !== 0) {
          this.countdownStep = 0;
          this.ui.showCountdown('GO!');
          this.audio.playCountdown(0);
        }
      } else {
        this.countdownStep = -1;
        this.ui.showCountdown(null);
        this.isRacing = true;
      }
      return;
    }

    if (!this.isRacing || this.raceFinished) return;

    this.raceTimer += dt;
    this.currentLapTime += dt;

    // 2. Track Progression & Lap Counting for Player
    const playerIdx = this.findClosestTrackIndex(this.playerCar.x, this.playerCar.z);
    const totalSamples = this.trackData.samplePoints.length;

    // Check wrong way
    const trackFwd = this.trackData.sampledData[playerIdx].forward;
    const playerFwd = new THREE.Vector3(Math.sin(this.playerCar.yaw), 0, Math.cos(this.playerCar.yaw));
    const dot = trackFwd.dot(playerFwd);
    this.playerCar.isWrongWay = dot < -0.3 && this.playerCar.speedKmh > 10;

    // Checkpoint sequential progress
    const half = Math.floor(totalSamples / 2);
    if (playerIdx > half && this.playerCar.lastCheckpointIdx < half) {
      this.playerCar.lastCheckpointIdx = playerIdx;
      this.audio.playCheckpoint();
    }

    // Crossed Finish Line
    if (playerIdx < 20 && this.playerCar.lastCheckpointIdx >= half) {
      // Completed Lap!
      if (this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime;
      }
      this.currentLapTime = 0;
      this.playerCar.lastCheckpointIdx = 0;
      this.audio.playCheckpoint();

      if (this.currentLap >= this.totalLaps && this.currentMode !== GAME_MODES.FREE_DRIVE) {
        this.finishRace();
      } else {
        this.currentLap++;
      }
    }

    this.playerCar.totalRaceProgress = (this.currentLap - 1) * totalSamples + playerIdx;

    // 3. AI Progress & Elimination Mode
    for (let ai of this.aiCars) {
      const aiIdx = this.findClosestTrackIndex(ai.carState.x, ai.carState.z);
      if (aiIdx > half && ai.carState.lastCheckpointIdx < half) {
        ai.carState.lastCheckpointIdx = aiIdx;
      }
      if (aiIdx < 20 && ai.carState.lastCheckpointIdx >= half) {
        ai.carState.lap++;
        ai.carState.lastCheckpointIdx = 0;
      }
      ai.carState.totalRaceProgress = (ai.carState.lap - 1) * totalSamples + aiIdx;
    }

    // Elimination Mode Countdown
    if (this.currentMode === GAME_MODES.ELIMINATION && this.aiCars.length > 0) {
      this.eliminationTimer -= dt;
      if (this.eliminationTimer <= 0) {
        this.eliminationTimer = 40;
        this.eliminateLastCar();
      }
    }

    // 4. Calculate Race Positions
    const allRacers = [
      { id: 'player', progress: this.playerCar.totalRaceProgress },
      ...this.aiCars.map((ai) => ({ id: ai.id, progress: ai.carState.totalRaceProgress })),
    ];
    allRacers.sort((a, b) => b.progress - a.progress);

    this.currentPosition = allRacers.findIndex((r) => r.id === 'player') + 1;
  }

  eliminateLastCar() {
    if (this.aiCars.length === 0) return;
    const allRacers = [
      { isPlayer: true, progress: this.playerCar.totalRaceProgress },
      ...this.aiCars.map((ai, idx) => ({ isPlayer: false, ai, idx, progress: ai.carState.totalRaceProgress })),
    ];
    allRacers.sort((a, b) => a.progress - b.progress);

    const lowest = allRacers[0];
    if (lowest.isPlayer) {
      // Player eliminated!
      this.finishRace();
    } else {
      // Remove lowest AI
      lowest.ai.destroy(this.scene);
      this.aiCars.splice(lowest.idx, 1);
      this.audio.playCollision(1.5);
    }
  }

  finishRace() {
    this.raceFinished = true;
    this.isRacing = false;
    this.audio.stopMusic();
    this.audio.playVictory();

    const results = {
      position: this.currentPosition,
      totalTime: this.raceTimer,
      bestLap: this.bestLapTime,
      driftScore: this.playerCar.driftScore,
    };

    setTimeout(() => {
      this.ui.showResults(true, results);
    }, 1200);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1; // clamp delta time for stability

    if (!this.isPaused) {
      // 1. Process Input
      this.input.update(dt);
      const inputState = this.input.getState();

      if (this.isRacing) {
        this.playerCar.steer = inputState.steer;
        this.playerCar.throttle = inputState.throttle;
        this.playerCar.brake = inputState.brake;
        this.playerCar.handbrake = inputState.handbrake;
        this.playerCar.nitro = inputState.nitro;
      } else {
        // Freeze controls during countdown
        this.playerCar.steer = 0;
        this.playerCar.throttle = 0;
        this.playerCar.brake = 1.0;
        this.playerCar.handbrake = 1.0;
        this.playerCar.nitro = 0;
      }

      // 2. Step Player Physics via WASM Bridge
      this.wasmBridge.stepCar(this.playerCar, dt, 1.0);
      this.playerCar.syncMesh(this.playerVisual.group);
      CarBuilder.updateCarVisuals(this.playerVisual, this.playerCar, inputState.brake > 0.2);

      // Track Barrier Collisions for Player
      const closestIdx = this.findClosestTrackIndex(this.playerCar.x, this.playerCar.z);
      const trackP = this.trackData.samplePoints[closestIdx];
      const trackDataPoint = this.trackData.sampledData[closestIdx];

      const penetration = this.wasmBridge.checkBarrierCollision(
        this.playerCar,
        trackP.x,
        trackP.z,
        trackDataPoint.forward.x,
        trackDataPoint.forward.z,
        this.trackData.halfWidth
      );

      if (penetration > 0) {
        this.audio.playCollision(0.8);
        this.racingCamera.addShake(0.35);
        this.particles.emitSparks(
          this.playerCar.x,
          this.playerCar.y,
          this.playerCar.z,
          trackDataPoint.right.x,
          trackDataPoint.right.z,
          1.2
        );
      }

      // 3. Step AI Opponents
      const otherCarStates = [this.playerCar, ...this.aiCars.map((a) => a.carState)];
      for (let ai of this.aiCars) {
        if (this.isRacing) {
          ai.update(dt, this.selectedTrackConfig.waypoints, otherCarStates, this.wasmBridge);
        }

        // Barrier check for AI
        const aiIdx = this.findClosestTrackIndex(ai.carState.x, ai.carState.z);
        const aiP = this.trackData.samplePoints[aiIdx];
        const aiDataPoint = this.trackData.sampledData[aiIdx];
        this.wasmBridge.checkBarrierCollision(
          ai.carState,
          aiP.x,
          aiP.z,
          aiDataPoint.forward.x,
          aiDataPoint.forward.z,
          this.trackData.halfWidth
        );

        // Player to AI Collision Resolution
        const carOverlap = this.wasmBridge.resolveCarCollision(this.playerCar, ai.carState);
        if (carOverlap > 0) {
          this.audio.playCollision(1.0);
          this.racingCamera.addShake(0.45);
          this.particles.emitSparks(
            (this.playerCar.x + ai.carState.x) * 0.5,
            this.playerCar.y,
            (this.playerCar.z + ai.carState.z) * 0.5,
            0,
            0,
            1.5
          );
        }
      }

      // 4. Update Audio Engine
      const isNitro = this.playerCar.nitro > 0.5 && this.playerCar.nitroAmount > 1;
      const isDrifting = this.playerCar.isDrifting > 0.5;
      this.audio.updateEngine(
        this.playerCar.rpm,
        this.playerCar.throttle,
        this.playerCar.speedKmh,
        isNitro,
        isDrifting,
        this.playerCar.driftFactor
      );

      // 5. Update Particle Effects
      this.particles.emitTireSmoke(
        this.playerVisual,
        isDrifting,
        this.playerCar.driftFactor,
        this.playerCar.offRoad > 0.5
      );
      this.particles.emitNitroFlames(this.playerVisual, isNitro);
      this.particles.addSkidmark(this.playerVisual, isDrifting, inputState.brake > 0.5);
      this.particles.update(dt);

      // 6. Update Dynamic Camera
      this.racingCamera.update(this.playerVisual.group, this.playerCar, dt);

      // Dir light follows car for high-res shadows
      if (this.dirLight) {
        this.dirLight.position.set(this.playerCar.x + 80, 140, this.playerCar.z + 50);
        this.dirLight.target.position.set(this.playerCar.x, 0, this.playerCar.z);
        this.dirLight.target.updateMatrixWorld();
      }

      if (this.carFillLight) {
        this.carFillLight.position.set(this.playerCar.x, this.playerCar.y + 3.5, this.playerCar.z);
      }

      // 7. Update Race Logic & Positions
      this.updateRaceLogic(dt);

      // 8. Update HUD & Minimap
      const raceState = {
        currentLap: this.currentLap,
        totalLaps: this.totalLaps,
        position: this.currentPosition || 1,
        currentLapTime: this.currentLapTime,
        bestLapTime: this.bestLapTime,
        isWrongWay: this.playerCar.isWrongWay,
      };
      this.ui.updateHUD(this.playerCar, raceState);
      this.ui.drawMinimap(this.trackData.samplePoints, this.playerCar, this.aiCars);
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
}
