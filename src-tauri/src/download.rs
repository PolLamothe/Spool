use tokio::process::Command;
use lofty::prelude::*;
use lofty::probe::Probe;
use serde::Serialize;
use std::path::Path;
use std::fs;

#[derive(Serialize)]
pub struct LocalTrack {
    pub name: String,
    pub duration: u32,
}

fn get_safe_filename(title: &str) -> String {
    let safe_title = title.chars()
        .filter(|c| c.is_alphanumeric() || *c == ' ' || *c == '-' || *c == '_')
        .collect::<String>()
        .trim()
        .to_string();
    
    format!("{}.m4a", if safe_title.is_empty() { "audio" } else { &safe_title })
}

#[tauri::command]
pub fn list_files(folder_path: String) -> Result<Vec<LocalTrack>, String> {
    let path = Path::new(&folder_path);
    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    let mut tracks = Vec::new();
    let entries = fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                let extension = path.extension().and_then(|s| s.to_str()).unwrap_or_default().to_lowercase();
                if ["m4a", "mp3", "wav", "flac", "ogg"].contains(&extension.as_str()) {
                    let name = path.file_stem().unwrap_or_default().to_string_lossy().to_string();
                    
                    let duration = match Probe::open(&path) {
                        Ok(probe) => match probe.read() {
                            Ok(tagged_file) => tagged_file.properties().duration().as_millis() as u32,
                            Err(_) => 0,
                        },
                        Err(_) => 0,
                    };

                    tracks.push(LocalTrack { name, duration });
                }
            }
        }
    }
    Ok(tracks)
}

#[tauri::command]
pub fn is_video_downloaded(title: String, folder_path: String) -> bool {
    let filename = get_safe_filename(&title);
    let dest_path = Path::new(&folder_path).join(filename);
    dest_path.exists()
}

#[tauri::command]
pub async fn download_video(app_handle: tauri::AppHandle, url: String, folder_path: String) -> Result<String, String> {
    let config = crate::config::load_config(&app_handle);

    // 1. Get video title using yt-dlp
    let mut title_cmd = Command::new("yt-dlp");
    title_cmd.arg("--get-title");
    if let Some(ref browser) = config.youtube_cookies_browser {
        if !browser.is_empty() && browser != "none" {
            title_cmd.args(["--cookies-from-browser", browser]);
        }
    }
    title_cmd.arg(&url);

    let output = title_cmd.output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp to get title: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp failed to get title: {}", error));
    }

    let title = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let filename = get_safe_filename(&title);
    let dest_path = Path::new(&folder_path).join(&filename);

    // 2. Ensure directory exists
    if !Path::new(&folder_path).exists() {
        fs::create_dir_all(&folder_path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    // 3. Download using yt-dlp
    let mut download_cmd = Command::new("yt-dlp");
    download_cmd.args([
        "-x", 
        "--audio-format", "m4a",
        "--output", dest_path.to_str().ok_or("Invalid destination path")?,
    ]);
    if let Some(ref browser) = config.youtube_cookies_browser {
        if !browser.is_empty() && browser != "none" {
            download_cmd.args(["--cookies-from-browser", browser]);
        }
    }
    download_cmd.arg(&url);

    let download_output = download_cmd.output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !download_output.status.success() {
        let error = String::from_utf8_lossy(&download_output.stderr);
        return Err(format!("yt-dlp download failed: {}", error));
    }

    Ok(dest_path.to_string_lossy().to_string())
}
