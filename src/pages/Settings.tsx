import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import SpotifyConfigModal from "../components/SpotifyConfigModal";

function Settings() {
    const [isResetting, setIsResetting] = useState(false);
    const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);

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
