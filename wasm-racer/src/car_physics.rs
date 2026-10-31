use std::f32::consts::PI;

pub const CAR_DATA_SIZE: usize = 32;

// Indices in car float buffer:
pub const IDX_X: usize = 0;
pub const IDX_Y: usize = 1;
pub const IDX_Z: usize = 2;
pub const IDX_VX: usize = 3;
pub const IDX_VY: usize = 4;
pub const IDX_VZ: usize = 5;
pub const IDX_YAW: usize = 6;
pub const IDX_PITCH: usize = 7;
pub const IDX_ROLL: usize = 8;
pub const IDX_YAW_RATE: usize = 9;
pub const IDX_STEER: usize = 10;
pub const IDX_THROTTLE: usize = 11;
pub const IDX_BRAKE: usize = 12;
pub const IDX_HANDBRAKE: usize = 13;
pub const IDX_NITRO: usize = 14;
pub const IDX_SPEED_KMH: usize = 15;
pub const IDX_RPM: usize = 16;
pub const IDX_GEAR: usize = 17;
pub const IDX_NITRO_AMOUNT: usize = 18;
pub const IDX_DRIFT_FACTOR: usize = 19;
pub const IDX_IS_DRIFTING: usize = 20;
pub const IDX_TOP_SPEED: usize = 21;
pub const IDX_ACCEL_STAT: usize = 22;
pub const IDX_HANDLING_STAT: usize = 23;
pub const IDX_DRIFT_STAT: usize = 24;
pub const IDX_MASS: usize = 25;
pub const IDX_WHEEL_ROTATION: usize = 26;
pub const IDX_SLIP_ANGLE: usize = 27;
pub const IDX_DRIFT_SCORE: usize = 28;
pub const IDX_OFF_ROAD: usize = 29;
pub const IDX_HEALTH: usize = 30;
pub const IDX_AI_ID: usize = 31;

pub fn wrap_angle(mut a: f32) -> f32 {
    while a > PI {
        a -= 2.0 * PI;
    }
    while a < -PI {
        a += 2.0 * PI;
    }
    a
}

pub fn clamp(val: f32, min: f32, max: f32) -> f32 {
    if val < min {
        min
    } else if val > max {
        max
    } else {
        val
    }
}

