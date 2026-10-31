/**
 * WebAssembly Bridge for high performance physics & AI calculations.
 * Features automatic detection, base64 fallback, and pure JS fallback.
 */

const CAR_DATA_SIZE = 32;

export const CAR_IDX = {
  X: 0,
  Y: 1,
  Z: 2,
  VX: 3,
  VY: 4,
  VZ: 5,
  YAW: 6,
  PITCH: 7,
  ROLL: 8,
  YAW_RATE: 9,
  STEER: 10,
  THROTTLE: 11,
  BRAKE: 12,
  HANDBRAKE: 13,
  NITRO: 14,
  SPEED_KMH: 15,
  RPM: 16,
  GEAR: 17,
  NITRO_AMOUNT: 18,
  DRIFT_FACTOR: 19,
  IS_DRIFTING: 20,
  TOP_SPEED: 21,
  ACCEL_STAT: 22,
  HANDLING_STAT: 23,
  DRIFT_STAT: 24,
  MASS: 25,
  WHEEL_ROTATION: 26,
  SLIP_ANGLE: 27,
  DRIFT_SCORE: 28,
  OFF_ROAD: 29,
  HEALTH: 30,
  AI_ID: 31,
};

export class WasmBridge {
  constructor() {
    this.isWasmReady = false;
    this.wasmInstance = null;
    this.memory = null;

    // Buffer pointers
    this.carBufferPtr = 0;
    this.waypointsPtr = 0;
    this.otherCarsPtr = 0;

    // Capacity
    this.maxCars = 16;
    this.maxWaypoints = 256;

    this.carFloats = new Float32Array(this.maxCars * CAR_DATA_SIZE);
    this.otherCarsFloats = new Float32Array(this.maxCars * 5);
  }

