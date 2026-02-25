mod lmu_telemetry;
mod telemetry;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!(
        "<p id=\"greet-msg\">Hello, {}! You've been greeted from Rust!</p>",
        name
    )
}

#[tauri::command]
fn read_telemetry() -> String {
    match lmu_telemetry::read_telemetry() {
        Ok(data) => format!(
            "<p id=\"telemetry\">Active vehicles: {}, Player has vehicle: {}</p>",
            data.telemetry.active_vehicles,
            data.telemetry.player_has_vehicle != 0,
        ),
        Err(e) => format!("<p id=\"telemetry\">Error: {}</p>", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_telemetry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
