/**
 * 3D Racing Tracks and Environment Generator
 * Generates 4 distinct, immersive tracks:
 * 1. Cyber City (Neo Tokyo Night)
 * 2. Pacific Coast (Golden Hour Ocean Highway)
 * 3. Alpine Pass (Mountain Hairpins & Pine Forests)
 * 4. Desert Canyon (Red Rock Speedway)
 */

export const TRACK_CONFIGS = [
  {
    id: 'cyber_city',
    name: 'Neo Tokyo Speedway',
    theme: 'night',
    description: 'High-speed urban circuit through towering neon skyscrapers with wet asphalt reflections.',
    skyColor: 0x141829,
    fogColor: 0x181f38,
    fogDensity: 0.0009,
    ambientColor: 0x7799dd,
    sunColor: 0xbbddff,
    roadColor: 0x2b3040,
    curbColorA: 0x00ffff, // Neon cyan curbs
    curbColorB: 0xff0077, // Neon magenta curbs
    trackWidth: 15.0,
    laps: 3,
    waypoints: [
      { x: 0, z: 0, y: 0, maxSpeed: 240 },
      { x: 0, z: 120, y: 0, maxSpeed: 230 },
      { x: 40, z: 220, y: 0, maxSpeed: 170 },
      { x: 120, z: 280, y: 0, maxSpeed: 150 },
      { x: 220, z: 260, y: 0, maxSpeed: 190 },
      { x: 280, z: 180, y: 0, maxSpeed: 160 },
      { x: 260, z: 80, y: 0, maxSpeed: 180 },
      { x: 280, z: -40, y: 0, maxSpeed: 140 },
      { x: 240, z: -150, y: 0, maxSpeed: 175 },
      { x: 140, z: -220, y: 0, maxSpeed: 190 },
      { x: 40, z: -200, y: 0, maxSpeed: 165 },
      { x: -60, z: -220, y: 0, maxSpeed: 155 },
      { x: -160, z: -160, y: 0, maxSpeed: 180 },
      { x: -190, z: -60, y: 0, maxSpeed: 160 },
      { x: -140, z: 40, y: 0, maxSpeed: 175 },
      { x: -70, z: -20, y: 0, maxSpeed: 210 },
    ],
  },
  {
    id: 'pacific_coast',
    name: 'Pacific Sunset Highway',
    theme: 'sunset',
    description: 'Scenic seaside drive along golden ocean cliffs, palm trees, and coastal suspension bridges.',
    skyColor: 0xff8855,
    fogColor: 0xffaa77,
    fogDensity: 0.0007,
    ambientColor: 0x998877,
    sunColor: 0xffeecc,
    roadColor: 0x333338,
    curbColorA: 0xdd2222,
    curbColorB: 0xffffff,
    trackWidth: 16.0,
    laps: 3,
    waypoints: [
      { x: 0, z: 0, y: 0, maxSpeed: 240 },
      { x: 20, z: 140, y: 4, maxSpeed: 220 },
      { x: 90, z: 250, y: 8, maxSpeed: 170 },
      { x: 190, z: 300, y: 12, maxSpeed: 150 },
      { x: 300, z: 240, y: 10, maxSpeed: 180 },
      { x: 340, z: 120, y: 6, maxSpeed: 200 },
      { x: 310, z: -30, y: 4, maxSpeed: 165 },
      { x: 240, z: -140, y: 2, maxSpeed: 160 },
      { x: 130, z: -210, y: 0, maxSpeed: 180 },
      { x: 10, z: -250, y: 2, maxSpeed: 175 },
      { x: -120, z: -230, y: 6, maxSpeed: 155 },
      { x: -220, z: -140, y: 8, maxSpeed: 170 },
      { x: -240, z: -20, y: 5, maxSpeed: 195 },
      { x: -180, z: 90, y: 2, maxSpeed: 170 },
      { x: -80, z: 40, y: 0, maxSpeed: 210 },
    ],
  },
  {
    id: 'alpine_pass',
    name: 'Alpine Mountain Pass',
    theme: 'day',
    description: 'Technical mountain circuit with severe hairpin turns, dramatic elevation shifts, and pine forests.',
    skyColor: 0x77bbff,
    fogColor: 0x99ddff,
    fogDensity: 0.0005,
    ambientColor: 0x99aabb,
    sunColor: 0xffffff,
    roadColor: 0x3a3c44,
    curbColorA: 0xcc2222,
    curbColorB: 0xeeeeee,
    trackWidth: 14.0,
    laps: 3,
    waypoints: [
      { x: 0, z: 0, y: 0, maxSpeed: 230 },
      { x: 30, z: 110, y: 5, maxSpeed: 190 },
      { x: 110, z: 160, y: 12, maxSpeed: 140 },
      { x: 170, z: 120, y: 16, maxSpeed: 125 }, // Hairpin 1
      { x: 130, z: 40, y: 20, maxSpeed: 135 },
      { x: 210, z: -20, y: 26, maxSpeed: 160 },
      { x: 260, z: -110, y: 22, maxSpeed: 130 }, // Hairpin 2
      { x: 190, z: -170, y: 16, maxSpeed: 150 },
      { x: 90, z: -230, y: 10, maxSpeed: 180 },
      { x: -20, z: -210, y: 6, maxSpeed: 165 },
      { x: -110, z: -160, y: 4, maxSpeed: 140 }, // Hairpin 3
      { x: -80, z: -70, y: 2, maxSpeed: 170 },
      { x: -160, z: 0, y: 4, maxSpeed: 150 },
      { x: -120, z: 80, y: 2, maxSpeed: 170 },
      { x: -40, z: 40, y: 0, maxSpeed: 210 },
    ],
  },
  {
    id: 'desert_canyon',
    name: 'Red Rock Canyon',
    theme: 'day',
    description: 'High-speed speedway carved into sandstone canyons with grandstands and dust clouds.',
    skyColor: 0xffddaa,
    fogColor: 0xffeecc,
    fogDensity: 0.0006,
    ambientColor: 0xaa8866,
    sunColor: 0xffffff,
    roadColor: 0x3e3530,
    curbColorA: 0xee7700,
    curbColorB: 0x333333,
    trackWidth: 16.5,
    laps: 3,
    waypoints: [
      { x: 0, z: 0, y: 0, maxSpeed: 250 },
      { x: 0, z: 160, y: 0, maxSpeed: 245 },
      { x: 60, z: 270, y: 2, maxSpeed: 180 },
      { x: 170, z: 310, y: 4, maxSpeed: 170 },
      { x: 270, z: 250, y: 3, maxSpeed: 190 },
      { x: 320, z: 130, y: 0, maxSpeed: 215 },
      { x: 280, z: 0, y: -2, maxSpeed: 175 },
      { x: 210, z: -110, y: 0, maxSpeed: 190 },
      { x: 120, z: -210, y: 2, maxSpeed: 200 },
      { x: -10, z: -260, y: 4, maxSpeed: 175 },
      { x: -140, z: -220, y: 2, maxSpeed: 185 },
      { x: -210, z: -110, y: 0, maxSpeed: 170 },
      { x: -180, z: 10, y: 0, maxSpeed: 200 },
      { x: -90, z: 40, y: 0, maxSpeed: 225 },
    ],
  },
];

