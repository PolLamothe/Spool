# Spool

Spool is a desktop application designed to simplify the local downloading of Spotify playlists. This project serves as a personal learning journey to master the **Rust** programming language and the **Tauri** framework.

## 🚀 Purpose

The goal of Spool is to provide a clean, efficient interface for managing and downloading Spotify content locally. Beyond its utility, it is a hands-on exploration of:
- Building high-performance desktop apps with **Tauri v2**.
- Writing safe and efficient backend logic in **Rust**.
- Creating responsive and modern UIs with **React** and **TypeScript**.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Rust, Tauri
- **State & Config:** JSON-based persistent configuration
- **Plugins:** Tauri Dialog, Tauri Opener

## ✨ Features (In Progress)

- [x] **Path Management:** Configure and manage multiple local directories for downloads.
- [x] **Persistent Settings:** Automatic saving and loading of user configurations.
- [ ] **Spotify Integration:** Connect to Spotify API to fetch playlists.
- [ ] **Track Downloading:** Efficiently download tracks to specified local folders.
- [ ] **Download Management:** Track progress and manage active downloads.

## 📦 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+)
- [Tauri Prerequisites](https://tauri.app/v2/guides/getting-started/prerequisites)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/spool.git
   cd spool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application in development mode:
   ```bash
   npm run tauri dev
   ```

## 🏗️ Project Structure

- `src/`: React frontend source code (components, pages, styles).
- `src-tauri/`: Rust backend source code and Tauri configuration.
- `src-tauri/src/config.rs`: Logic for handling application settings and paths.

## 📝 License

This project is for educational purposes. Please ensure you comply with Spotify's Terms of Service and local copyright laws when using this application.

---
*Built with ❤️ to learn Rust and Tauri.*
