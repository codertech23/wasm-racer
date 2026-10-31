use crate::car_physics::*;

pub fn resolve_car_to_car_collision(car_a: &mut [f32; CAR_DATA_SIZE], car_b: &mut [f32; CAR_DATA_SIZE]) -> f32 {
    let dx = car_b[IDX_X] - car_a[IDX_X];
    let dz = car_b[IDX_Z] - car_a[IDX_Z];
    let dist_sq = dx * dx + dz * dz;

    // Car bounding radius approx 2.2m
    let min_dist = 3.2;
    if dist_sq >= min_dist * min_dist || dist_sq < 0.0001 {
        return 0.0;
    }

    let dist = dist_sq.sqrt();
    let overlap = min_dist - dist;
    let nx = dx / dist;
    let nz = dz / dist;

    // Separate cars
    let mass_a = car_a[IDX_MASS].max(800.0);
    let mass_b = car_b[IDX_MASS].max(800.0);
    let total_mass = mass_a + mass_b;

    let ratio_a = mass_b / total_mass;
    let ratio_b = mass_a / total_mass;

    car_a[IDX_X] -= nx * overlap * ratio_a;
    car_a[IDX_Z] -= nz * overlap * ratio_a;
    car_b[IDX_X] += nx * overlap * ratio_b;
    car_b[IDX_Z] += nz * overlap * ratio_b;

    // Relative velocity along collision normal
    let rel_vx = car_b[IDX_VX] - car_a[IDX_VX];
    let rel_vz = car_b[IDX_VZ] - car_a[IDX_VZ];
    let vel_along_normal = rel_vx * nx + rel_vz * nz;

    if vel_along_normal > 0.0 {
        return overlap; // Moving apart
    }

    // Elastic bounce impulse
    let restitution = 0.45;
    let impulse_mag = -(1.0 + restitution) * vel_along_normal / (1.0 / mass_a + 1.0 / mass_b);

    let impulse_x = impulse_mag * nx;
    let impulse_z = impulse_mag * nz;

    car_a[IDX_VX] -= impulse_x / mass_a;
    car_a[IDX_VZ] -= impulse_z / mass_a;
    car_b[IDX_VX] += impulse_x / mass_b;
    car_b[IDX_VZ] += impulse_z / mass_b;

    // Induce yaw nudge
    let tangent_x = -nz;
    let tangent_z = nx;
    let side_strike_a = rel_vx * tangent_x + rel_vz * tangent_z;
    car_a[IDX_YAW_RATE] += side_strike_a * 0.08;
    car_b[IDX_YAW_RATE] -= side_strike_a * 0.08;

    overlap
}

pub fn check_car_barrier_collision(
    car: &mut [f32; CAR_DATA_SIZE],
    track_center_x: f32,
    track_center_z: f32,
    track_dir_x: f32,
    track_dir_z: f32,
    track_half_width: f32,
) -> f32 {
    let car_x = car[IDX_X];
    let car_z = car[IDX_Z];

    // Vector from track center to car
    let to_car_x = car_x - track_center_x;
    let to_car_z = car_z - track_center_z;

    // Lateral normal to track direction
    let normal_x = -track_dir_z;
    let normal_z = track_dir_x;

    let lateral_dist = to_car_x * normal_x + to_car_z * normal_z;
    let abs_dist = lateral_dist.abs();

    if abs_dist > track_half_width {
        let penetration = abs_dist - track_half_width;
        let side = lateral_dist.signum();

        // Push back inside barrier
        car[IDX_X] -= normal_x * side * (penetration + 0.15);
        car[IDX_Z] -= normal_z * side * (penetration + 0.15);

        // Reflect velocity across normal
        let vn = car[IDX_VX] * (normal_x * side) + car[IDX_VZ] * (normal_z * side);
        if vn > 0.0 {
            let bounce = 0.35;
            car[IDX_VX] -= (1.0 + bounce) * vn * (normal_x * side);
            car[IDX_VZ] -= (1.0 + bounce) * vn * (normal_z * side);

            // Friction against barrier
            car[IDX_VX] *= 0.88;
            car[IDX_VZ] *= 0.88;
            car[IDX_YAW_RATE] *= 0.5;
        }

        // Off road flag set
        car[IDX_OFF_ROAD] = 1.0;
        return penetration;
    } else if abs_dist > track_half_width * 0.85 {
        // Shoulder rumble strip / curb
        car[IDX_OFF_ROAD] = 0.5;
        return 0.0;
    } else {
        car[IDX_OFF_ROAD] = 0.0;
        return 0.0;
    }
}
