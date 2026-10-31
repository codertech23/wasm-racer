# 🏎️ Velocity 3D — Professional Arcade Racing Game (PC + Mobile)

A complete, high-performance, professional-grade 3D car racing game built with **HTML5**, **WebGL (Three.js)**, **WebAssembly (WASM via Rust)**, and the **Web Audio API**. Runs directly in any desktop, laptop, tablet, or smartphone web browser without external downloads or plugins.

---

## 🌟 Key Highlights & Features

- **⚡ Blazing Fast WebAssembly (WASM) Physics**:
  - Core vehicle simulation, Pacejka lateral tire slip curve, Ackermann steering dynamics, and AI pathfinding compiled from Rust to pure WebAssembly with a 1:1 resilient JavaScript fallback.
- **🎮 5 Selectable High-Performance Sports Cars**:
  - **Apex GT**: Mid-engine Italian supercar with sharp aerodynamics and cornering grip.
  - **Viper Phantom**: Aggressive American V8 muscle with thunderous torque and high drift angles.
  - **Shinobi R-34**: Twin-turbo JDM legend with oversized GT rear wing and high-downforce tuning.
  - **Hyperion Evo**: Futuristic Le Mans prototype with carbon aero fins and rocket nitro acceleration.
  - **Spectre GT**: Prestige grand tourer with heavy high-speed stability and metallic gold finish.
- **🏁 4 Distinct 3D Racing Tracks & Environments**:
  - **Neo Tokyo Speedway** (Night): Wet asphalt reflections, towering neon skyscrapers, billboards, and streetlamps.
  - **Pacific Sunset Highway** (Golden Hour): Coastal ocean road, palm trees, golden sun, and cliffside barriers.
  - **Alpine Mountain Pass** (Day): Technical mountain hairpins, pine forests, rock boulders, and elevation shifts.
  - **Red Rock Canyon** (Desert): High-speed canyon speedway, stadium grandstands, and dusty drift shoulders.
- **💥 Exciting Arcade Physics & Drifting**:
  - Longitudinal weight transfer (suspension squat & dive) and lateral body roll.
  - Handbrake drift mechanics: initiate sideways drifts through sharp turns to rack up drift points and supercharge your Nitro tank!
  - Volumetric tire smoke, dynamic dual rubber skidmarks, nitro exhaust flame jets, and barrier collision sparks.
- **🎵 Procedural Web Audio API Sound Engine**:
  - Multi-oscillator dynamic engine sounds linked directly to RPM harmonics, throttle load, and cylinder pulses.
  - Turbo spool whistle and blow-off valve flutter on throttle lift-off.
  - Dynamic tire screech modulated by lateral slip angle and drift factor.
  - Synthesized high-energy synthwave/electro drum & bass racing soundtrack that ramps up intensity during races.
  - Zero external MP3/WAV file dependencies — 100% offline and instant loading!
- **📊 Professional Arcade HUD**:
  - Digital speedometer (KM/H) & analog tachometer with redline warning LED.
  - Real-time 2D minimap radar with track ribbon, finish line, player arrow, and AI opponent positions.
  - Lap counter, position badge (1st, 2nd, etc.), current lap time, and best lap time.
  - Dynamic camera FOV expansion with speed kick, collision shake, and 4 camera views.
- **🏆 5 Diverse Game Modes**:
  1. **Quick Race**: Select your car, circuit, laps, and AI opponents for immediate arcade action.
  2. **Championship Mode**: 4-track cup tournament with cumulative points and podium finish.
  3. **Time Trial**: Solo race against the clock to record ghost laps and earn medals.
  4. **Free Drive**: Open cruise mode without lap limits or timers for stunts and drift practice.
  5. **AI Elimination**: High-stakes knockout race where the last-place car is eliminated periodically until one champion survives.

---

## 🕹️ Controls Guide

