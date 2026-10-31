/**
 * Vehicle State and Physics Management
 * Bridges Three.js 3D models with the high-performance WASM / JS physics engine.
 */

import { CAR_IDX } from './wasm_bridge.js';

export class CarState {
  constructor(config = {}) {
    this.data = new Float32Array(32);

    // Initial stats from car config
    this.topSpeed = config.stats ? config.stats.topSpeed : 220;
    this.accelStat = config.stats ? config.stats.accel : 1.0;
    this.handlingStat = config.stats ? config.stats.handling : 1.0;
    this.driftStat = config.stats ? config.stats.drift : 1.0;
    this.mass = config.stats ? config.stats.mass : 1400;

    this.nitroAmount = 100.0;
    this.gear = 1;
    this.rpm = 950;
    this.health = 100;

    // Track progression
    this.currentWaypointIdx = 0;
    this.lap = 1;
    this.distanceAlongTrack = 0;
    this.totalRaceProgress = 0;
    this.lastCheckpointIdx = -1;
    this.isWrongWay = false;
  }

  // Getters & Setters
  get x() {
    return this.data[CAR_IDX.X];
  }
  set x(v) {
    this.data[CAR_IDX.X] = v;
  }

  get y() {
    return this.data[CAR_IDX.Y];
  }
  set y(v) {
    this.data[CAR_IDX.Y] = v;
  }

  get z() {
    return this.data[CAR_IDX.Z];
  }
  set z(v) {
    this.data[CAR_IDX.Z] = v;
  }

  get vx() {
    return this.data[CAR_IDX.VX];
  }
  set vx(v) {
    this.data[CAR_IDX.VX] = v;
  }

  get vy() {
    return this.data[CAR_IDX.VY];
  }
  set vy(v) {
    this.data[CAR_IDX.VY] = v;
  }

  get vz() {
    return this.data[CAR_IDX.VZ];
  }
  set vz(v) {
    this.data[CAR_IDX.VZ] = v;
  }

  get yaw() {
    return this.data[CAR_IDX.YAW];
  }
  set yaw(v) {
    this.data[CAR_IDX.YAW] = v;
  }

  get pitch() {
    return this.data[CAR_IDX.PITCH];
  }
  set pitch(v) {
    this.data[CAR_IDX.PITCH] = v;
  }

  get roll() {
    return this.data[CAR_IDX.ROLL];
  }
  set roll(v) {
    this.data[CAR_IDX.ROLL] = v;
  }

  get steer() {
    return this.data[CAR_IDX.STEER];
  }
  set steer(v) {
    this.data[CAR_IDX.STEER] = v;
  }

  get throttle() {
    return this.data[CAR_IDX.THROTTLE];
  }
  set throttle(v) {
    this.data[CAR_IDX.THROTTLE] = v;
  }

  get brake() {
    return this.data[CAR_IDX.BRAKE];
  }
  set brake(v) {
    this.data[CAR_IDX.BRAKE] = v;
  }

  get handbrake() {
    return this.data[CAR_IDX.HANDBRAKE];
  }
  set handbrake(v) {
    this.data[CAR_IDX.HANDBRAKE] = v;
  }

  get nitro() {
    return this.data[CAR_IDX.NITRO];
  }
  set nitro(v) {
    this.data[CAR_IDX.NITRO] = v;
  }

  get speedKmh() {
    return this.data[CAR_IDX.SPEED_KMH];
  }
  set speedKmh(v) {
    this.data[CAR_IDX.SPEED_KMH] = v;
  }

  get rpm() {
    return this.data[CAR_IDX.RPM];
  }
  set rpm(v) {
    this.data[CAR_IDX.RPM] = v;
  }

  get gear() {
    return this.data[CAR_IDX.GEAR];
  }
  set gear(v) {
    this.data[CAR_IDX.GEAR] = v;
  }

  get nitroAmount() {
    return this.data[CAR_IDX.NITRO_AMOUNT];
  }
  set nitroAmount(v) {
    this.data[CAR_IDX.NITRO_AMOUNT] = v;
  }

  get driftFactor() {
    return this.data[CAR_IDX.DRIFT_FACTOR];
  }
  set driftFactor(v) {
    this.data[CAR_IDX.DRIFT_FACTOR] = v;
  }

  get isDrifting() {
    return this.data[CAR_IDX.IS_DRIFTING];
  }
  set isDrifting(v) {
    this.data[CAR_IDX.IS_DRIFTING] = v;
  }

  get topSpeed() {
    return this.data[CAR_IDX.TOP_SPEED];
  }
  set topSpeed(v) {
    this.data[CAR_IDX.TOP_SPEED] = v;
  }

  get accelStat() {
    return this.data[CAR_IDX.ACCEL_STAT];
  }
  set accelStat(v) {
    this.data[CAR_IDX.ACCEL_STAT] = v;
  }

  get handlingStat() {
    return this.data[CAR_IDX.HANDLING_STAT];
  }
  set handlingStat(v) {
    this.data[CAR_IDX.HANDLING_STAT] = v;
  }

  get driftStat() {
    return this.data[CAR_IDX.DRIFT_STAT];
  }
  set driftStat(v) {
    this.data[CAR_IDX.DRIFT_STAT] = v;
  }

  get mass() {
    return this.data[CAR_IDX.MASS];
  }
  set mass(v) {
    this.data[CAR_IDX.MASS] = v;
  }

  get wheelRotation() {
    return this.data[CAR_IDX.WHEEL_ROTATION];
  }
  set wheelRotation(v) {
    this.data[CAR_IDX.WHEEL_ROTATION] = v;
  }

  get slipAngle() {
    return this.data[CAR_IDX.SLIP_ANGLE];
  }
  set slipAngle(v) {
    this.data[CAR_IDX.SLIP_ANGLE] = v;
  }

  get driftScore() {
    return this.data[CAR_IDX.DRIFT_SCORE];
  }
  set driftScore(v) {
    this.data[CAR_IDX.DRIFT_SCORE] = v;
  }

  get offRoad() {
    return this.data[CAR_IDX.OFF_ROAD];
  }
  set offRoad(v) {
    this.data[CAR_IDX.OFF_ROAD] = v;
  }

  get health() {
    return this.data[CAR_IDX.HEALTH];
  }
  set health(v) {
    this.data[CAR_IDX.HEALTH] = v;
  }

  respawn(trackData, laneOffset = 0) {
    const startP = trackData.samplePoints[0];
    const data = trackData.sampledData[0];

    const offsetPos = new THREE.Vector3().copy(startP).addScaledVector(data.right, laneOffset);

    this.x = offsetPos.x;
    this.y = offsetPos.y;
    this.z = offsetPos.z;

    this.vx = 0;
    this.vy = 0;
    this.vz = 0;

    const startYaw = Math.atan2(data.forward.x, data.forward.z);
    this.yaw = startYaw;
    this.pitch = 0;
    this.roll = 0;

    this.steer = 0;
    this.throttle = 0;
    this.brake = 0;
    this.handbrake = 0;
    this.nitro = 0;
    this.speedKmh = 0;
    this.rpm = 950;
    this.gear = 1;
    this.driftFactor = 0;
    this.isDrifting = 0;
  }

  syncMesh(group) {
    group.position.set(this.x, this.y, this.z);
    // Combine yaw heading, pitch dive/squat, and roll lean
    group.rotation.set(0, this.yaw, 0, 'YXZ');
    group.rotateX(this.pitch);
    group.rotateZ(this.roll);
  }
}
