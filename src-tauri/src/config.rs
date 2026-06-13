use std::{fs};
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::Manager;
use crate::folder::{Folder};
use rspotify::Token;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppConfig {
    folders: Vec<Folder>,
    pub client : Option<ClientConfig>,
    pub token : Option<Token>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ClientConfig{
    pub client_id : String,
    pub client_secret : String
}

impl AppConfig {

    pub fn add_folder(&mut self, path: String, id: String){
        self.folders.push(Folder {
            id: id,
            path: path,
            last_synchronized: None,
        });
    }

    pub fn remove_folder(&mut self, path: String, id : String){
        self.folders.retain(|f| f.path != path && f.id != id);
    }
}

fn get_config_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut path = app_handle.path().app_data_dir()
        .map_err(|e| e.to_string())?;
    
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    
    path.push("config.json");
    Ok(path)
}

pub fn load_config(app_handle: &tauri::AppHandle) -> AppConfig {
    let default_config = AppConfig { 
        folders: Vec::new(),
        client : None,
        token : None
    };

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

pub fn save_config(app_handle: &tauri::AppHandle, config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_file_path(app_handle)?;
    let json_string = serde_json::to_string_pretty(config)
        .map_err(|e| e.to_string())?;
    
    fs::write(config_path, json_string).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_folders(app_handle: tauri::AppHandle) -> Vec<Folder> {
    let config = load_config(&app_handle);
    config.folders
}

#[tauri::command]
pub fn add_folder(app_handle: tauri::AppHandle, path: String, id : String) -> Result<(), String> {
    let mut config = load_config(&app_handle);
    config.add_folder(path, id);
    save_config(&app_handle, &config)
}

#[tauri::command]
pub fn remove_folder(app_handle: tauri::AppHandle, path: String,id : String) -> Result<(), String> {
    let mut config = load_config(&app_handle);
    config.remove_folder(path, id);
    save_config(&app_handle, &config)
}

#[tauri::command]
pub fn reset_folders(app_handle: tauri::AppHandle) -> Result<(), String> {
    let mut config = load_config(&app_handle);
    config.folders.clear();
    save_config(&app_handle, &config)
}

#[tauri::command]
pub fn set_client_config(app_handle: tauri::AppHandle,client_id : String, client_secret : String)-> Result<(), String>{
    let mut config = load_config(&app_handle);
    config.client = Some(ClientConfig { client_id, client_secret });
    save_config(&app_handle, &config)
}

#[tauri::command]
pub fn get_client_config(app_handle: tauri::AppHandle) -> Option<ClientConfig>{
    let config = load_config(&app_handle);
    config.client
}

#[tauri::command]
pub fn set_token(app_handle: tauri::AppHandle, token: Option<Token>) -> Result<(), String> {
    let mut config = load_config(&app_handle);
    config.token = token;
    save_config(&app_handle, &config)
}

#[tauri::command]
pub fn get_token(app_handle: tauri::AppHandle) -> Option<Token> {
    let config = load_config(&app_handle);
    config.token
}