export class TrackBuilder {
  static buildTrack(scene, trackConfig) {
    const trackGroup = new THREE.Group();
    trackGroup.name = 'TrackGroup';

    // 1. Create Spline Curve from waypoints
    const points = trackConfig.waypoints.map((wp) => new THREE.Vector3(wp.x, wp.y || 0, wp.z));
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');

    const totalSamples = 360;
    const samplePoints = curve.getSpacedPoints(totalSamples);
    samplePoints.pop(); // Remove duplicate closing endpoint for loop
    const trackWidth = trackConfig.trackWidth || 15.0;
    const halfWidth = trackWidth * 0.5;

    // Build Road Ribbon Geometry
    const roadVerts = [];
    const roadUvs = [];
    const roadIndices = [];

    const curbVerts = [];
    const curbColors = [];
    const curbIndices = [];

    const barrierVerts = [];
    const barrierIndices = [];

    const sampledData = [];

    const curbColor1 = new THREE.Color(trackConfig.curbColorA);
    const curbColor2 = new THREE.Color(trackConfig.curbColorB);

    for (let i = 0; i < totalSamples; i++) {
      const p = samplePoints[i];
      const nextP = samplePoints[(i + 1) % totalSamples];

      // Forward direction
      const forward = new THREE.Vector3().subVectors(nextP, p).normalize();
      // Up vector
      const up = new THREE.Vector3(0, 1, 0);
      // Lateral right vector
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();

      sampledData.push({
        position: p,
        forward,
        right,
        index: i,
      });

      // Road edge vertices
      const leftEdge = new THREE.Vector3().copy(p).addScaledVector(right, -halfWidth);
      const rightEdge = new THREE.Vector3().copy(p).addScaledVector(right, halfWidth);

      // Road Surface
      const baseIdx = i * 2;
      roadVerts.push(leftEdge.x, leftEdge.y + 0.05, leftEdge.z);
      roadVerts.push(rightEdge.x, rightEdge.y + 0.05, rightEdge.z);

      const vProgress = i / totalSamples;
      roadUvs.push(0, vProgress * 25);
      roadUvs.push(1, vProgress * 25);

      if (i < totalSamples - 1) {
        roadIndices.push(baseIdx, baseIdx + 1, baseIdx + 2);
        roadIndices.push(baseIdx + 1, baseIdx + 3, baseIdx + 2);
      } else {
        roadIndices.push(baseIdx, baseIdx + 1, 0);
        roadIndices.push(baseIdx + 1, 1, 0);
      }

      // Curb strips on each side
      const curbWidth = 1.2;
      const curbHeight = 0.12;
      const curbLeftOuter = new THREE.Vector3().copy(leftEdge).addScaledVector(right, -curbWidth);
      const curbRightOuter = new THREE.Vector3().copy(rightEdge).addScaledVector(right, curbWidth);

      const curbColor = Math.floor(i / 3) % 2 === 0 ? curbColor1 : curbColor2;

      // Left curb
      const lCurbIdx = i * 4;
      curbVerts.push(curbLeftOuter.x, curbLeftOuter.y + curbHeight, curbLeftOuter.z);
      curbVerts.push(leftEdge.x, leftEdge.y + 0.05, leftEdge.z);
      curbColors.push(curbColor.r, curbColor.g, curbColor.b);
      curbColors.push(curbColor.r, curbColor.g, curbColor.b);

      // Right curb
      curbVerts.push(rightEdge.x, rightEdge.y + 0.05, rightEdge.z);
      curbVerts.push(curbRightOuter.x, curbRightOuter.y + curbHeight, curbRightOuter.z);
      curbColors.push(curbColor.r, curbColor.g, curbColor.b);
      curbColors.push(curbColor.r, curbColor.g, curbColor.b);

      const nextCurbIdx = i < totalSamples - 1 ? (i + 1) * 4 : 0;
      // Left curb tris
      curbIndices.push(lCurbIdx, lCurbIdx + 1, nextCurbIdx);
      curbIndices.push(lCurbIdx + 1, nextCurbIdx + 1, nextCurbIdx);
      // Right curb tris
      curbIndices.push(lCurbIdx + 2, lCurbIdx + 3, nextCurbIdx + 2);
      curbIndices.push(lCurbIdx + 3, nextCurbIdx + 3, nextCurbIdx + 2);

      // Outer Barriers / Guardrails
      const barrierHeight = 0.95;
      const bLeft = new THREE.Vector3().copy(curbLeftOuter);
      const bRight = new THREE.Vector3().copy(curbRightOuter);

      const bIdx = i * 4;
      barrierVerts.push(bLeft.x, bLeft.y, bLeft.z);
      barrierVerts.push(bLeft.x, bLeft.y + barrierHeight, bLeft.z);
      barrierVerts.push(bRight.x, bRight.y, bRight.z);
      barrierVerts.push(bRight.x, bRight.y + barrierHeight, bRight.z);

      const nextBIdx = i < totalSamples - 1 ? (i + 1) * 4 : 0;
      barrierIndices.push(bIdx, bIdx + 1, nextBIdx);
      barrierIndices.push(bIdx + 1, nextBIdx + 1, nextBIdx);
      barrierIndices.push(bIdx + 2, nextBIdx + 2, bIdx + 3);
      barrierIndices.push(bIdx + 3, nextBIdx + 2, nextBIdx + 3);
    }

    // 2. Build Road Mesh with asphalt texture shader
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVerts, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);
    roadGeo.computeVertexNormals();

    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512;
    roadCanvas.height = 512;
    const ctx = roadCanvas.getContext('2d');
    ctx.fillStyle = '#2c3140'; // Crisp, clearly visible modern asphalt
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt grain
    for (let g = 0; g < 4000; g++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      const val = 42 + Math.floor(Math.random() * 26);
      ctx.fillStyle = `rgb(${val},${val + 2},${val + 6})`;
      ctx.fillRect(gx, gy, 2, 2);
    }

