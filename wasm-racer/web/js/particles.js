/**
 * Particle Effects & Skidmark System
 * Handles tire smoke, nitro exhaust flame jets, collision sparks, off-road dust,
 * and tire skidmarks on the road.
 */

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    this.maxParticles = 800;
    this.particlePositions = new Float32Array(this.maxParticles * 3);
    this.particleColors = new Float32Array(this.maxParticles * 3);
    this.particleSizes = new Float32Array(this.maxParticles);
    this.particleLifetimes = new Float32Array(this.maxParticles);
    this.particleVelocities = new Float32Array(this.maxParticles * 3);

    this.activeCount = 0;
    this.nextIndex = 0;

    // Create Particle Points Geometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1));

    // Particle Texture via Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1.0)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    grad.addColorStop(0.8, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTex = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 2.2,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    // Dynamic Skidmarks Mesh
    this.initSkidmarks();

    // Nitro Flame Meshes
    this.flameMeshes = [];
  }

  initSkidmarks() {
    this.maxSkidSegments = 600;
    this.skidPositions = new Float32Array(this.maxSkidSegments * 6); // 2 triangles per segment
    this.skidAlphas = new Float32Array(this.maxSkidSegments * 2);
    this.skidIdx = 0;

    this.skidGeo = new THREE.BufferGeometry();
    this.skidGeo.setAttribute('position', new THREE.BufferAttribute(this.skidPositions, 3));

    this.skidMat = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.skidMesh = new THREE.Mesh(this.skidGeo, this.skidMat);
    this.skidMesh.position.y = 0.08; // slightly above road
    this.scene.add(this.skidMesh);

    this.lastSkidLeft = null;
    this.lastSkidRight = null;
  }

  spawnParticle(x, y, z, vx, vy, vz, r, g, b, size, lifetime) {
    const idx = this.nextIndex;
    this.nextIndex = (this.nextIndex + 1) % this.maxParticles;
    if (this.activeCount < this.maxParticles) {
      this.activeCount++;
    }

    this.particlePositions[idx * 3 + 0] = x;
    this.particlePositions[idx * 3 + 1] = y;
    this.particlePositions[idx * 3 + 2] = z;

    this.particleVelocities[idx * 3 + 0] = vx;
    this.particleVelocities[idx * 3 + 1] = vy;
    this.particleVelocities[idx * 3 + 2] = vz;

    this.particleColors[idx * 3 + 0] = r;
    this.particleColors[idx * 3 + 1] = g;
    this.particleColors[idx * 3 + 2] = b;

    this.particleSizes[idx] = size;
    this.particleLifetimes[idx] = lifetime;
  }

  emitTireSmoke(carObj, isDrifting, driftFactor, isOffroad) {
    if (!isDrifting && !isOffroad) return;

    const car = carObj.group;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(car.quaternion);

    // Left and right rear tire world positions
    const rearLeftPos = new THREE.Vector3().copy(car.position).addScaledVector(right, -0.96).addScaledVector(forward, -1.35);
    const rearRightPos = new THREE.Vector3().copy(car.position).addScaledVector(right, 0.96).addScaledVector(forward, -1.35);

    const r = isOffroad ? 0.65 : 0.88;
    const g = isOffroad ? 0.52 : 0.88;
    const b = isOffroad ? 0.38 : 0.92;

    const count = isDrifting ? Math.min(Math.ceil(driftFactor * 3), 4) : 2;

    for (let c = 0; c < count; c++) {
      // Left tire smoke
      this.spawnParticle(
        rearLeftPos.x + (Math.random() - 0.5) * 0.3,
        0.2 + Math.random() * 0.2,
        rearLeftPos.z + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 1.5,
        0.8 + Math.random() * 1.2,
        (Math.random() - 0.5) * 1.5,
        r,
        g,
        b,
        2.5 + Math.random() * 2.0,
        0.8 + Math.random() * 0.6
      );

      // Right tire smoke
      this.spawnParticle(
        rearRightPos.x + (Math.random() - 0.5) * 0.3,
        0.2 + Math.random() * 0.2,
        rearRightPos.z + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 1.5,
        0.8 + Math.random() * 1.2,
        (Math.random() - 0.5) * 1.5,
        r,
        g,
        b,
        2.5 + Math.random() * 2.0,
        0.8 + Math.random() * 0.6
      );
    }
  }

  emitNitroFlames(carObj, isNitroActive) {
    if (!isNitroActive) return;

    const car = carObj.group;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(car.quaternion);

    const exhaustOffsets = [-0.45, 0.45];
    for (let i = 0; i < 2; i++) {
      const pos = new THREE.Vector3()
        .copy(car.position)
        .addScaledVector(right, exhaustOffsets[i])
        .addScaledVector(forward, -2.15);

      // Flame exhaust jet particles
      for (let f = 0; f < 3; f++) {
        const velBack = forward.clone().multiplyScalar(-18 - Math.random() * 8);
        this.spawnParticle(
          pos.x + (Math.random() - 0.5) * 0.12,
          pos.y + 0.25 + (Math.random() - 0.5) * 0.1,
          pos.z + (Math.random() - 0.5) * 0.12,
          velBack.x + (Math.random() - 0.5) * 2,
          velBack.y + (Math.random() - 0.5) * 1,
          velBack.z + (Math.random() - 0.5) * 2,
          0.1, // blue / cyan core
          0.7 + Math.random() * 0.3,
          1.0,
          1.8 + Math.random() * 1.4,
          0.22
        );
      }
    }
  }

  emitSparks(x, y, z, normalX, normalZ, intensity = 1.0) {
    const sparkCount = Math.floor(10 * intensity);
    for (let i = 0; i < sparkCount; i++) {
      const vx = normalX * 6.0 + (Math.random() - 0.5) * 8.0;
      const vy = 3.0 + Math.random() * 6.0;
      const vz = normalZ * 6.0 + (Math.random() - 0.5) * 8.0;

      this.spawnParticle(x, y + 0.3, z, vx, vy, vz, 1.0, 0.85, 0.15, 1.2, 0.45 + Math.random() * 0.3);
    }
  }

  addSkidmark(carObj, isDrifting, isBraking) {
    if (!isDrifting && !isBraking) {
      this.lastSkidLeft = null;
      this.lastSkidRight = null;
      return;
    }

    const car = carObj.group;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(car.quaternion);

    const curLeft = new THREE.Vector3().copy(car.position).addScaledVector(right, -0.96).addScaledVector(forward, -1.35);
    const curRight = new THREE.Vector3().copy(car.position).addScaledVector(right, 0.96).addScaledVector(forward, -1.35);

    if (this.lastSkidLeft && this.lastSkidRight) {
      const idx = (this.skidIdx % this.maxSkidSegments) * 6 * 3;

      // Triangle 1
      this.skidPositions[idx + 0] = this.lastSkidLeft.x;
      this.skidPositions[idx + 1] = 0.08;
      this.skidPositions[idx + 2] = this.lastSkidLeft.z;

      this.skidPositions[idx + 3] = curLeft.x;
      this.skidPositions[idx + 4] = 0.08;
      this.skidPositions[idx + 5] = curLeft.z;

      this.skidPositions[idx + 6] = curRight.x;
      this.skidPositions[idx + 7] = 0.08;
      this.skidPositions[idx + 8] = curRight.z;

      // Triangle 2
      this.skidPositions[idx + 9] = this.lastSkidLeft.x;
      this.skidPositions[idx + 10] = 0.08;
      this.skidPositions[idx + 11] = this.lastSkidLeft.z;

      this.skidPositions[idx + 12] = curRight.x;
      this.skidPositions[idx + 13] = 0.08;
      this.skidPositions[idx + 14] = curRight.z;

      this.skidPositions[idx + 15] = this.lastSkidRight.x;
      this.skidPositions[idx + 16] = 0.08;
      this.skidPositions[idx + 17] = this.lastSkidRight.z;

      this.skidGeo.attributes.position.needsUpdate = true;
      this.skidIdx++;
    }

    this.lastSkidLeft = curLeft;
    this.lastSkidRight = curRight;
  }

  update(dt) {
    if (dt <= 0) return;

    for (let i = 0; i < this.maxParticles; i++) {
      if (this.particleLifetimes[i] > 0) {
        this.particleLifetimes[i] -= dt;

        // Position update with gravity & drag
        this.particlePositions[i * 3 + 0] += this.particleVelocities[i * 3 + 0] * dt;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * dt;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * dt;

        // Upward expansion / buoyancy
        this.particleVelocities[i * 3 + 1] -= 2.0 * dt; // slight gravity
        this.particleSizes[i] += 1.8 * dt; // expand puff

        if (this.particleLifetimes[i] <= 0) {
          this.particlePositions[i * 3 + 1] = -9999; // hide
        }
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }
}
