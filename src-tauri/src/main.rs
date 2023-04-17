// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod command;
mod crypto;
mod data_store;
mod download;
mod emit;
mod log;
mod queue;
mod throttle;
mod upload;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_oauth::init())
        .invoke_handler(tauri::generate_handler![
            command::download_dirs,
            command::download_files,
            command::upload_dir,
            command::open_folder,
            command::upload_file,
            command::upload_files,
            emit::emit_every_second
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
