use rspotify::{
    model::{PlaylistId, PlayableItem},
    prelude::*,
    AuthCodeSpotify, Credentials, OAuth, scopes,
};
use futures::StreamExt;
use crate::track::{Track};
use crate::config::{load_config, save_config};
use crate::playlist::{Playlist};
use tauri::Emitter;
use url::Url;

async fn get_spotify_client(app_handle: &tauri::AppHandle) -> Result<AuthCodeSpotify, String> {
    let config = load_config(app_handle);
    let client_config = config.client.ok_or("Spotify client not configured")?;
    let token = config.token.ok_or("Not authenticated with Spotify")?;

    let creds = Credentials::new(&client_config.client_id, &client_config.client_secret);
    let oauth = OAuth {
        redirect_uri: "http://127.0.0.1:8888/callback".to_string(),
        scopes: scopes!("playlist-read-private", "playlist-read-collaborative"),
        ..Default::default()
    };

    let mut spotify = AuthCodeSpotify::from_token(token);
    spotify.creds = creds;
    spotify.oauth = oauth;

    spotify.refresh_token().await.map_err(|e| e.to_string())?;

    let current_token = spotify.get_token().lock().await.unwrap().clone();
    if let Some(t) = current_token {
        let mut new_config = load_config(app_handle);
        new_config.token = Some(t);
        save_config(app_handle, &new_config)?;
    }

    Ok(spotify)
}

#[tauri::command]
pub async fn start_spotify_auth(app_handle: tauri::AppHandle) -> Result<(), String> {
    let config = load_config(&app_handle);
    let client_config = config.client.ok_or("Spotify client not configured")?;

    let creds = Credentials::new(&client_config.client_id, &client_config.client_secret);
    let oauth = OAuth {
        redirect_uri: "http://127.0.0.1:8888/callback".to_string(),
        scopes: scopes!("playlist-read-private", "playlist-read-collaborative"),
        ..Default::default()
    };

    let spotify = AuthCodeSpotify::new(creds, oauth);
    let url = spotify.get_authorize_url(false).map_err(|e| e.to_string())?;

    let spotify_clone = spotify.clone();
    let app_handle_clone = app_handle.clone();

    tauri_plugin_oauth::start_with_config(
        tauri_plugin_oauth::OauthConfig {
            ports: Some(vec![8888]),
            response: Some("<html><body>Authentication successful! You can close this window.</body></html>".into()),
        },
        move |url| {
            let spotify = spotify_clone.clone();
            let app_handle = app_handle_clone.clone();

            tauri::async_runtime::spawn(async move {
                log::info!("Received callback URL: {}", url);
                if let Ok(url) = Url::parse(&url) {
                    let code = url.query_pairs()
                        .find(|(key, _)| key == "code")
                        .map(|(_, value)| value.into_owned());

                    if let Some(code) = code {
                        log::info!("Extracted code, requesting token...");
                        match spotify.request_token(&code).await {
                            Ok(_) => {
                                log::info!("Token request successful!");
                                match spotify.get_token().lock().await {
                                    Ok(guard) => {
                                        if let Some(token) = (*guard).clone() {
                                            let mut config = load_config(&app_handle);
                                            config.token = Some(token);
                                            if let Err(e) = save_config(&app_handle, &config) {
                                                log::error!("Failed to save config: {}", e);
                                            } else {
                                                log::info!("Config saved with token, emitting success event...");
                                                let _ = app_handle.emit("spotify-auth-success", ());
                                            }
                                        } else {
                                            log::error!("Token request succeeded but token is still None");
                                        }
                                    }
                                    Err(_) => {
                                        log::error!("Failed to lock token mutex");
                                    }
                                }
                            }
                            Err(e) => {
                                log::error!("Failed to request token: {}", e);
                            }
                        }
                    } else {
                        log::error!("No code found in URL");
                    }
                } else {
                    log::error!("Failed to parse URL: {}", url);
                }
            });
        }
    ).map_err(|e| e.to_string())?;

    // Open browser
    tauri_plugin_opener::open_url(url, None::<&str>).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_user_playlists(app_handle: tauri::AppHandle) -> Result<Vec<Playlist>, String> {
    let spotify = get_spotify_client(&app_handle).await?;
    let mut playlists = Vec::new();
    let mut stream = spotify.current_user_playlists();

    while let Some(playlist) = stream.next().await {
        match playlist {
            Ok(p) => {
                playlists.push(Playlist {
                    id: p.id.to_string(),
                    name: p.name,
                    image_url: p.images.first().map(|i| i.url.clone()),
                });
            }
            Err(e) => return Err(format!("Erreur lors de la récupération des playlists: {}", e)),
        }
    }

    Ok(playlists)
}

#[tauri::command]
pub async fn get_playlist(
    app_handle: tauri::AppHandle,
    playlist_id: &str,
) -> Result<Playlist, String> {
    let spotify = get_spotify_client(&app_handle).await?;

    let playlist_id = PlaylistId::from_id(playlist_id).map_err(|e| e.to_string())?;
    
    let p = spotify.playlist(playlist_id, None, None).await.map_err(|e| e.to_string())?;
    
    Ok(Playlist {
        id: p.id.to_string(),
        name: p.name,
        image_url: p.images.first().map(|i| i.url.clone()),
    })
}

#[tauri::command]
pub async fn get_playlist_tracks(
    app_handle: tauri::AppHandle,
    playlist_id: &str,
) -> Result<Vec<Track>, String> {
    let spotify = get_spotify_client(&app_handle).await?;

    // 3. Récupération de l'ID de la playlist
    let playlist_id = PlaylistId::from_id(playlist_id).map_err(|e| e.to_string())?;
    
    let mut tracks = Vec::new();
    
    let mut stream = spotify.playlist_items(playlist_id, None, None);
    
    while let Some(item) = stream.next().await {
        match item {
            Ok(item) => {
                if let Some(PlayableItem::Track(t)) = item.item {
                    let year = t.album.release_date
                        .as_ref()
                        .and_then(|date| date.split('-').next())
                        .and_then(|y| y.parse::<u32>().ok())
                        .unwrap_or(0);

                    tracks.push(Track {
                        title: t.name.clone(),
                        name: t.artists
                            .first()
                            .map(|a| a.name.clone())
                            .unwrap_or_else(|| "Unknown Artist".to_string()),
                        album: t.album.name.clone(),
                        year,
                        duration: t.duration.num_milliseconds() as u32,
                        image_url: t.album.images.first().map(|i| i.url.clone()),
                    });
                }
            }
            Err(e) => return Err(format!("Erreur lors de la lecture du stream: {}", e)),
        }
    }

    Ok(tracks)
}

