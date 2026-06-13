mod config;
mod folder;
mod spotify;
mod track;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout))
                .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview))
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .setup(|_app| {
            println!("PRINTLN: Tauri is setting up...");
            log::info!("Tauri backend started and logger initialized!");
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_oauth::init())
        .invoke_handler(tauri::generate_handler![
            config::get_folders,
            config::add_folder,
            config::remove_folder,
            config::reset_folders,
            config::set_client_config,
            config::get_client_config,
            config::set_token,
            config::get_token,
            spotify::start_spotify_auth,
            spotify::get_playlist_tracks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
