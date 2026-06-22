import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import SpotifyConfigModal from "../components/SpotifyConfigModal";

function Settings() {
    const [isResetting, setIsResetting] = useState(false);
    const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
    const [cookiesBrowser, setCookiesBrowser] = useState<string>("none");

    useEffect(() => {
        const loadCookiesSetting = async () => {
            try {
                const browser = await invoke<string | null>("get_youtube_cookies_browser");
                setCookiesBrowser(browser || "none");
            } catch (err) {
                console.error("Failed to load cookies browser setting:", err);
            }
        };
        loadCookiesSetting();
    }, []);

    const handleCookiesBrowserChange = async (browser: string) => {
        setCookiesBrowser(browser);
        try {
            await invoke("set_youtube_cookies_browser", { browser: browser === "none" ? null : browser });
        } catch (err) {
            console.error("Failed to save cookies browser setting:", err);
            alert("Error saving YouTube cookies setting: " + err);
        }
    };

    const handleReset = async () => {
        if (!confirm("Are you sure you want to remove all folders? This action cannot be undone.")) {
            return;
        }

        setIsResetting(true);
        try {
            await invoke("reset_folders");
            alert("All folders have been removed.");
        } catch (error) {
            console.error("Failed to reset folders:", error);
            alert("Error resetting folders: " + error);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="settings-page scrollable-page">
            <h1>Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Manage your application preferences.
            </p>

            <div className="settings-section" style={{ marginBottom: '2rem' }}>
                <h3>Spotify Integration</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Configure your Spotify API credentials to enable syncing features.
                </p>
                <button 
                    className="primary-btn"
                    onClick={() => setIsSpotifyModalOpen(true)}
                >
                    Configure Spotify
                </button>
            </div>

            <div className="settings-section" style={{ marginBottom: '2rem' }}>
                <h3>YouTube Downloader Settings</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    If you run into issues downloading age-restricted or private videos, select a browser to load authenticated cookies from.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label htmlFor="cookies-browser-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Cookies Source Browser
                    </label>
                    <select
                        id="cookies-browser-select"
                        value={cookiesBrowser}
                        onChange={(e) => handleCookiesBrowserChange(e.target.value)}
                        className="cookies-select"
                    >
                        <option value="none">None (No cookies)</option>
                        <option value="chrome">Google Chrome</option>
                        <option value="firefox">Mozilla Firefox</option>
                        <option value="safari">Apple Safari</option>
                        <option value="edge">Microsoft Edge</option>
                        <option value="brave">Brave Browser</option>
                        <option value="chromium">Chromium</option>
                        <option value="opera">Opera</option>
                        <option value="vivaldi">Vivaldi</option>
                    </select>
                </div>
            </div>

            <div className="settings-section">
                <h3>Library Management</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Danger zone: Actions that affect your entire library configuration.
                </p>
                <button 
                    className="secondary-btn" 
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                    onClick={handleReset}
                    disabled={isResetting}
                >
                    {isResetting ? "Resetting..." : "Reset all folders"}
                </button>
            </div>

            {isSpotifyModalOpen && (
                <SpotifyConfigModal onClose={() => setIsSpotifyModalOpen(false)} />
            )}
        </div>
    );
}

export default Settings;
