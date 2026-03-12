mod lmu_telemetry;
mod results;
mod settings;
mod telemetry;
mod upload;

use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::Manager;

use settings::Settings;
use telemetry::{RecorderState, RecorderStatus};

// ── Tauri commands ────────────────────────────────────────────────────────────

#[tauri::command]
fn get_recorder_status(
    state: tauri::State<Arc<Mutex<RecorderState>>>,
) -> String {
    let s = state.lock().unwrap();

    let (status_class, status_label) = match s.status {
        RecorderStatus::LmuNotRunning => ("status--offline", "LMU not running"),
        RecorderStatus::Connected => ("status--connected", "Connected"),
        RecorderStatus::Recording => ("status--recording", "Recording"),
    };

    let lap_html = if s.current_lap > 0 {
        format!("<p class=\"lap\">{}</p>", s.current_lap)
    } else {
        String::new()
    };

    let pending_html = if s.pending_laps > 0 {
        format!(
            r##"<div class="pending">
                <span>{} lap{} pending upload</span>
                <button hx-post="command:upload_now" hx-target="#status" hx-swap="innerHTML">Upload now</button>
            </div>"##,
            s.pending_laps,
            if s.pending_laps == 1 { "" } else { "s" }
        )
    } else {
        String::new()
    };

    format!(
        r#"<div class="status {status_class}">
            <span class="dot"></span>
            <span>{status_label}</span>
        </div>
        {lap_html}
        {pending_html}"#
    )
}

#[tauri::command]
fn upload_now(
    telemetry_buffer: tauri::State<PathBuf>,
    results_buffer: tauri::State<ResultsBuffer>,
    settings: tauri::State<Arc<Mutex<Settings>>>,
) -> String {
    let s = settings.lock().unwrap().clone();
    if !s.is_authenticated() {
        return r#"<span class="upload-msg upload-msg--warn">Not logged in — configure your auth token in settings.</span>"#.to_string();
    }
    let (laps, sessions) =
        upload::upload_all(&telemetry_buffer, &results_buffer.0, &s);
    format!(
        r#"<span class="upload-msg">Uploaded {} lap{}, {} session{}.</span>"#,
        laps,
        if laps == 1 { "" } else { "s" },
        sessions,
        if sessions == 1 { "" } else { "s" },
    )
}

#[tauri::command]
fn get_settings(settings: tauri::State<Arc<Mutex<Settings>>>) -> Settings {
    settings.lock().unwrap().clone()
}

#[tauri::command]
fn save_settings(
    new_settings: Settings,
    config_dir: tauri::State<ConfigDir>,
    settings: tauri::State<Arc<Mutex<Settings>>>,
) {
    new_settings.save(&config_dir.0);
    *settings.lock().unwrap() = new_settings;
}

// ── Newtype wrappers so Tauri can manage multiple PathBufs ────────────────────

struct ResultsBuffer(PathBuf);
struct ConfigDir(PathBuf);

// ── App setup ─────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from(".racemate"));

            let buffer_dir = app_dir.join("buffer");
            let results_buffer = app_dir.join("results");
            let config_dir = app_dir.join("config");

            for dir in [&buffer_dir, &results_buffer, &config_dir] {
                std::fs::create_dir_all(dir).expect("Failed to create app directory");
            }

            eprintln!("[setup] App dir: {:?}", app_dir);

            // Load settings from disk.
            let settings = Settings::load(&config_dir);
            eprintln!("[setup] Auto-upload: {}, API: {}", settings.auto_upload, settings.api_url);

            let settings = Arc::new(Mutex::new(settings));
            app.manage(settings.clone());
            app.manage(buffer_dir.clone());
            app.manage(ResultsBuffer(results_buffer.clone()));
            app.manage(ConfigDir(config_dir));

            // Start telemetry recorder.
            let recorder_state = Arc::new(Mutex::new(RecorderState::initial()));
            app.manage(recorder_state.clone());
            telemetry::start(buffer_dir.clone(), recorder_state);

            // Start XML results watcher.
            let lmu_results_dir = {
                let s = settings.lock().unwrap();
                s.lmu_results_path().unwrap_or_else(|| {
                    dirs::document_dir()
                        .map(|d| d.join("Le Mans Ultimate").join("UserData").join("Log").join("Results"))
                        .unwrap_or_default()
                })
            };
            if lmu_results_dir.exists() {
                eprintln!("[setup] Watching LMU results: {:?}", lmu_results_dir);
            } else {
                eprintln!("[setup] LMU results dir not found, watcher will idle");
            }
            results::start(lmu_results_dir, results_buffer.clone());

            // Start upload loop (auto-uploads every 30s when enabled).
            upload::start(buffer_dir, results_buffer, settings);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_recorder_status,
            upload_now,
            get_settings,
            save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
