mod config;
mod folder;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            config::get_folders,
            config::add_folder,
            config::remove_folder,
            config::reset_folders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
