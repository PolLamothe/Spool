use std::{fs, ops::Index};
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppConfig {
    download_paths: Vec<String>,
}

impl AppConfig{
    pub fn get_download_paths(&self) -> &Vec<String>{
        &self.download_paths
    }

    pub fn with_additional_path(mut self, new_path: String) -> Self {
        self.download_paths.push(new_path);
        self
    }

    pub fn remove_path(mut self, path_to_remove : String) -> Self{
        for (index,path) in self.get_download_paths().iter().enumerate() {
            if path == &path_to_remove{
                self.download_paths.remove(index);
                break;
            }  
        };
        self
    }
}

fn get_config_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut path = app_handle.path().app_data_dir()
        .map_err(|e| e.to_string())?;
    
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    
    path.push("config.json");
    Ok(path)
}

fn load_config(app_handle: &tauri::AppHandle) -> AppConfig {
    let default_config = AppConfig { download_paths: Vec::new() };

    if let Ok(config_path) = get_config_file_path(&app_handle) {
        if config_path.exists() {
            if let Ok(content) = fs::read_to_string(config_path) {
                if let Ok(config) = serde_json::from_str::<AppConfig>(&content) {
                    return config;
                }
            }
        }
    }
    default_config
}

fn save_config(app_handle: &tauri::AppHandle, config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_file_path(app_handle)?;
    let json_string = serde_json::to_string_pretty(config)
        .map_err(|e| e.to_string())?;
    
    fs::write(config_path, json_string).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_config_paths(app_handle: tauri::AppHandle) -> Vec<String>{
    let config = load_config(&app_handle);
    config.get_download_paths().clone()
}

#[tauri::command]
pub fn add_path_config(app_handle: tauri::AppHandle, path: String) -> Result<(), String> {
    let config = load_config(&app_handle);
    let new_config = config.with_additional_path(path);
    save_config(&app_handle, &new_config)
}

#[tauri::command]
pub fn remove_path_config(app_handle: tauri::AppHandle, path: String) -> Result<(),String>{
    let config = load_config(&app_handle);
    let new_config = config.remove_path(path);
    save_config(&app_handle, &new_config)
}