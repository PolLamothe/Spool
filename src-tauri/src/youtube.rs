use crate::track::Track;
use serde::{Serialize, Deserialize};
use tokio::process::Command;

#[derive(Serialize)]
pub struct YouTubeTrackInfo {
    pub url: String,
    pub title: String,
    pub views: String,
    pub duration: String,
    pub thumbnail: String,
    pub channel: String,
    pub published_at: String,
}

#[derive(Deserialize)]
struct YtDlpResult {
    id: String,
    title: String,
    view_count: Option<u64>,
    duration: Option<f64>,
    thumbnail: Option<String>,
    uploader: Option<String>,
    upload_date: Option<String>,
}

async fn fetch_youtube_info(track: Track) -> Result<YouTubeTrackInfo, String> {
    let query = format!("ytsearch1:{} {}", track.name, track.title);
    
    let output = Command::new("yt-dlp")
        .args([
            "--dump-json",
            "--no-playlist",
            &query
        ])
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp search failed: {}", error));
    }

    let result: YtDlpResult = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse yt-dlp output: {}", e))?;

    Ok(YouTubeTrackInfo {
        url: format!("https://www.youtube.com/watch?v={}", result.id),
        title: result.title,
        views: result.view_count.map(|v| v.to_string()).unwrap_or_else(|| "0".to_string()),
        duration: result.duration.map(|d| {
            let total_seconds = d as u64;
            let minutes = total_seconds / 60;
            let seconds = total_seconds % 60;
            format!("{}:{:02}", minutes, seconds)
        }).unwrap_or_else(|| "0:00".to_string()),
        thumbnail: result.thumbnail.unwrap_or_default(),
        channel: result.uploader.unwrap_or_default(),
        published_at: result.upload_date.unwrap_or_default(),
    })
}

#[tauri::command]
pub async fn get_youtube_info(track: Track) -> Result<YouTubeTrackInfo, String> {
    fetch_youtube_info(track).await
}

#[tauri::command]
pub async fn get_playlist_youtube_tracks(tracks: Vec<Track>) -> Result<Vec<YouTubeTrackInfo>, String> {
    let mut futures = Vec::new();

    for track in tracks {
        futures.push(fetch_youtube_info(track));
    }

    let results = futures::future::join_all(futures).await;
    let mut youtube_tracks = Vec::new();

    for res in results {
        match res {
            Ok(yt_track) => youtube_tracks.push(yt_track),
            Err(e) => return Err(e),
        }
    }

    Ok(youtube_tracks)
}