  async init() {
    try {
      let wasmBytes = null;

      // 1. Try fetching standalone .wasm file
      try {
        const response = await fetch('wasm/wasm_racer.wasm');
        if (response.ok) {
          wasmBytes = await response.arrayBuffer();
        }
      } catch (e) {
        // Fetch failed, probably file:// protocol or offline
      }

      // 2. Try embedded base64 string
      if (!wasmBytes && window.WASM_RACER_BASE64) {
        const binaryString = atob(window.WASM_RACER_BASE64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        wasmBytes = bytes.buffer;
      }

      if (wasmBytes) {
        const wasmModule = await WebAssembly.instantiate(wasmBytes, {});
        this.wasmInstance = wasmModule.instance;
        this.memory = this.wasmInstance.exports.memory;

        // Allocate memory offset in WASM linear memory
        // Starting after initial static segment (e.g. 64KB)
        this.carBufferPtr = 65536;
        this.waypointsPtr = this.carBufferPtr + this.maxCars * CAR_DATA_SIZE * 4;
        this.otherCarsPtr = this.waypointsPtr + this.maxWaypoints * 3 * 4;

        this.isWasmReady = true;
        console.log('⚡ WebAssembly physics engine initialized successfully!');
        return true;
      }
    } catch (err) {
      console.warn('WASM initialization failed, using high-speed JS physics fallback:', err);
    }

    this.isWasmReady = false;
    console.log('🏎️ High-performance JS physics engine active.');
    return false;
  }

  // Load waypoints into WASM buffer
  setWaypoints(waypointsArray) {
    this.cachedWaypoints = waypointsArray;
    if (!this.isWasmReady || !this.memory) return;

    const count = Math.min(waypointsArray.length, this.maxWaypoints);
    const wasmMemView = new Float32Array(this.memory.buffer, this.waypointsPtr, count * 3);
    for (let i = 0; i < count; i++) {
      wasmMemView[i * 3 + 0] = waypointsArray[i].x;
      wasmMemView[i * 3 + 1] = waypointsArray[i].z;
      wasmMemView[i * 3 + 2] = waypointsArray[i].maxSpeed || 150.0;
    }
  }

  stepCar(carState, dt, surfaceFriction = 1.0) {
    if (this.isWasmReady && this.wasmInstance && this.wasmInstance.exports.step_car_physics) {
      const offset = this.carBufferPtr;
      const memView = new Float32Array(this.memory.buffer, offset, CAR_DATA_SIZE);
      memView.set(carState.data);

      this.wasmInstance.exports.step_car_physics(offset, dt, surfaceFriction);

      carState.data.set(memView);
    } else {
      this.stepCarJs(carState.data, dt, surfaceFriction);
    }
  }

  stepAi(carState, waypoints, currentWpIdx, otherCars, dt, difficulty = 1.0) {
    if (this.isWasmReady && this.wasmInstance && this.wasmInstance.exports.step_ai_driver) {
      const carOffset = this.carBufferPtr + 1 * CAR_DATA_SIZE * 4;
      const carMem = new Float32Array(this.memory.buffer, carOffset, CAR_DATA_SIZE);
      carMem.set(carState.data);

      // Populate other cars
      const otherCount = Math.min(otherCars.length, 10);
      const otherMem = new Float32Array(this.memory.buffer, this.otherCarsPtr, otherCount * 5);
      for (let i = 0; i < otherCount; i++) {
        const c = otherCars[i].data;
        otherMem[i * 5 + 0] = c[CAR_IDX.X];
        otherMem[i * 5 + 1] = c[CAR_IDX.Z];
        otherMem[i * 5 + 2] = c[CAR_IDX.VX];
        otherMem[i * 5 + 3] = c[CAR_IDX.VZ];
        otherMem[i * 5 + 4] = c[CAR_IDX.YAW];
      }

      const newIdx = this.wasmInstance.exports.step_ai_driver(
        carOffset,
        this.waypointsPtr,
        waypoints.length,
        currentWpIdx,
        this.otherCarsPtr,
        otherCount,
        dt,
        difficulty
      );

      carState.data.set(carMem);
      return newIdx;
    } else {
      return this.stepAiJs(carState.data, waypoints, currentWpIdx, otherCars, dt, difficulty);
    }
  }

  resolveCarCollision(carA, carB) {
    if (this.isWasmReady && this.wasmInstance && this.wasmInstance.exports.resolve_cars_collision) {
      const ptrA = this.carBufferPtr + 2 * CAR_DATA_SIZE * 4;
      const ptrB = this.carBufferPtr + 3 * CAR_DATA_SIZE * 4;

      const memA = new Float32Array(this.memory.buffer, ptrA, CAR_DATA_SIZE);
      const memB = new Float32Array(this.memory.buffer, ptrB, CAR_DATA_SIZE);
      memA.set(carA.data);
      memB.set(carB.data);

      const overlap = this.wasmInstance.exports.resolve_cars_collision(ptrA, ptrB);
      if (overlap > 0) {
        carA.data.set(memA);
        carB.data.set(memB);
      }
      return overlap;
    } else {
      return this.resolveCarCollisionJs(carA.data, carB.data);
    }
  }

  checkBarrierCollision(carState, trackCx, trackCz, trackDx, trackDz, trackHalfWidth) {
    if (this.isWasmReady && this.wasmInstance && this.wasmInstance.exports.check_barrier) {
      const ptr = this.carBufferPtr + 4 * CAR_DATA_SIZE * 4;
      const mem = new Float32Array(this.memory.buffer, ptr, CAR_DATA_SIZE);
      mem.set(carState.data);

      const pen = this.wasmInstance.exports.check_barrier(ptr, trackCx, trackCz, trackDx, trackDz, trackHalfWidth);
      carState.data.set(mem);
      return pen;
    } else {
      return this.checkBarrierCollisionJs(carState.data, trackCx, trackCz, trackDx, trackDz, trackHalfWidth);
    }
  }

  /* ================= JavaScript Physics Fallback ================= */

  wrapAngle(a) {
    while (a > Math.PI) a -= 2.0 * Math.PI;
    while (a < -Math.PI) a += 2.0 * Math.PI;
    return a;
  }

  clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  stepCarJs(car, dt, surfaceFriction) {
    if (dt <= 0) return;

    const topSpeedKmh = Math.max(car[CAR_IDX.TOP_SPEED], 120.0);
    const topSpeedMs = topSpeedKmh / 3.6;
    const accelStat = this.clamp(car[CAR_IDX.ACCEL_STAT], 0.5, 2.0);
    const handlingStat = this.clamp(car[CAR_IDX.HANDLING_STAT], 0.5, 2.0);
    const driftStat = this.clamp(car[CAR_IDX.DRIFT_STAT], 0.5, 2.0);
    const mass = this.clamp(car[CAR_IDX.MASS], 800.0, 2200.0);

    const throttle = this.clamp(car[CAR_IDX.THROTTLE], 0.0, 1.0);
    const brake = this.clamp(car[CAR_IDX.BRAKE], 0.0, 1.0);
    const handbrake = this.clamp(car[CAR_IDX.HANDBRAKE], 0.0, 1.0);
    const nitroPressed = car[CAR_IDX.NITRO] > 0.5;

    let nitroAmount = car[CAR_IDX.NITRO_AMOUNT];
    let nitroActive = false;
    let nitroBoost = 1.0;

    if (nitroPressed && nitroAmount > 0.5 && throttle > 0.1) {
      nitroActive = true;
      nitroBoost = 1.65;
      nitroAmount -= dt * 25.0;
      if (nitroAmount < 0) nitroAmount = 0;
    } else {
      nitroAmount = Math.min(nitroAmount + dt * 4.0, 100.0);
    }
    car[CAR_IDX.NITRO_AMOUNT] = nitroAmount;

    const yaw = car[CAR_IDX.YAW];
    const vx = car[CAR_IDX.VX];
    const vz = car[CAR_IDX.VZ];

    const forwardX = Math.sin(yaw);
    const forwardZ = Math.cos(yaw);
    const rightX = forwardZ;
    const rightZ = -forwardX;

    const vForward = vx * forwardX + vz * forwardZ;
    const vLateral = vx * rightX + vz * rightZ;
    const speedMs = Math.hypot(vx, vz);
    const speedKmh = speedMs * 3.6;
    car[CAR_IDX.SPEED_KMH] = speedKmh;

    const isOffroad = car[CAR_IDX.OFF_ROAD] > 0.5;
    const groundFriction = isOffroad ? surfaceFriction * 0.45 : surfaceFriction;

    const maxEngineForce = mass * 7.5 * accelStat * nitroBoost;
    let driveForce = 0;

    if (throttle > 0) {
      const speedRatio = this.clamp(speedMs / (topSpeedMs * (nitroActive ? 1.3 : 1.0)), 0, 1.1);
      const torqueMult = Math.max(1.0 - speedRatio * 0.85, 0.05);
      driveForce = throttle * maxEngineForce * torqueMult;
    } else if (brake > 0 && vForward < 0.5) {
      const reverseMaxSpeed = 15.0;
      if (vForward > -reverseMaxSpeed) {
        driveForce = -brake * maxEngineForce * 0.4;
      }
    }

    let brakeForce = 0;
    if (brake > 0 && vForward > 0.1) {
      brakeForce = -brake * mass * 14.0;
    }

    const aeroDrag = 0.5 * 1.225 * 0.32 * 2.1 * vForward * Math.abs(vForward);
    const rollingResistance = mass * 9.81 * (isOffroad ? 0.15 : 0.015) * Math.sign(vForward);

    const netForwardForce = driveForce + brakeForce - aeroDrag - rollingResistance;
    const accelForward = (netForwardForce / mass) * groundFriction;

    const steerInput = this.clamp(car[CAR_IDX.STEER], -1.0, 1.0);
    const speedSteerFactor = 1.0 / (1.0 + Math.pow(speedMs / 25.0, 2) * 0.5);
    const maxSteerAngle = 0.58 * speedSteerFactor * handlingStat;
    const targetSteerAngle = steerInput * maxSteerAngle;

    const slipAngle = speedMs > 1.5 ? Math.atan(vLateral / Math.max(speedMs, 0.1)) : 0;
    car[CAR_IDX.SLIP_ANGLE] = slipAngle;

    const isHandbraking = handbrake > 0.2;
    let driftFactor = car[CAR_IDX.DRIFT_FACTOR];

    if (isHandbraking && speedMs > 6.0) {
      driftFactor = Math.min(driftFactor + dt * 4.5 * driftStat, 1.0);
    } else if (Math.abs(slipAngle) > 0.35 && speedMs > 10.0) {
      driftFactor = Math.min(driftFactor + dt * 2.5, 1.0);
    } else {
      driftFactor = Math.max(driftFactor - dt * 2.8, 0.0);
    }
    car[CAR_IDX.DRIFT_FACTOR] = driftFactor;

    const isDrifting = driftFactor > 0.35 && speedMs > 8.0;
    car[CAR_IDX.IS_DRIFTING] = isDrifting ? 1.0 : 0.0;

    if (isDrifting) {
      const scoreGain = speedKmh * driftFactor * dt * 40.0;
      car[CAR_IDX.DRIFT_SCORE] += scoreGain;
      car[CAR_IDX.NITRO_AMOUNT] = Math.min(car[CAR_IDX.NITRO_AMOUNT] + dt * 8.0, 100.0);
    }

    const baseLateralGrip = 1.15 * groundFriction;
    const effectiveGrip = baseLateralGrip * (1.0 - driftFactor * 0.65);
    const corneringForce = -slipAngle * mass * 9.81 * effectiveGrip;
    const accelLateral = corneringForce / mass;

    const wheelbase = 2.65;
    const ackermannYawRate = (vForward / wheelbase) * Math.tan(targetSteerAngle);
    const driftOversteerTorque = isDrifting
      ? -steerInput * 1.8 * driftStat + (vLateral / Math.max(speedMs, 1.0)) * 2.2
      : 0;

    const targetYawRate = ackermannYawRate + driftOversteerTorque;
    const yawDamping = isDrifting ? 3.5 : 8.0;
    let yawRate = car[CAR_IDX.YAW_RATE];
    yawRate += (targetYawRate - yawRate) * yawDamping * dt;
    car[CAR_IDX.YAW_RATE] = yawRate;

    const newYaw = this.wrapAngle(yaw + yawRate * dt);
    car[CAR_IDX.YAW] = newYaw;

    const newVForward = vForward + accelForward * dt;
    const newVLateral = vLateral + accelLateral * dt;

    const newVx = newVForward * forwardX + newVLateral * rightX;
    const newVz = newVForward * forwardZ + newVLateral * rightZ;

    car[CAR_IDX.VX] = newVx;
    car[CAR_IDX.VZ] = newVz;

    car[CAR_IDX.X] += newVx * dt;
    car[CAR_IDX.Z] += newVz * dt;

    const wheelRadius = 0.34;
    const angularDist = (newVForward / wheelRadius) * dt;
    car[CAR_IDX.WHEEL_ROTATION] = (car[CAR_IDX.WHEEL_ROTATION] + angularDist) % (2.0 * Math.PI);

    const lateralG = accelLateral / 9.81;
    const longitudinalG = accelForward / 9.81;
    const targetRoll = this.clamp(-lateralG * 0.08, -0.14, 0.14);
    const targetPitch = this.clamp(longitudinalG * 0.05, -0.09, 0.09);

    car[CAR_IDX.ROLL] += (targetRoll - car[CAR_IDX.ROLL]) * 10.0 * dt;
    car[CAR_IDX.PITCH] += (targetPitch - car[CAR_IDX.PITCH]) * 10.0 * dt;

    const gearRatios = [3.5, 2.3, 1.65, 1.25, 0.98, 0.78];
    const numGears = gearRatios.length;
    const currentGear = this.clamp(Math.round(car[CAR_IDX.GEAR] || 1), 1, numGears);

    const idleRpm = 950.0;
    const maxRpm = 8200.0;
    const shiftUpRpm = 7200.0;
    const shiftDownRpm = 3400.0;

    const wheelRpm = (speedMs / (2.0 * Math.PI * wheelRadius)) * 60.0;
    const finalDrive = 3.73;
    let calculatedRpm = idleRpm + wheelRpm * gearRatios[currentGear - 1] * finalDrive * 0.55;

    if (throttle > 0.1) calculatedRpm += throttle * 1200.0;

    let newGear = currentGear;
    if (calculatedRpm > shiftUpRpm && newGear < numGears) {
      newGear++;
    } else if (calculatedRpm < shiftDownRpm && newGear > 1) {
      newGear--;
    }
    car[CAR_IDX.GEAR] = newGear;

    const targetRpm = this.clamp(calculatedRpm, idleRpm, maxRpm);
    let currentRpm = car[CAR_IDX.RPM] || idleRpm;
    currentRpm += (targetRpm - currentRpm) * 12.0 * dt;
    car[CAR_IDX.RPM] = currentRpm;
  }

  stepAiJs(car, waypoints, currentWpIdx, otherCars, dt, difficulty) {
    if (!waypoints || waypoints.length === 0 || dt <= 0) return currentWpIdx;

    const numWp = waypoints.length;
    const carX = car[CAR_IDX.X];
    const carZ = car[CAR_IDX.Z];
    const carYaw = car[CAR_IDX.YAW];
    const carSpeedKmh = car[CAR_IDX.SPEED_KMH];
    const carSpeedMs = carSpeedKmh / 3.6;

    let targetIdx = currentWpIdx;
    for (let c = 0; c < 4; c++) {
      const wp = waypoints[targetIdx];
      const dx = wp.x - carX;
      const dz = wp.z - carZ;
      const distSq = dx * dx + dz * dz;

      const threshold = Math.pow(14.0 + carSpeedMs * 0.4, 2);
      if (distSq < threshold) {
        targetIdx = (targetIdx + 1) % numWp;
      } else {
        break;
      }
    }

    const lookaheadSteps = this.clamp(Math.floor(carSpeedMs / 12.0), 1, 4);
    const lookIdx = (targetIdx + lookaheadSteps) % numWp;
    const targetWp = waypoints[lookIdx];
    const recommendedSpeed = (targetWp.maxSpeed || 150.0) * difficulty;

    let steerOffset = 0;
    const fwdX = Math.sin(carYaw);
    const fwdZ = Math.cos(carYaw);
    const rightX = fwdZ;
    const rightZ = -fwdX;

    for (let i = 0; i < otherCars.length; i++) {
      const oc = otherCars[i].data;
      const toOtherX = oc[CAR_IDX.X] - carX;
      const toOtherZ = oc[CAR_IDX.Z] - carZ;
      const dist = Math.hypot(toOtherX, toOtherZ);

      if (dist > 0.5 && dist < 28.0) {
        const dotFwd = toOtherX * fwdX + toOtherZ * fwdZ;
        const dotLat = toOtherX * rightX + toOtherZ * rightZ;

        if (dotFwd > 1.0 && dotFwd < 24.0 && Math.abs(dotLat) < 4.2) {
          if (dotLat >= 0) {
            steerOffset -= Math.max(4.5 - dotLat, 1.0) / (dist * 0.35);
          } else {
            steerOffset += Math.max(4.5 + dotLat, 1.0) / (dist * 0.35);
          }
        }
      }
    }

    const toWpX = targetWp.x - carX;
    const toWpZ = targetWp.z - carZ;
    const desiredAngle = Math.atan2(toWpX, toWpZ);
    const angleDiff = this.wrapAngle(desiredAngle - carYaw);
    let steer = this.clamp(angleDiff * 1.8 + steerOffset * 0.3, -1.0, 1.0);

    let throttle = 0;
    let brake = 0;
    let handbrake = 0;
    let nitro = 0;

    const targetSpeedMs = Math.max(recommendedSpeed / 3.6, 8.0);

    if (carSpeedMs < targetSpeedMs) {
      const speedDeficit = targetSpeedMs - carSpeedMs;
      throttle = this.clamp(speedDeficit / 8.0, 0.4, 1.0);
      if (Math.abs(angleDiff) > 0.45) throttle *= 0.6;
      if (Math.abs(angleDiff) < 0.15 && carSpeedKmh > 90.0 && car[CAR_IDX.NITRO_AMOUNT] > 30.0) {
        nitro = 1.0;
      }
    } else {
      const overspeed = carSpeedMs - targetSpeedMs;
      if (overspeed > 2.0) brake = this.clamp(overspeed / 7.0, 0.3, 1.0);
      throttle = 0.1;
      if (Math.abs(angleDiff) > 0.7 && carSpeedKmh > 65.0) {
        handbrake = 0.85;
        steer = Math.sign(steer);
      }
    }

    car[CAR_IDX.STEER] = steer;
    car[CAR_IDX.THROTTLE] = throttle;
    car[CAR_IDX.BRAKE] = brake;
    car[CAR_IDX.HANDBRAKE] = handbrake;
    car[CAR_IDX.NITRO] = nitro;

    return targetIdx;
  }

  resolveCarCollisionJs(carA, carB) {
    const dx = carB[CAR_IDX.X] - carA[CAR_IDX.X];
    const dz = carB[CAR_IDX.Z] - carA[CAR_IDX.Z];
    const distSq = dx * dx + dz * dz;
    const minDist = 3.2;

    if (distSq >= minDist * minDist || distSq < 0.0001) return 0;

    const dist = Math.sqrt(distSq);
    const overlap = minDist - dist;
    const nx = dx / dist;
    const nz = dz / dist;

    const massA = Math.max(carA[CAR_IDX.MASS], 800.0);
    const massB = Math.max(carB[CAR_IDX.MASS], 800.0);
    const totalMass = massA + massB;

    carA[CAR_IDX.X] -= nx * overlap * (massB / totalMass);
    carA[CAR_IDX.Z] -= nz * overlap * (massB / totalMass);
    carB[CAR_IDX.X] += nx * overlap * (massA / totalMass);
    carB[CAR_IDX.Z] += nz * overlap * (massA / totalMass);

    const relVx = carB[CAR_IDX.VX] - carA[CAR_IDX.VX];
    const relVz = carB[CAR_IDX.VZ] - carA[CAR_IDX.VZ];
    const velAlongNormal = relVx * nx + relVz * nz;

    if (velAlongNormal > 0) return overlap;

    const restitution = 0.45;
    const impulseMag = (-(1.0 + restitution) * velAlongNormal) / (1.0 / massA + 1.0 / massB);
    const impulseX = impulseMag * nx;
    const impulseZ = impulseMag * nz;

    carA[CAR_IDX.VX] -= impulseX / massA;
    carA[CAR_IDX.VZ] -= impulseZ / massA;
    carB[CAR_IDX.VX] += impulseX / massB;
    carB[CAR_IDX.VZ] += impulseZ / massB;

    const tangentX = -nz;
    const tangentZ = nx;
    const sideStrikeA = relVx * tangentX + relVz * tangentZ;
    carA[CAR_IDX.YAW_RATE] += sideStrikeA * 0.08;
    carB[CAR_IDX.YAW_RATE] -= sideStrikeA * 0.08;

    return overlap;
  }

  checkBarrierCollisionJs(car, trackCx, trackCz, trackDx, trackDz, trackHalfWidth) {
    const toCarX = car[CAR_IDX.X] - trackCx;
    const toCarZ = car[CAR_IDX.Z] - trackCz;

    const normalX = -trackDz;
    const normalZ = trackDx;

    const lateralDist = toCarX * normalX + toCarZ * normalZ;
    const absDist = Math.abs(lateralDist);

    if (absDist > trackHalfWidth) {
      const penetration = absDist - trackHalfWidth;
      const side = Math.sign(lateralDist);

      car[CAR_IDX.X] -= normalX * side * (penetration + 0.15);
      car[CAR_IDX.Z] -= normalZ * side * (penetration + 0.15);

      const vn = car[CAR_IDX.VX] * (normalX * side) + car[CAR_IDX.VZ] * (normalZ * side);
      if (vn > 0) {
        const bounce = 0.35;
        car[CAR_IDX.VX] -= (1.0 + bounce) * vn * (normalX * side);
        car[CAR_IDX.VZ] -= (1.0 + bounce) * vn * (normalZ * side);
        car[CAR_IDX.VX] *= 0.88;
        car[CAR_IDX.VZ] *= 0.88;
        car[CAR_IDX.YAW_RATE] *= 0.5;
      }

      car[CAR_IDX.OFF_ROAD] = 1.0;
      return penetration;
    } else if (absDist > trackHalfWidth * 0.85) {
      car[CAR_IDX.OFF_ROAD] = 0.5;
      return 0.0;
    } else {
      car[CAR_IDX.OFF_ROAD] = 0.0;
      return 0.0;
    }
  }
}
