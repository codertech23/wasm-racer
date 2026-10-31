/**
 * Dynamic Racing Camera System
 * Supports 4 distinct camera views:
 * - Chase Close (Default Arcade)
 * - Chase Far (Cinematic)
 * - Hood / Bumper View
 * - Cockpit / Interior View
 * Features speed FOV kick, drift swing, smooth spring damping, and impact camera shake.
 */

export const CAMERA_MODES = {
  CHASE_CLOSE: 0,
  CHASE_FAR: 1,
  HOOD: 2,
  COCKPIT: 3,
};

export class RacingCamera {
  constructor(camera) {
    this.camera = camera;
    this.mode = CAMERA_MODES.CHASE_CLOSE;

    this.baseFov = 64;
    this.targetFov = 64;

    this.currentPos = new THREE.Vector3(0, 5, -10);
    this.currentLookAt = new THREE.Vector3(0, 1, 0);

    // Spring Damper settings
    this.positionSmoothness = 12.0;
    this.lookSmoothness = 16.0;

    // Shake
    this.shakeIntensity = 0.0;
    this.shakeDecay = 4.0;
  }

  cycleMode() {
    this.mode = (this.mode + 1) % 4;
    const modeNames = ['Chase (Close)', 'Chase (Far)', 'Hood View', 'Cockpit View'];
    return modeNames[this.mode];
  }

  addShake(amount) {
    this.shakeIntensity = Math.min(this.shakeIntensity + amount, 1.2);
  }

  update(carMesh, carState, dt) {
    if (!carMesh || dt <= 0) return;

    const carPos = carMesh.position;
    const carYaw = carState.yaw;
    const speedKmh = carState.speedKmh || 0;
    const isNitro = carState.nitro > 0.5 && carState.nitroAmount > 0;
    const isDrifting = carState.isDrifting > 0.5;

    // 1. Dynamic Speed FOV Expansion
    const speedRatio = Math.min(speedKmh / 240, 1.0);
    let targetFov = this.baseFov + speedRatio * 15;
    if (isNitro) {
      targetFov += 12; // Warp speed FOV kick!
    }
    this.camera.fov += (targetFov - this.camera.fov) * 5.0 * dt;
    this.camera.updateProjectionMatrix();

    // 2. Camera Placement relative to car heading
    const forward = new THREE.Vector3(Math.sin(carYaw), 0, Math.cos(carYaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const up = new THREE.Vector3(0, 1, 0);

    let desiredPos = new THREE.Vector3();
    let desiredLookAt = new THREE.Vector3();

    if (this.mode === CAMERA_MODES.CHASE_CLOSE) {
      // Dynamic drift offset: camera swings slightly opposite to drift
      const driftOffset = isDrifting ? -carState.slipAngle * 1.5 : 0;
      desiredPos
        .copy(carPos)
        .addScaledVector(forward, -6.2)
        .addScaledVector(up, 2.2)
        .addScaledVector(right, driftOffset);

      desiredLookAt.copy(carPos).addScaledVector(forward, 8.0).addScaledVector(up, 1.2);
    } else if (this.mode === CAMERA_MODES.CHASE_FAR) {
      desiredPos
        .copy(carPos)
        .addScaledVector(forward, -9.5)
        .addScaledVector(up, 3.8);

      desiredLookAt.copy(carPos).addScaledVector(forward, 12.0).addScaledVector(up, 1.4);
    } else if (this.mode === CAMERA_MODES.HOOD) {
      desiredPos
        .copy(carPos)
        .addScaledVector(forward, 1.8)
        .addScaledVector(up, 0.95);

      desiredLookAt.copy(carPos).addScaledVector(forward, 25.0).addScaledVector(up, 0.85);
    } else {
      // Cockpit View
      desiredPos
        .copy(carPos)
        .addScaledVector(forward, 0.2)
        .addScaledVector(up, 1.05)
        .addScaledVector(right, -0.35); // driver seat left side

      desiredLookAt.copy(carPos).addScaledVector(forward, 20.0).addScaledVector(up, 1.0);
    }

    // 3. Smooth Camera Interpolation (lerp)
    const posLerpFactor = 1.0 - Math.exp(-this.positionSmoothness * dt);
    const lookLerpFactor = 1.0 - Math.exp(-this.lookSmoothness * dt);

    this.currentPos.lerp(desiredPos, posLerpFactor);
    this.currentLookAt.lerp(desiredLookAt, lookLerpFactor);

    // 4. Collision & High Speed Shake
    let shakeOffset = new THREE.Vector3(0, 0, 0);
    if (this.shakeIntensity > 0.01) {
      shakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity * 0.4,
        (Math.random() - 0.5) * this.shakeIntensity * 0.4,
        (Math.random() - 0.5) * this.shakeIntensity * 0.4
      );
      this.shakeIntensity = Math.max(this.shakeIntensity - this.shakeDecay * dt, 0.0);
    }

    // High speed engine vibration
    if (speedKmh > 160) {
      const vib = ((speedKmh - 160) / 100) * 0.02;
      shakeOffset.y += (Math.random() - 0.5) * vib;
    }

    this.camera.position.copy(this.currentPos).add(shakeOffset);
    this.camera.lookAt(this.currentLookAt);
  }
}