    // High-visibility glowing center dotted line
    ctx.strokeStyle = '#ffee33';
    ctx.lineWidth = 10;
    ctx.setLineDash([32, 20]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    // Side edge crisp white boundary lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(28, 512);
    ctx.moveTo(484, 0);
    ctx.lineTo(484, 512);
    ctx.stroke();

    const roadTexture = new THREE.CanvasTexture(roadCanvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 30);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.6,
      metalness: 0.08,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    trackGroup.add(roadMesh);

    // 3. Build Curbs Mesh
    const curbGeo = new THREE.BufferGeometry();
    curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbVerts, 3));
    curbGeo.setAttribute('color', new THREE.Float32BufferAttribute(curbColors, 3));
    curbGeo.setIndex(curbIndices);
    curbGeo.computeVertexNormals();

    const curbMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.5,
      metalness: 0.2,
    });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.castShadow = true;
    curbMesh.receiveShadow = true;
    trackGroup.add(curbMesh);

    // 4. Build Guardrail Barriers Mesh
    const barrierGeo = new THREE.BufferGeometry();
    barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierVerts, 3));
    barrierGeo.setIndex(barrierIndices);
    barrierGeo.computeVertexNormals();

    const barrierMat = new THREE.MeshStandardMaterial({
      color: trackConfig.theme === 'night' ? 0x00ffff : 0xcccccc,
      metalness: 0.85,
      roughness: 0.25,
      emissive: trackConfig.theme === 'night' ? 0x004455 : 0x000000,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    barrierMesh.castShadow = true;
    barrierMesh.receiveShadow = true;
    trackGroup.add(barrierMesh);

    // 5. Start / Finish Line Banner Arch
    const startP = samplePoints[0];
    const startFwd = sampledData[0].forward;
    const startRight = sampledData[0].right;

    const archGroup = new THREE.Group();
    archGroup.position.copy(startP);

    // Left and right pillars
    const pillarGeo = new THREE.BoxGeometry(0.8, 6.0, 0.8);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
    const leftPillar = new THREE.Mesh(pillarGeo, archMat);
    leftPillar.position.copy(startRight).multiplyScalar(-halfWidth - 1.8);
    leftPillar.position.y = 3.0;
    const rightPillar = new THREE.Mesh(pillarGeo, archMat);
    rightPillar.position.copy(startRight).multiplyScalar(halfWidth + 1.8);
    rightPillar.position.y = 3.0;
    archGroup.add(leftPillar);
    archGroup.add(rightPillar);

    // Crossbar
    const crossGeo = new THREE.BoxGeometry(trackWidth + 4.5, 1.4, 0.8);
    const crossMesh = new THREE.Mesh(crossGeo, archMat);
    crossMesh.position.y = 6.0;
    const archYaw = Math.atan2(startRight.x, startRight.z);
    archGroup.rotation.y = archYaw;
    archGroup.add(crossMesh);

    // Start/Finish banner sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#0a0a0a';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.fillStyle = '#00f0ff';
    sCtx.font = 'bold 54px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('START / FINISH', 256, 82);
    // Checkered border
    for (let c = 0; c < 32; c++) {
      sCtx.fillStyle = c % 2 === 0 ? '#ffffff' : '#000000';
      sCtx.fillRect(c * 16, 0, 16, 16);
      sCtx.fillRect(c * 16, 112, 16, 16);
    }
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(trackWidth + 3.0, 1.2), signMat);
    signMesh.position.set(0, 6.0, 0.45);
    archGroup.add(signMesh);

    const signMeshBack = new THREE.Mesh(new THREE.PlaneGeometry(trackWidth + 3.0, 1.2), signMat);
    signMeshBack.position.set(0, 6.0, -0.45);
    signMeshBack.rotation.y = Math.PI;
    archGroup.add(signMeshBack);

    trackGroup.add(archGroup);

    // 6. Theme Scenery Objects
    this.populateScenery(trackGroup, trackConfig, samplePoints, sampledData, halfWidth);

    scene.add(trackGroup);

    return {
      group: trackGroup,
      curve,
      samplePoints,
      sampledData,
      totalLength: curve.getLength(),
      trackWidth,
      halfWidth,
      config: trackConfig,
    };
  }

  static populateScenery(trackGroup, config, samplePoints, sampledData, halfWidth) {
    const numSamples = samplePoints.length;

    // Terrain ground plane
    const terrainGeo = new THREE.PlaneGeometry(1600, 1600, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);

    let groundMat;
    if (config.id === 'cyber_city') {
      groundMat = new THREE.MeshStandardMaterial({
        color: 0x07080e,
        roughness: 0.95,
      });
    } else if (config.id === 'pacific_coast') {
      groundMat = new THREE.MeshStandardMaterial({
        color: 0x3d4430,
        roughness: 0.9,
      });
    } else if (config.id === 'alpine_pass') {
      groundMat = new THREE.MeshStandardMaterial({
        color: 0x2d4826,
        roughness: 0.92,
      });
    } else {
      groundMat = new THREE.MeshStandardMaterial({
        color: 0xa86338, // Red rock canyon dirt
        roughness: 0.95,
      });
    }

    const groundMesh = new THREE.Mesh(terrainGeo, groundMat);
    groundMesh.position.y = -0.15;
    groundMesh.receiveShadow = true;
    trackGroup.add(groundMesh);

    // Theme Specific Decor
    if (config.id === 'cyber_city') {
      this.populateCyberCity(trackGroup, samplePoints, sampledData, halfWidth);
    } else if (config.id === 'pacific_coast') {
      this.populatePacificCoast(trackGroup, samplePoints, sampledData, halfWidth);
    } else if (config.id === 'alpine_pass') {
      this.populateAlpinePass(trackGroup, samplePoints, sampledData, halfWidth);
    } else {
      this.populateDesertCanyon(trackGroup, samplePoints, sampledData, halfWidth);
    }
  }

  static populateCyberCity(trackGroup, samplePoints, sampledData, halfWidth) {
    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f18,
      metalness: 0.9,
      roughness: 0.3,
    });

    const neonColors = [0x00f0ff, 0xff0055, 0x9900ff, 0x00ff88, 0xffbb00];

    // High rise skyscrapers along the periphery
    for (let i = 0; i < sampledData.length; i += 6) {
      const data = sampledData[i];
      if (!data) continue;
      const side = (i / 6) % 2 === 0 ? 1 : -1;
      const dist = halfWidth + 14 + Math.random() * 25;

      const bldgHeight = 40 + Math.random() * 90;
      const bldgWidth = 15 + Math.random() * 20;
      const bldgDepth = 15 + Math.random() * 20;

      const bldgGeo = new THREE.BoxGeometry(bldgWidth, bldgHeight, bldgDepth);
      const bldg = new THREE.Mesh(bldgGeo, bldgMat);

      const pos = new THREE.Vector3().copy(data.position).addScaledVector(data.right, side * dist);
      bldg.position.set(pos.x, bldgHeight * 0.5, pos.z);
      bldg.castShadow = true;
      trackGroup.add(bldg);

      // Glowing Neon Roof Rim or Billboard
      const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
      const neonMat = new THREE.MeshBasicMaterial({ color: neonColor });

      const signGeo = new THREE.BoxGeometry(bldgWidth * 0.8, 4, 1);
      const sign = new THREE.Mesh(signGeo, neonMat);
      sign.position.set(pos.x, bldgHeight * 0.75, pos.z);
      trackGroup.add(sign);

      // Vibrant Street light pole with glowing lamp
      if (i % 6 === 0) {
        const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 9, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        const polePos = new THREE.Vector3().copy(data.position).addScaledVector(data.right, side * (halfWidth + 1.8));
        pole.position.set(polePos.x, 4.5, polePos.z);
        trackGroup.add(pole);

        const light = new THREE.PointLight(neonColor, 3.8, 48, 1.2);
        light.position.set(polePos.x, 8.8, polePos.z);
        trackGroup.add(light);

        // Glowing lamp bulb
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 8, 8),
          new THREE.MeshBasicMaterial({ color: neonColor })
        );
        bulb.position.set(polePos.x, 8.8, polePos.z);
        trackGroup.add(bulb);
      }
    }
  }

  static populatePacificCoast(trackGroup, samplePoints, sampledData, halfWidth) {
    // Ocean Plane
    const oceanGeo = new THREE.PlaneGeometry(1200, 1200);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x004477,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.set(200, -2.5, 0);
    trackGroup.add(ocean);

    // Palm trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6 });

    for (let i = 0; i < sampledData.length; i += 7) {
      const data = sampledData[i];
      if (!data) continue;
      const side = (i / 7) % 2 === 0 ? 1 : -1;
      const dist = halfWidth + 5 + Math.random() * 10;
      const pos = new THREE.Vector3().copy(data.position).addScaledVector(data.right, side * dist);

      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos.x, 0, pos.z);

      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 7, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3.5;
      trunk.rotation.z = (Math.random() - 0.5) * 0.2;
      treeGroup.add(trunk);

      const crownGeo = new THREE.ConeGeometry(2.8, 2.5, 7);
      const crown = new THREE.Mesh(crownGeo, leafMat);
      crown.position.y = 7.0;
      treeGroup.add(crown);

      trackGroup.add(treeGroup);
    }
  }

  static populateAlpinePass(trackGroup, samplePoints, sampledData, halfWidth) {
    const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3219 });
    const pineLeafMat = new THREE.MeshStandardMaterial({ color: 0x1b4d24, roughness: 0.8 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x666b73, roughness: 0.9 });

    for (let i = 0; i < sampledData.length; i += 5) {
      const data = sampledData[i];
      if (!data) continue;
      const side = (i / 5) % 2 === 0 ? 1 : -1;
      const dist = halfWidth + 4 + Math.random() * 18;
      const pos = new THREE.Vector3().copy(data.position).addScaledVector(data.right, side * dist);

      if (Math.random() > 0.35) {
        // Pine Tree
        const pine = new THREE.Group();
        pine.position.set(pos.x, data.position.y, pos.z);

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 5, 8), pineTrunkMat);
        trunk.position.y = 2.5;
        pine.add(trunk);

        for (let l = 0; l < 3; l++) {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4 - l * 0.5, 3.2, 7), pineLeafMat);
          cone.position.y = 4.0 + l * 2.2;
          pine.add(cone);
        }
        trackGroup.add(pine);
      } else {
        // Mountain Rock Boulder
        const rockSize = 3 + Math.random() * 4;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rockSize, 1), rockMat);
        rock.position.set(pos.x, data.position.y + rockSize * 0.4, pos.z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        trackGroup.add(rock);
      }
    }
  }

  static populateDesertCanyon(trackGroup, samplePoints, sampledData, halfWidth) {
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0xa84824, roughness: 0.95 });
    const standMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.7 });

    for (let i = 0; i < sampledData.length; i += 8) {
      const data = sampledData[i];
      if (!data) continue;
      const side = (i / 8) % 2 === 0 ? 1 : -1;
      const dist = halfWidth + 12 + Math.random() * 20;
      const pos = new THREE.Vector3().copy(data.position).addScaledVector(data.right, side * dist);

      if (i < 40 && side > 0) {
        // Stadium Grandstand with spectators along the main straight
        const grandstand = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 10), standMat);
        grandstand.position.set(pos.x, 4, pos.z);
        grandstand.rotation.y = Math.atan2(data.forward.x, data.forward.z);
        trackGroup.add(grandstand);
      } else {
        // Red Rock Mesa Cliffs
        const cliffHeight = 25 + Math.random() * 35;
        const cliff = new THREE.Mesh(new THREE.CylinderGeometry(14, 22, cliffHeight, 8), cliffMat);
        cliff.position.set(pos.x, cliffHeight * 0.5 - 2, pos.z);
        trackGroup.add(cliff);
      }
    }
  }
}
