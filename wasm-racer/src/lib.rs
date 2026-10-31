pub mod car_physics;
pub mod ai_driver;
pub mod track_math;

use car_physics::*;
use ai_driver::*;
use track_math::*;

#[no_mangle]
pub extern "C" fn step_car_physics(car_ptr: *mut f32, dt: f32, surface_friction: f32) {
    if car_ptr.is_null() {
        return;
    }
    unsafe {
        let slice = std::slice::from_raw_parts_mut(car_ptr, CAR_DATA_SIZE);
        let car_arr: &mut [f32; CAR_DATA_SIZE] = &mut *(slice.as_mut_ptr() as *mut [f32; CAR_DATA_SIZE]);
        update_car_physics(car_arr, dt, surface_friction);
    }
}

#[no_mangle]
pub extern "C" fn step_ai_driver(
    car_ptr: *mut f32,
    waypoints_ptr: *const f32,
    num_waypoints: i32,
    current_wp_idx: i32,
    other_cars_ptr: *const f32,
    num_other_cars: i32,
    dt: f32,
    difficulty: f32,
) -> i32 {
    if car_ptr.is_null() || waypoints_ptr.is_null() || num_waypoints <= 0 {
        return current_wp_idx;
    }
    unsafe {
        let car_slice = std::slice::from_raw_parts_mut(car_ptr, CAR_DATA_SIZE);
        let car_arr: &mut [f32; CAR_DATA_SIZE] = &mut *(car_slice.as_mut_ptr() as *mut [f32; CAR_DATA_SIZE]);

        let wp_slice = std::slice::from_raw_parts(waypoints_ptr, (num_waypoints as usize) * 3);
        let other_slice = if !other_cars_ptr.is_null() && num_other_cars > 0 {
            std::slice::from_raw_parts(other_cars_ptr, (num_other_cars as usize) * 5)
        } else {
            &[]
        };

        let new_idx = update_ai_car(
            car_arr,
            wp_slice,
            num_waypoints as usize,
            current_wp_idx.max(0) as usize,
            other_slice,
            num_other_cars.max(0) as usize,
            dt,
            difficulty,
        );

        new_idx as i32
    }
}

#[no_mangle]
pub extern "C" fn resolve_cars_collision(car_a_ptr: *mut f32, car_b_ptr: *mut f32) -> f32 {
    if car_a_ptr.is_null() || car_b_ptr.is_null() {
        return 0.0;
    }
    unsafe {
        let slice_a = std::slice::from_raw_parts_mut(car_a_ptr, CAR_DATA_SIZE);
        let car_a: &mut [f32; CAR_DATA_SIZE] = &mut *(slice_a.as_mut_ptr() as *mut [f32; CAR_DATA_SIZE]);

        let slice_b = std::slice::from_raw_parts_mut(car_b_ptr, CAR_DATA_SIZE);
        let car_b: &mut [f32; CAR_DATA_SIZE] = &mut *(slice_b.as_mut_ptr() as *mut [f32; CAR_DATA_SIZE]);

        resolve_car_to_car_collision(car_a, car_b)
    }
}

#[no_mangle]
pub extern "C" fn check_barrier(
    car_ptr: *mut f32,
    track_cx: f32,
    track_cz: f32,
    track_dx: f32,
    track_dz: f32,
    track_half_width: f32,
) -> f32 {
    if car_ptr.is_null() {
        return 0.0;
    }
    unsafe {
        let slice = std::slice::from_raw_parts_mut(car_ptr, CAR_DATA_SIZE);
        let car: &mut [f32; CAR_DATA_SIZE] = &mut *(slice.as_mut_ptr() as *mut [f32; CAR_DATA_SIZE]);

        check_car_barrier_collision(car, track_cx, track_cz, track_dx, track_dz, track_half_width)
    }
}
