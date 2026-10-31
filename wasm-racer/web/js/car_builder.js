/**
 * Procedural 3D Sports Car Generator
 * Builds high-fidelity sports cars with custom geometry, materials, wheels,
 * brake calipers, headlights, taillights, spoilers, and dynamic wheel steering.
 */

export const CAR_MODELS = [
  {
    id: 'apex_gt',
    name: 'Apex GT',
    type: 'Supercar',
    color: 0xee1122, // Rosso Corsa Red
    accentColor: 0x111111,
    stats: {
      topSpeed: 235,
      accel: 1.25,
      handling: 1.15,
      drift: 1.05,
      mass: 1350,
    },
    description: 'Mid-engine Italian exotic. Unrivaled cornering precision and aerodynamic balance.',
  },
  {
    id: 'viper_phantom',
    name: 'Viper Phantom',
    type: 'Muscle Car',
    color: 0x1a1235, // Midnight Metallic Purple
    accentColor: 0xeeeeee, // White Racing Stripes
    stats: {
      topSpeed: 220,
      accel: 1.35,
      handling: 0.95,
      drift: 1.35,
      mass: 1600,
    },
    description: 'Raw American V8 muscle. Massive low-end torque built for breathtaking drift angles.',
  },
  {
    id: 'shinobi_r34',
    name: 'Shinobi R-34',
    type: 'JDM Tuner',
    color: 0x0066ff, // Bayside Blue
    accentColor: 0x111111,
    stats: {
      topSpeed: 228,
      accel: 1.18,
      handling: 1.25,
      drift: 1.20,
      mass: 1420,
    },
    description: 'Twin-turbo Japanese legend with aggressive aero wing and razor-sharp grip.',
  },
  {
    id: 'hyperion_evo',
    name: 'Hyperion Evo',
    type: 'Hypercar',
    color: 0x00ff88, // Neon Cyber Lime
    accentColor: 0x050505,
    stats: {
      topSpeed: 250,
      accel: 1.30,
      handling: 1.20,
      drift: 0.95,
      mass: 1280,
    },
    description: 'Next-gen carbon fiber prototype. Extreme aerodynamic downforce and rocket top speed.',
  },
  {
    id: 'spectre_cruiser',
    name: 'Spectre GT',
    type: 'Luxury GT',
    color: 0xddaa22, // Electric Gold
    accentColor: 0x222222,
    stats: {
      topSpeed: 240,
      accel: 1.10,
      handling: 1.08,
      drift: 0.90,
      mass: 1750,
    },
    description: 'Prestige grand tourer. Heavy, ultra-stable chassis with effortless high-speed cruising.',
  },
];

