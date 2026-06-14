use crate::track::Track;
use rustypipe::client::RustyPipe;
use rustypipe::model::YouTubeItem;
use serde::Serialize;

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

async fn fetch_youtube_info(rp: &RustyPipe, track: &Track) -> Result<YouTubeTrackInfo, String> {
    let query = format!("{} {}", track.name, track.title);
    
    match rp.query().search::<YouTubeItem, _>(&query).await {
        Ok(results) => {
            let video = results.items.items.into_iter().find_map(|item| {
                if let YouTubeItem::Video(v) = item {
                    Some(v)
                } else {
                    None
                }
            });

            if let Some(v) = video {
                Ok(YouTubeTrackInfo {
                    url: format!("https://www.youtube.com/watch?v={}", v.id),
                    title: v.name,
                    views: v.view_count.map(|vc| vc.to_string()).unwrap_or_else(|| "0".to_string()),
                    duration: v.duration.map(|d| {
                        let minutes = d / 60;
                        let seconds = d % 60;
                        format!("{}:{:02}", minutes, seconds)
                    }).unwrap_or_else(|| "0:00".to_string()),
                    thumbnail: v.thumbnail.first().map(|t| t.url.clone()).unwrap_or_default(),
                    channel: v.channel.map(|c| c.name).unwrap_or_default(),
                    published_at: v.publish_date_txt.unwrap_or_default(),
                })
            } else {
                Err(format!("No YouTube video found for: {}", query))
            }
        }
        Err(e) => Err(format!("YouTube search failed for {}: {}", query, e)),
    }
}

#[tauri::command]
pub async fn get_youtube_info(track: Track) -> Result<YouTubeTrackInfo, String> {
    let rp = RustyPipe::new();
    fetch_youtube_info(&rp, &track).await
}

#[tauri::command]
pub async fn get_playlist_youtube_tracks(tracks: Vec<Track>) -> Result<Vec<YouTubeTrackInfo>, String> {
    let rp = RustyPipe::new();
    let mut result = Vec::new();

    for track in tracks {
        match fetch_youtube_info(&rp, &track).await{
            Ok(youtube_track) => {
                result.push(youtube_track);
            },
            Err(error)=>{
                return Err(format!("{}",error));
            }
        }
    }
    Ok(result)
}