### 💻 PC Controls
| Key | Action |
| --- | --- |
| **W** / **Up Arrow** | Accelerate / Drive Forward |
| **S** / **Down Arrow** | Brake / Reverse |
| **A** / **Left Arrow** | Steer Left |
| **D** / **Right Arrow** | Steer Right |
| **Spacebar** | Handbrake (Hold to initiate and maintain drift) |
| **Shift** (Left or Right) | Nitro Boost (N2O) |
| **C** | Cycle Camera (Close Chase, Far Chase, Hood/Bumper, Cockpit) |
| **R** | Reset / Respawn Car onto Track |
| **M** | Toggle Audio Mute |
| **Escape** | Pause / Resume Game |

### 📱 Mobile & Tablet Controls
- **Left / Right buttons** (left thumb): Smooth progressive steering.
- **GAS Pedal** (right thumb): Accelerate.
- **BRAKE Pedal**: Brake and reverse.
- **DRIFT button**: Handbrake for corner drifting.
- **NITRO button**: Instant speed boost.
- **Tilt Steering**: Optional gyroscope / accelerometer steering via the Settings menu with calibration!
- Responsive layout supporting both **Landscape** and **Portrait** orientations.

---

## 🚀 Quick Launch Instructions

### Option 1: One-Click Shell Script
```bash
cd /home/aa/wasm-racer
./run.sh
```
Open [http://localhost:8080](http://localhost:8080) in any web browser.

### Option 2: Python 3
```bash
cd /home/aa/wasm-racer/web
python3 -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 3: Node.js / npx serve
```bash
cd /home/aa/wasm-racer/web
npx serve -l 8080
```

---

## 🛠️ Project Structure

```
wasm-racer/
├── Cargo.toml                  # Rust WASM project manifest
├── src/                        # Rust WebAssembly Source Code
│   ├── lib.rs                  # C-ABI exported functions for JS bridge
│   ├── car_physics.rs          # Vehicle dynamics, Pacejka tire slip model, RPM simulation
│   ├── ai_driver.rs            # AI pathfinding, overtaking cone detection, corner braking
│   └── track_math.rs           # Spline projection, barrier collision, car-to-car collision
├── web/                        # Web Game Distribution
│   ├── index.html              # Main HTML5 entry, HUD overlays, menus, responsive touch controls
│   ├── css/
│   │   ├── style.css           # Sci-fi arcade UI, glassmorphism, responsive mobile layout
│   │   └── speedometer.css     # Tachometer dial, needle, digital speedometer, nitro gauge
│   ├── js/
│   │   ├── libs/
│   │   │   └── three.min.js    # Self-contained offline Three.js library
│   │   ├── wasm_binary.js      # Embedded base64 WASM for 100% offline & zero-CORS resilience
│   │   ├── wasm_bridge.js      # Memory bridge between JS and WASM with JS fallback
│   │   ├── audio.js            # Web Audio API engine, tire screech, crashes, and synthwave BGM
│   │   ├── car_builder.js      # Procedural 3D sports car geometries, materials, rims, calipers
│   │   ├── tracks.js           # 4 procedural circuits: Cyber City, Coast, Alps, Canyon
│   │   ├── physics.js          # Vehicle state coordinator, gear shifts, spline projection
│   │   ├── ai.js               # Autonomous opponent controllers
│   │   ├── camera.js           # Dynamic chase camera with spring damper, FOV kick, shake
│   │   ├── particles.js        # Tire smoke, skidmarks, nitro exhaust flames, sparks
│   │   ├── input.js            # Keyboard, touch multi-pedal, and gyroscope tilt manager
│   │   ├── ui.js               # HUD updates, minimap radar, drift popups, results modal
│   │   └── main.js             # Game lifecycle and event bindings
│   └── wasm/
│       └── wasm_racer.wasm     # Compiled 35KB release WebAssembly binary
├── run.sh                      # Instant local server launcher
└── README.md                   # Complete documentation
```

---

## ⚙️ Building the Rust WebAssembly Module

To recompile the Rust WASM module from source:

```bash
cd /home/aa/wasm-racer
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/wasm_racer.wasm web/wasm/wasm_racer.wasm
```
