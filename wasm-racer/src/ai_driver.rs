use crate::car_physics::*;

pub fn update_ai_car(
    car: &mut [f32; CAR_DATA_SIZE],
    waypoints: &[f32], // flat array of [x, z, max_speed] triplets
    num_waypoints: usize,
    current_wp_idx: usize,
    other_cars: &[f32], // flat array of [x, z, vx, vz, yaw] (5 floats per car)
    num_other_cars: usize,
    dt: f32,
    difficulty: f32, // 0.8 = easy, 1.0 = normal, 1.25 = pro
) -> usize {
    if num_waypoints == 0 || dt <= 0.0 {
        return current_wp_idx;
    }

    let car_x = car[IDX_X];
    let car_z = car[IDX_Z];
    let car_yaw = car[IDX_YAW];
    let car_speed_kmh = car[IDX_SPEED_KMH];
    let car_speed_ms = car_speed_kmh / 3.6;

    // Advance waypoint if close enough
    let mut target_idx = current_wp_idx;
    let mut check_count = 0;
    while check_count < 4 {
        let wp_x = waypoints[target_idx * 3];
        let wp_z = waypoints[target_idx * 3 + 1];
        let dx = wp_x - car_x;
        let dz = wp_z - car_z;
        let dist_sq = dx * dx + dz * dz;

        // Radius to reach waypoint expands with speed
        let threshold = (14.0 + car_speed_ms * 0.4).powi(2);
        if dist_sq < threshold {
            target_idx = (target_idx + 1) % num_waypoints;
            check_count += 1;
        } else {
            break;
        }
    }

    // Dynamic lookahead waypoint based on speed
    let lookahead_steps = ((car_speed_ms / 12.0) as usize).clamp(1, 4);
    let look_idx = (target_idx + lookahead_steps) % num_waypoints;

    let target_x = waypoints[look_idx * 3];
    let target_z = waypoints[look_idx * 3 + 1];
    let recommended_speed = waypoints[look_idx * 3 + 2] * difficulty;

    // Obstacle / Overtake avoidance
    let mut steer_offset = 0.0;
    let fwd_x = car_yaw.sin();
    let fwd_z = car_yaw.cos();
    let right_x = fwd_z;
    let right_z = -fwd_x;

    for i in 0..num_other_cars {
        let oc_x = other_cars[i * 5];
        let oc_z = other_cars[i * 5 + 1];

        let to_other_x = oc_x - car_x;
        let to_other_z = oc_z - car_z;
        let dist = (to_other_x * to_other_x + to_other_z * to_other_z).sqrt();

        if dist > 0.5 && dist < 28.0 {
            let dot_fwd = to_other_x * fwd_x + to_other_z * fwd_z;
            let dot_lat = to_other_x * right_x + to_other_z * right_z;

            // Is the car ahead in our forward cone?
            if dot_fwd > 1.0 && dot_fwd < 24.0 && dot_lat.abs() < 4.2 {
                // Steer away from the side they are occupying
                if dot_lat >= 0.0 {
                    steer_offset -= (4.5 - dot_lat).max(1.0) / (dist * 0.35);
                } else {
                    steer_offset += (4.5 + dot_lat).max(1.0) / (dist * 0.35);
                }
            }
        }
    }

    // Desired heading to target
    let to_wp_x = target_x - car_x;
    let to_wp_z = target_z - car_z;
    let desired_angle = to_wp_x.atan2(to_wp_z);

    let angle_diff = wrap_angle(desired_angle - car_yaw);
    let mut steer = (angle_diff * 1.8 + steer_offset * 0.3).clamp(-1.0, 1.0);

    // AI Throttle & Braking
    let throttle;
    let mut brake = 0.0;
    let mut handbrake = 0.0;
    let mut nitro = 0.0;

    let target_speed_ms = (recommended_speed / 3.6).max(8.0);

    if car_speed_ms < target_speed_ms {
        // Accelerate
        let speed_deficit = target_speed_ms - car_speed_ms;
        let mut t = (speed_deficit / 8.0).clamp(0.4, 1.0);
        // If angle difference is sharp, ease throttle
        if angle_diff.abs() > 0.45 {
            t *= 0.6;
        }
        throttle = t;

        // Use nitro on long straights if speed is high and difference is low
        if angle_diff.abs() < 0.15 && car_speed_kmh > 90.0 && car[IDX_NITRO_AMOUNT] > 30.0 {
            nitro = 1.0;
        }
    } else {
        // Need to brake for corner
        let overspeed = car_speed_ms - target_speed_ms;
        if overspeed > 2.0 {
            brake = (overspeed / 7.0).clamp(0.3, 1.0);
        }
        throttle = 0.1;

        // If sharp turn and high speed, initiate drift!
        if angle_diff.abs() > 0.7 && car_speed_kmh > 65.0 {
            handbrake = 0.85;
            steer = steer.signum() * 1.0;
        }
    }

    // Apply inputs to car state
    car[IDX_STEER] = steer;
    car[IDX_THROTTLE] = throttle;
    car[IDX_BRAKE] = brake;
    car[IDX_HANDBRAKE] = handbrake;
    car[IDX_NITRO] = nitro;

    target_idx
}