export class CarBuilder {
  static createCar(carConfig, isPlayer = false) {
    const carGroup = new THREE.Group();
    carGroup.name = carConfig.name || 'SportsCar';

    // Shared Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: carConfig.color,
      metalness: 0.85,
      roughness: 0.18,
      envMapIntensity: 1.2,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: carConfig.accentColor || 0x111111,
      metalness: 0.9,
      roughness: 0.25,
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x151515,
      metalness: 0.3,
      roughness: 0.6,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111622,
      metalness: 0.9,
      roughness: 0.05,
      transmission: 0.65,
      transparent: true,
      opacity: 0.88,
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xccf0ff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xff1111,
      emissive: 0xaa0505,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.08,
    });

    // 1. Lower Chassis / Underbody
    const chassisGeo = new THREE.BoxGeometry(1.85, 0.25, 4.4);
    const chassisMesh = new THREE.Mesh(chassisGeo, carbonMat);
    chassisMesh.position.y = 0.28;
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    carGroup.add(chassisMesh);

    // 2. Main Car Body (Aggressive Sports Car Profile)
    const bodyGeo = new THREE.BoxGeometry(1.92, 0.48, 4.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.52;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    carGroup.add(bodyMesh);

    // Front Nose taper
    const noseGeo = new THREE.BoxGeometry(1.8, 0.32, 1.2);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
    noseMesh.position.set(0, 0.44, 1.8);
    noseMesh.rotation.x = 0.12;
    noseMesh.castShadow = true;
    carGroup.add(noseMesh);

    // Front Splitter / Air Dam
    const splitterGeo = new THREE.BoxGeometry(1.94, 0.08, 0.5);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.18, 2.3);
    splitter.castShadow = true;
    carGroup.add(splitter);

    // 3. Cabin & Canopy Glasshouse
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.48, 2.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 0.92, -0.15);
    cabinMesh.castShadow = true;
    carGroup.add(cabinMesh);

    // Roof Panel
    const roofGeo = new THREE.BoxGeometry(1.42, 0.08, 1.6);
    const roofMesh = new THREE.Mesh(roofGeo, bodyMat);
    roofMesh.position.set(0, 1.18, -0.2);
    roofMesh.castShadow = true;
    carGroup.add(roofMesh);

    // Racing stripe if applicable
    if (carConfig.id === 'viper_phantom') {
      const stripeGeo = new THREE.BoxGeometry(0.35, 0.02, 4.25);
      const stripe = new THREE.Mesh(stripeGeo, accentMat);
      stripe.position.set(0, 0.77, 0);
      carGroup.add(stripe);

      const roofStripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 1.62), accentMat);
      roofStripe.position.set(0, 1.23, -0.2);
      carGroup.add(roofStripe);
    }

    // 4. Rear Spoiler / Wing
    const wingSupportGeo = new THREE.BoxGeometry(0.06, 0.35, 0.15);
    const leftSupport = new THREE.Mesh(wingSupportGeo, carbonMat);
    leftSupport.position.set(-0.62, 0.9, -1.95);
    const rightSupport = new THREE.Mesh(wingSupportGeo, carbonMat);
    rightSupport.position.set(0.62, 0.9, -1.95);
    carGroup.add(leftSupport);
    carGroup.add(rightSupport);

    const wingGeo = new THREE.BoxGeometry(
      carConfig.id === 'shinobi_r34' || carConfig.id === 'hyperion_evo' ? 2.05 : 1.85,
      0.06,
      0.42
    );
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.08, -1.95);
    wing.rotation.x = -0.06;
    wing.castShadow = true;
    carGroup.add(wing);

    // 5. Headlights (Angled modern LED strips)
    const hlGeo = new THREE.BoxGeometry(0.42, 0.12, 0.15);
    const leftHl = new THREE.Mesh(hlGeo, headlightMat);
    leftHl.position.set(-0.65, 0.52, 2.15);
    leftHl.rotation.y = -0.15;
    const rightHl = new THREE.Mesh(hlGeo, headlightMat);
    rightHl.position.set(0.65, 0.52, 2.15);
    rightHl.rotation.y = 0.15;
    carGroup.add(leftHl);
    carGroup.add(rightHl);

    // Headlight Spotlights for crystal-clear night driving
    const leftLight = new THREE.SpotLight(0xffffff, 4.0, 140, Math.PI / 4, 0.3, 1.2);
    leftLight.position.set(-0.65, 0.55, 2.2);
    leftLight.target.position.set(-0.65, 0.0, 60.0);
    carGroup.add(leftLight);
    carGroup.add(leftLight.target);

    const rightLight = new THREE.SpotLight(0xffffff, 4.0, 140, Math.PI / 4, 0.3, 1.2);
    rightLight.position.set(0.65, 0.55, 2.2);
    rightLight.target.position.set(0.65, 0.0, 60.0);
    carGroup.add(rightLight);
    carGroup.add(rightLight.target);

    // Front high-beam road illuminator
    const forwardGlow = new THREE.PointLight(0xffffff, 3.2, 40, 1.2);
    forwardGlow.position.set(0, 0.8, 3.0);
    carGroup.add(forwardGlow);

    // 6. Taillights (Full-width neon light bar or twin horizontal bars)
    const tlGeo = new THREE.BoxGeometry(0.65, 0.12, 0.08);
    const leftTl = new THREE.Mesh(tlGeo, taillightMat);
    leftTl.position.set(-0.55, 0.58, -2.12);
    const rightTl = new THREE.Mesh(tlGeo, taillightMat);
    rightTl.position.set(0.55, 0.58, -2.12);
    carGroup.add(leftTl);
    carGroup.add(rightTl);

    // 7. Rear Exhaust Pipes & Diffuser
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.35, 12);
    exhaustGeo.rotateX(Math.PI / 2);
    const leftExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    leftExhaust.position.set(-0.45, 0.28, -2.15);
    const rightExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    rightExhaust.position.set(0.45, 0.28, -2.15);
    carGroup.add(leftExhaust);
    carGroup.add(rightExhaust);

    // 8. Side Mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.25, 0.1, 0.15);
    const leftMirror = new THREE.Mesh(mirrorGeo, bodyMat);
    leftMirror.position.set(-1.0, 0.76, 0.7);
    const rightMirror = new THREE.Mesh(mirrorGeo, bodyMat);
    rightMirror.position.set(1.0, 0.76, 0.7);
    carGroup.add(leftMirror);
    carGroup.add(rightMirror);

    // 9. Wheels & Calipers Assembly
    const wheelRadius = 0.36;
    const wheelWidth = 0.28;
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.85,
      metalness: 0.1,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xdde2e8,
      metalness: 0.92,
      roughness: 0.15,
    });
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xff0022,
      roughness: 0.3,
      metalness: 0.5,
    });

    const createWheel = (isFront) => {
      const wheelAssembly = new THREE.Group();

      // Tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelAssembly.add(tire);

      // Rim Hub
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.72, wheelRadius * 0.72, wheelWidth + 0.02, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelAssembly.add(rim);

      // 5-Spoke Pattern
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, wheelRadius * 1.3, 0.04);
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = (s * Math.PI * 2) / 5;
        wheelAssembly.add(spoke);
      }

      // Brake Rotor Disc
      const rotorGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, 0.04, 16);
      rotorGeo.rotateZ(Math.PI / 2);
      const rotor = new THREE.Mesh(rotorGeo, chromeMat);
      wheelAssembly.add(rotor);

      // Red Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(0, wheelRadius * 0.45, 0);
      wheelAssembly.add(caliper);

      return wheelAssembly;
    };

    const wheelBaseX = 0.96;
    const wheelFrontZ = 1.35;
    const wheelRearZ = -1.35;
    const wheelPosY = wheelRadius;

    // Groups for front wheels to handle steering yaw independently of spin pitch
    const frontLeftSteer = new THREE.Group();
    frontLeftSteer.position.set(-wheelBaseX, wheelPosY, wheelFrontZ);
    const frontLeftWheel = createWheel(true);
    frontLeftSteer.add(frontLeftWheel);
    carGroup.add(frontLeftSteer);

    const frontRightSteer = new THREE.Group();
    frontRightSteer.position.set(wheelBaseX, wheelPosY, wheelFrontZ);
    const frontRightWheel = createWheel(true);
    frontRightSteer.add(frontRightWheel);
    carGroup.add(frontRightSteer);

    const rearLeftSteer = new THREE.Group();
    rearLeftSteer.position.set(-wheelBaseX, wheelPosY, wheelRearZ);
    const rearLeftWheel = createWheel(false);
    rearLeftSteer.add(rearLeftWheel);
    carGroup.add(rearLeftSteer);

    const rearRightSteer = new THREE.Group();
    rearRightSteer.position.set(wheelBaseX, wheelPosY, wheelRearZ);
    const rearRightWheel = createWheel(false);
    rearRightSteer.add(rearRightWheel);
    carGroup.add(rearRightSteer);

    // Underglow Neon for sports cars
    const underglowLight = new THREE.PointLight(carConfig.color, isPlayer ? 1.4 : 0.6, 6, 2.0);
    underglowLight.position.set(0, 0.15, 0);
    carGroup.add(underglowLight);

    return {
      group: carGroup,
      bodyMesh,
      bodyMat,
      taillightMat,
      headlights: [leftLight, rightLight],
      forwardGlow,
      underglow: underglowLight,
      exhaustPipes: [leftExhaust, rightExhaust],
      frontLeftSteer,
      frontRightSteer,
      frontLeftWheel,
      frontRightWheel,
      rearLeftWheel,
      rearRightWheel,
      config: carConfig,
    };
  }

  static updateCarVisuals(carObj, carState, isBraking) {
    const { frontLeftSteer, frontRightSteer, frontLeftWheel, frontRightWheel, rearLeftWheel, rearRightWheel, taillightMat } =
      carObj;

    const steerAngle = carState.steer * 0.52; // Visual steering angle matches car turn
    frontLeftSteer.rotation.y = steerAngle;
    frontRightSteer.rotation.y = steerAngle;

    const wheelRot = carState.wheelRotation;
    frontLeftWheel.rotation.x = wheelRot;
    frontRightWheel.rotation.x = wheelRot;
    rearLeftWheel.rotation.x = wheelRot;
    rearRightWheel.rotation.x = wheelRot;

    // Taillights brighten significantly when braking
    if (taillightMat) {
      if (isBraking || carState.brake > 0.1 || carState.handbrake > 0.2) {
        taillightMat.emissiveIntensity = 4.0;
        taillightMat.emissive.setHex(0xff0000);
      } else {
        taillightMat.emissiveIntensity = 1.2;
        taillightMat.emissive.setHex(0xaa1111);
      }
    }
  }

  static setNightMode(carObj, isNight) {
    if (carObj.headlights) {
      carObj.headlights.forEach((light) => {
        light.intensity = isNight ? 5.0 : 2.5;
      });
    }
    if (carObj.forwardGlow) {
      carObj.forwardGlow.intensity = isNight ? 4.0 : 2.0;
    }
    if (carObj.underglow) {
      carObj.underglow.intensity = isNight ? 3.0 : 1.2;
    }
  }
}
