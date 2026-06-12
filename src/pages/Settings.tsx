import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

function Settings() {
    const [isResetting, setIsResetting] = useState(false);

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
        <div className="settings-page">
            <h1>Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Manage your application preferences.
            </p>

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
        </div>
    );
}

export default Settings;
