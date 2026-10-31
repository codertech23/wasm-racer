/**
 * AI Opponent Car Management
 * Controls autonomous racing cars with realistic line-following, drafting,
 * overtaking, corner braking, and drift behavior.
 */

import { CarBuilder, CAR_MODELS } from './car_builder.js';
import { CarState } from './physics.js';

export const AI_NAMES = [
  'Viper Strike',
  'Phantom Drift',
  'Cyber Shadow',
  'Hyper Nova',
  'Titan Racer',
  'Ghost Rider',
  'Zenith Pro',
];

export class AICar {
  constructor(id, name, config, scene, trackData, startLane = 0, startZOffset = 0) {
    this.id = id;
    this.name = name;
    this.config = config;
    this.trackData = trackData;
    this.difficulty = 0.92 + Math.random() * 0.16;

    // Create 3D Visual Mesh
    this.carVisual = CarBuilder.createCar(config, false);
    scene.add(this.carVisual.group);

    // Physics State
    this.carState = new CarState(config);

    // Spawn on grid
    this.resetGridPosition(startLane, startZOffset);
  }

  resetGridPosition(laneOffset, zOffset) {
    const data0 = this.trackData.sampledData[0];
    const startP = this.trackData.samplePoints[0];

    const pos = new THREE.Vector3()
      .copy(startP)
      .addScaledVector(data0.right, laneOffset)
      .addScaledVector(data0.forward, zOffset);

    this.carState.x = pos.x;
    this.carState.y = pos.y;
    this.carState.z = pos.z;

    this.carState.vx = 0;
    this.carState.vy = 0;
    this.carState.vz = 0;

    const startYaw = Math.atan2(data0.forward.x, data0.forward.z);
    this.carState.yaw = startYaw;
    this.carState.pitch = 0;
    this.carState.roll = 0;

    this.carState.steer = 0;
    this.carState.throttle = 0;
    this.carState.brake = 0;
    this.carState.handbrake = 0;
    this.carState.speedKmh = 0;
    this.carState.rpm = 950;
    this.carState.gear = 1;
    this.carState.lap = 1;
    this.carState.currentWaypointIdx = 0;

    this.carState.syncMesh(this.carVisual.group);
  }

  update(dt, waypoints, otherCars, wasmBridge) {
    // 1. AI Decision Making via WASM / JS Bridge
    this.carState.currentWaypointIdx = wasmBridge.stepAi(
      this.carState,
      waypoints,
      this.carState.currentWaypointIdx,
      otherCars,
      dt,
      this.difficulty
    );

    // 2. Physics Step
    wasmBridge.stepCar(this.carState, dt, 1.0);

    // 3. Sync 3D Mesh & Visuals
    this.carState.syncMesh(this.carVisual.group);
    CarBuilder.updateCarVisuals(this.carVisual, this.carState, this.carState.brake > 0.3);
  }

  destroy(scene) {
    if (this.carVisual && this.carVisual.group) {
      scene.remove(this.carVisual.group);
    }
  }
}