pub fn update_car_physics(car: &mut [f32; CAR_DATA_SIZE], dt: f32, surface_friction: f32) {
    if dt <= 0.0 {
        return;
    }

    let top_speed_kmh = car[IDX_TOP_SPEED].max(120.0);
    let top_speed_ms = top_speed_kmh / 3.6;
    let accel_stat = car[IDX_ACCEL_STAT].clamp(0.5, 2.0);
    let handling_stat = car[IDX_HANDLING_STAT].clamp(0.5, 2.0);
    let drift_stat = car[IDX_DRIFT_STAT].clamp(0.5, 2.0);
    let mass = car[IDX_MASS].clamp(800.0, 2200.0);

    let throttle = car[IDX_THROTTLE].clamp(0.0, 1.0);
    let brake = car[IDX_BRAKE].clamp(0.0, 1.0);
    let handbrake = car[IDX_HANDBRAKE].clamp(0.0, 1.0);
    let nitro_pressed = car[IDX_NITRO] > 0.5;

    let mut nitro_amount = car[IDX_NITRO_AMOUNT];
    let mut nitro_active = false;
    let mut nitro_boost = 1.0;

    if nitro_pressed && nitro_amount > 0.5 && throttle > 0.1 {
        nitro_active = true;
        nitro_boost = 1.65;
        nitro_amount -= dt * 25.0; // depletes over 4 seconds of continuous use
        if nitro_amount < 0.0 {
            nitro_amount = 0.0;
        }
    } else {
        // passively recharge nitro slowly when driving
        nitro_amount = (nitro_amount + dt * 4.0).min(100.0);
    }
    car[IDX_NITRO_AMOUNT] = nitro_amount;

    let yaw = car[IDX_YAW];
    let vx = car[IDX_VX];
    let vz = car[IDX_VZ];

    // Local forward and lateral velocities relative to car heading
    // Forward direction: (sin(yaw), 0, cos(yaw))
    // Right direction: (cos(yaw), 0, -sin(yaw))
    let forward_x = yaw.sin();
    let forward_z = yaw.cos();
    let right_x = forward_z;
    let right_z = -forward_x;

    let v_forward = vx * forward_x + vz * forward_z;
    let v_lateral = vx * right_x + vz * right_z;
    let speed_ms = (vx * vx + vz * vz).sqrt();
    let speed_kmh = speed_ms * 3.6;
    car[IDX_SPEED_KMH] = speed_kmh;

    // Off-road check modifier
    let is_offroad = car[IDX_OFF_ROAD] > 0.5;
    let ground_friction = if is_offroad {
        surface_friction * 0.45
    } else {
        surface_friction
    };

    // Engine and Drive Forces
    let max_engine_force = mass * 7.5 * accel_stat * nitro_boost;
    let mut drive_force = 0.0;

    if throttle > 0.0 {
        // Power curve falls off as approaching top speed
        let speed_ratio = (speed_ms / (top_speed_ms * if nitro_active { 1.3 } else { 1.0 })).clamp(0.0, 1.1);
        let torque_mult = (1.0 - speed_ratio * 0.85).max(0.05);
        drive_force = throttle * max_engine_force * torque_mult;
    } else if brake > 0.0 && v_forward < 0.5 {
        // Reverse gear
        let reverse_max_speed = 15.0; // ~54 km/h
        if v_forward > -reverse_max_speed {
            drive_force = -brake * max_engine_force * 0.4;
        }
    }

    // Braking force
    let mut brake_force = 0.0;
    if brake > 0.0 && v_forward > 0.1 {
        brake_force = -brake * mass * 14.0;
    }

    // Aerodynamic Drag & Rolling Resistance
    let drag_coeff = 0.32;
    let frontal_area = 2.1;
    let air_density = 1.225;
    let aero_drag = 0.5 * air_density * drag_coeff * frontal_area * v_forward * v_forward.abs();
    let rolling_resistance = mass * 9.81 * (if is_offroad { 0.15 } else { 0.015 }) * v_forward.signum();

    let net_forward_force = drive_force + brake_force - aero_drag - rolling_resistance;
    let accel_forward = (net_forward_force / mass) * ground_friction;

    // Steering and Lateral Grip / Drift Dynamics
    let steer_input = car[IDX_STEER].clamp(-1.0, 1.0);
    // Speed-dependent steering angle dampening
    let speed_steer_factor = 1.0 / (1.0 + (speed_ms / 25.0).powi(2) * 0.5);
    let max_steer_angle = 0.58 * speed_steer_factor * handling_stat; // ~33 deg at low speed
    let target_steer_angle = steer_input * max_steer_angle;

    // Lateral grip and slip angle
    let slip_angle = if speed_ms > 1.5 {
        (v_lateral / speed_ms.max(0.1)).atan()
    } else {
        0.0
    };
    car[IDX_SLIP_ANGLE] = slip_angle;

    // Handbrake initiates or sustains drift
    let is_handbraking = handbrake > 0.2;
    let mut drift_factor = car[IDX_DRIFT_FACTOR];

    if is_handbraking && speed_ms > 6.0 {
        drift_factor = (drift_factor + dt * 4.5 * drift_stat).min(1.0);
    } else if slip_angle.abs() > 0.35 && speed_ms > 10.0 {
        // Drift maintained by high slip angle
        drift_factor = (drift_factor + dt * 2.5).min(1.0);
    } else {
        // Recover grip gradually
        drift_factor = (drift_factor - dt * 2.8).max(0.0);
    }
    car[IDX_DRIFT_FACTOR] = drift_factor;

    let is_drifting = drift_factor > 0.35 && speed_ms > 8.0;
    car[IDX_IS_DRIFTING] = if is_drifting { 1.0 } else { 0.0 };

    if is_drifting {
        // Drifting awards score!
        let score_gain = (speed_kmh * drift_factor * dt * 40.0) as f32;
        car[IDX_DRIFT_SCORE] += score_gain;
        // Drifting also rewards extra nitro boost!
        car[IDX_NITRO_AMOUNT] = (car[IDX_NITRO_AMOUNT] + dt * 8.0).min(100.0);
    }

    // Lateral grip coefficient via simplified Pacejka model
    let base_lateral_grip = 1.15 * ground_friction;
    let effective_grip = base_lateral_grip * (1.0 - drift_factor * 0.65);
    let cornering_force = -slip_angle * mass * 9.81 * effective_grip;
    let accel_lateral = cornering_force / mass;

    // Yaw dynamics
    let wheelbase = 2.65;
    let ackermann_yaw_rate = (v_forward / wheelbase) * target_steer_angle.tan();
    let drift_oversteer_torque = if is_drifting {
        -steer_input * 1.8 * drift_stat + (v_lateral / speed_ms.max(1.0)) * 2.2
    } else {
        0.0
    };

    let target_yaw_rate = ackermann_yaw_rate + drift_oversteer_torque;
    let yaw_damping = if is_drifting { 3.5 } else { 8.0 };
    let mut yaw_rate = car[IDX_YAW_RATE];
    yaw_rate += (target_yaw_rate - yaw_rate) * yaw_damping * dt;
    car[IDX_YAW_RATE] = yaw_rate;

    // Update heading yaw
    let new_yaw = wrap_angle(yaw + yaw_rate * dt);
    car[IDX_YAW] = new_yaw;

    // Convert local accelerations to global frame
    let new_v_forward = v_forward + accel_forward * dt;
    let new_v_lateral = v_lateral + accel_lateral * dt;

    let new_vx = new_v_forward * forward_x + new_v_lateral * right_x;
    let new_vz = new_v_forward * forward_z + new_v_lateral * right_z;

    car[IDX_VX] = new_vx;
    car[IDX_VZ] = new_vz;

    // Update positions
    car[IDX_X] += new_vx * dt;
    car[IDX_Z] += new_vz * dt;

    // Wheel rotation visual calculation
    let wheel_radius = 0.34;
    let angular_dist = (new_v_forward / wheel_radius) * dt;
    car[IDX_WHEEL_ROTATION] = (car[IDX_WHEEL_ROTATION] + angular_dist) % (2.0 * PI);

    // Body roll and pitch based on G-forces
    let lateral_g = accel_lateral / 9.81;
    let longitudinal_g = accel_forward / 9.81;
    let target_roll = clamp(-lateral_g * 0.08, -0.14, 0.14);
    let target_pitch = clamp(longitudinal_g * 0.05, -0.09, 0.09);

    car[IDX_ROLL] += (target_roll - car[IDX_ROLL]) * 10.0 * dt;
    car[IDX_PITCH] += (target_pitch - car[IDX_PITCH]) * 10.0 * dt;

    // Realistic RPM & Transmission Simulation
    let gear_ratios = [3.50, 2.30, 1.65, 1.25, 0.98, 0.78];
    let num_gears = gear_ratios.len();
    let current_gear = (car[IDX_GEAR] as usize).clamp(1, num_gears);

    let idle_rpm = 950.0;
    let max_rpm = 8200.0;
    let shift_up_rpm = 7200.0;
    let shift_down_rpm = 3400.0;

    let wheel_rpm = (speed_ms / (2.0 * PI * wheel_radius)) * 60.0;
    let final_drive = 3.73;
    let mut calculated_rpm = idle_rpm + wheel_rpm * gear_ratios[current_gear - 1] * final_drive * 0.55;

    if throttle > 0.1 {
        calculated_rpm += throttle * 1200.0;
    }

    // Auto gear shifting
    let mut new_gear = current_gear;
    if calculated_rpm > shift_up_rpm && new_gear < num_gears {
        new_gear += 1;
    } else if calculated_rpm < shift_down_rpm && new_gear > 1 {
        new_gear -= 1;
    }
    car[IDX_GEAR] = new_gear as f32;

    let target_rpm = calculated_rpm.clamp(idle_rpm, max_rpm);
    let mut current_rpm = car[IDX_RPM];
    if current_rpm <= 0.0 {
        current_rpm = idle_rpm;
    }
    current_rpm += (target_rpm - current_rpm) * 12.0 * dt;
    car[IDX_RPM] = current_rpm;
}
