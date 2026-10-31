/**
 * Application Entry Point & Menu Event Wiring
 */

import { Game, GAME_MODES } from './game.js';
import { CAR_MODELS } from './car_builder.js';
import { TRACK_CONFIGS } from './tracks.js';

window.addEventListener('DOMContentLoaded', async () => {
  const game = new Game();
  await game.init();

  let selectedCarIdx = 0;
  let selectedTrackIdx = 0;
  let selectedMode = GAME_MODES.QUICK_RACE;

  // DOM elements
  const carNameEl = document.getElementById('car-display-name');
  const carDescEl = document.getElementById('car-display-desc');
  const statSpeedEl = document.getElementById('stat-speed');
  const statAccelEl = document.getElementById('stat-accel');
  const statHandlingEl = document.getElementById('stat-handling');
  const statDriftEl = document.getElementById('stat-drift');

  const trackNameEl = document.getElementById('track-display-name');
  const trackDescEl = document.getElementById('track-display-desc');
  const lapsSelect = document.getElementById('select-laps');
  const oppSelect = document.getElementById('select-opponents');

  const settingsModal = document.getElementById('settings-modal');
  const controlsModal = document.getElementById('controls-modal');

  // Update Car Selection UI
  const updateCarUI = () => {
    const car = CAR_MODELS[selectedCarIdx];
    carNameEl.textContent = `${car.name} (${car.type})`;
    carDescEl.textContent = car.description;

    statSpeedEl.style.width = `${Math.min((car.stats.topSpeed / 250) * 100, 100)}%`;
    statAccelEl.style.width = `${Math.min((car.stats.accel / 1.4) * 100, 100)}%`;
    statHandlingEl.style.width = `${Math.min((car.stats.handling / 1.3) * 100, 100)}%`;
    statDriftEl.style.width = `${Math.min((car.stats.drift / 1.4) * 100, 100)}%`;

    game.spawnPlayer(car);
  };

  // Update Track Selection UI
  const updateTrackUI = () => {
    const track = TRACK_CONFIGS[selectedTrackIdx];
    trackNameEl.textContent = track.name;
    trackDescEl.textContent = track.description;

    game.loadTrack(track);
    game.spawnPlayer(CAR_MODELS[selectedCarIdx]);
  };

  // Car Carousel buttons
  document.getElementById('btn-prev-car').addEventListener('click', () => {
    selectedCarIdx = (selectedCarIdx - 1 + CAR_MODELS.length) % CAR_MODELS.length;
    updateCarUI();
    game.audio.playClick();
  });

  document.getElementById('btn-next-car').addEventListener('click', () => {
    selectedCarIdx = (selectedCarIdx + 1) % CAR_MODELS.length;
    updateCarUI();
    game.audio.playClick();
  });

  // Track Carousel buttons
  document.getElementById('btn-prev-track').addEventListener('click', () => {
    selectedTrackIdx = (selectedTrackIdx - 1 + TRACK_CONFIGS.length) % TRACK_CONFIGS.length;
    updateTrackUI();
    game.audio.playClick();
  });

  document.getElementById('btn-next-track').addEventListener('click', () => {
    selectedTrackIdx = (selectedTrackIdx + 1) % TRACK_CONFIGS.length;
    updateTrackUI();
    game.audio.playClick();
  });

  // Game Mode Selection Tabs
  const modeTabs = document.querySelectorAll('.mode-tab');
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      modeTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      selectedMode = tab.dataset.mode;
      game.audio.playClick();
    });
  });

  // Start Race Button
  document.getElementById('btn-start-race').addEventListener('click', () => {
    game.totalLaps = parseInt(lapsSelect.value, 10) || 3;
    game.numAiOpponents = parseInt(oppSelect.value, 10) || 4;
    game.audio.playClick();
    game.startRace(selectedMode);
  });

  // Pause Menu Buttons
  document.getElementById('btn-resume-race').addEventListener('click', () => {
    game.togglePause();
  });

  document.getElementById('btn-restart-race').addEventListener('click', () => {
    game.togglePause();
    game.startRace(selectedMode);
  });

  document.getElementById('btn-pause-settings').addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  document.getElementById('btn-exit-to-menu').addEventListener('click', () => {
    game.isRacing = false;
    game.isPaused = false;
    game.audio.stopMusic();
    game.ui.showHUD(false);
    game.ui.showPauseMenu(false);
    game.ui.showMainMenu(true);
  });

  // Results Modal Buttons
  document.getElementById('btn-results-continue').addEventListener('click', () => {
    game.ui.showResults(false);
    if (selectedMode === GAME_MODES.CHAMPIONSHIP) {
      // Advance to next circuit in cup
      selectedTrackIdx = (selectedTrackIdx + 1) % TRACK_CONFIGS.length;
      updateTrackUI();
      game.startRace(selectedMode);
    } else {
      game.startRace(selectedMode);
    }
  });

  document.getElementById('btn-results-menu').addEventListener('click', () => {
    game.ui.showResults(false);
    game.ui.showHUD(false);
    game.ui.showMainMenu(true);
  });

  // Modals (Settings & How to Play)
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    settingsModal.style.display = 'flex';
    game.audio.playClick();
  });

  document.getElementById('btn-close-settings').addEventListener('click', () => {
    settingsModal.style.display = 'none';
    game.audio.playClick();
  });

  document.getElementById('btn-open-controls').addEventListener('click', () => {
    controlsModal.style.display = 'flex';
    game.audio.playClick();
  });

  document.getElementById('btn-close-controls').addEventListener('click', () => {
    controlsModal.style.display = 'none';
    game.audio.playClick();
  });

  // Volume Sliders
  const sfxSlider = document.getElementById('setting-sfx');
  const musicSlider = document.getElementById('setting-music');
  const updateVolumes = () => {
    game.audio.setVolume(parseFloat(sfxSlider.value), parseFloat(musicSlider.value));
  };
  sfxSlider.addEventListener('input', updateVolumes);
  musicSlider.addEventListener('input', updateVolumes);

  // Graphics Quality Preset
  document.getElementById('setting-graphics').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'low') {
      game.renderer.shadowMap.enabled = false;
      game.renderer.setPixelRatio(1.0);
    } else if (val === 'medium') {
      game.renderer.shadowMap.enabled = true;
      game.renderer.shadowMap.type = THREE.BasicShadowMap;
      game.renderer.setPixelRatio(1.0);
    } else if (val === 'high') {
      game.renderer.shadowMap.enabled = true;
      game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } else {
      // Ultra
      game.renderer.shadowMap.enabled = true;
      game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    }
  });

  // Tilt Steering
  const tiltCheckbox = document.getElementById('setting-tilt');
  tiltCheckbox.addEventListener('change', (e) => {
    game.input.enableTilt(e.target.checked);
  });

  document.getElementById('btn-calibrate-tilt').addEventListener('click', () => {
    game.input.calibrateTilt();
    alert('Tilt Steering calibrated to current orientation!');
  });

  // Hide mobile touch controls on non-touch desktop devices unless touch occurs
  const mobileControls = document.getElementById('mobile-controls');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice && window.innerWidth > 1024) {
    mobileControls.style.display = 'none';
  } else {
    mobileControls.style.display = 'flex';
  }

  // Initial UI state
  updateCarUI();
  updateTrackUI();
});
