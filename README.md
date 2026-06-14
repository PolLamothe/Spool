# Spool

Spool is a modern desktop application designed to bridge the gap between Spotify playlists and local music collections. **Born from the need to simplify the workflow for DJ mixing, Spool automates the tedious process of finding and downloading local copies of Spotify tracks for use in DJ software.** It allows users to manage local folders as "spools" that sync with Spotify playlists, matching tracks with their YouTube equivalents for efficient local management.

This project is a hands-on journey to **learn** the **Rust** ecosystem and the **Tauri v2** framework.

## 🚀 Purpose

For many DJs, Spotify is the ultimate discovery tool, but using those tracks in a mix requires local files. Manually searching for and downloading each track from a playlist is a complex and time-consuming bottleneck. Spool aims to solve this by providing a streamlined workflow:
1. **Map** a local directory to a Spotify playlist.
2. **Synchronize** metadata and identify tracks.
3. **Match** tracks with high-quality YouTube sources using advanced search matching.
4. **Download** (Upcoming) and organize files locally, ready for your next set.

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Backend:** [Rust](https://www.rust-lang.org/), [Tauri v2](https://v2.tauri.app/)
- **State & Config:** JSON-based persistent configuration with Rust-side management.
- **External APIs:** 
  - **Spotify API:** Metadata retrieval via [rspotify](https://github.com/ramsayleung/rspotify).
  - **YouTube:** Search and matching via [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## ✨ Features

- [x] **Folder Management:** Add and manage multiple local "spools" (directories).
- [x] **Persistent Settings:** Securely store Spotify API credentials and user preferences.
- [x] **Spotify Integration:** 
  - OAuth2 authentication flow.
  - Browse and select user playlists.
  - Automatic track metadata synchronization (Title, Artist, Album, Cover Art).
- [x] **YouTube Matching:** Intelligent search to find matching YouTube videos for Spotify tracks, including duration and metadata validation.
- [ ] **Local Downloading:** (In Development) Downloading matched tracks to the specified local folder.
- [ ] **Download Queue & Progress:** Real-time tracking of active downloads.

## 📦 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Node.js](https://nodejs.org/) (v18+)
- [Tauri v2 Prerequisites](https://v2.tauri.app/guides/get-started/prerequisites/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/spool.git
   cd spool
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Run the application in development mode:
   ```bash
   npm run tauri dev
   ```

## 📖 How to Use

1. **Spotify API Setup:**
   - Go to the **Settings** page in Spool.
   - Enter your Spotify `Client ID` and `Client Secret` (obtainable from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)).
   - Save your configuration.

2. **Spotify Authentication:**
   - Click the **Login with Spotify** button. This will open your browser for OAuth2 authorization.
   - Once authorized, Spool will be able to access your playlists.

3. **Creating a Spool:**
   - Go to the **My Playlists** page.
   - Click on **Add Folder**.
   - Select a local directory on your computer and choose the Spotify playlist you want to sync with it.

4. **Synchronizing & Matching:**
   - Open a folder from your list to see its details.
   - Spool will automatically load the tracklist from Spotify.
   - Click **Load YouTube Tracks** to start the matching process. Spool will search for the best YouTube video match for each Spotify track, preparing them for future download.

## 🏗️ Project Structure

- `src/`: React frontend source code.
  - `components/`: Reusable UI elements (Sidebar, Modals, Previews).
  - `pages/`: Main application views (Folders, Settings, Folder Detail).
  - `structures.tsx`: TypeScript interfaces and classes for the data model.
- `src-tauri/`: Rust backend source code.
  - `src/config.rs`: Persistent JSON configuration logic.
  - `src/spotify.rs`: Spotify OAuth and API interaction.
  - `src/youtube.rs`: YouTube search and matching via yt-dlp.
  - `src/lib.rs`: Tauri command definitions and app entry point.

## 📝 License

This project is for educational purposes. Users are responsible for complying with Spotify's and YouTube's Terms of Service and local copyright laws.

---
*Built with ❤️ to learn Rust and Tauri.*
