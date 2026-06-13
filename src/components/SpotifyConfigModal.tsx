import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface SpotifyConfigModalProps {
    onClose: () => void;
}

function SpotifyConfigModal({ onClose }: SpotifyConfigModalProps) {
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        setIsLoading(true);
        const configPromise = invoke<any>("get_client_config").then((clientConfig)=>{
            if (clientConfig) {
                setClientId(clientConfig.clientId);
                setClientSecret(clientConfig.clientSecret);
            }
        });

        const tokenPromise = invoke<any>("get_token").then((token)=>{
            setIsAuthenticated(!!token);
        });

        Promise.allSettled([configPromise, tokenPromise]).finally(() => {
            setIsLoading(false);
        });

        const unlisten = listen("spotify-auth-success", () => {
            setIsAuthenticated(true);
            setIsLoggingIn(false);
        });

        return () => {
            unlisten.then(u => u());
        };

    },[]);

    const handleSave = async () => {
        await invoke("set_client_config", { clientId, clientSecret });
        onClose();
    };

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await handleSave();
            await invoke("start_spotify_auth");
        } catch (error) {
            console.error("Login failed:", error);
            setIsLoggingIn(false);
            alert("Login failed: " + error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Spotify Configuration</h2>

                {isLoading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Loading configuration...</p>
                    </div>
                ) : (
                    <>
                        <div className="input-group">
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client ID</label>
                            <input
                                type="text"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                placeholder="Your Spotify Client ID"
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client Secret</label>
                            <input
                                type="password"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                placeholder="Your Spotify Client Secret"
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                            />
                        </div>

                        <div style={{ margin: '1rem 0', padding: '1rem', borderRadius: '4px', backgroundColor: isAuthenticated ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255, 0, 0, 0.1)', border: `1px solid ${isAuthenticated ? '#1db954' : '#ff0000'}` }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: isAuthenticated ? '#1db954' : '#ff0000' }}>
                                Status: {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                            </p>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button 
                                className="primary-btn" 
                                onClick={handleLogin}
                                disabled={isLoggingIn || !clientId || !clientSecret}
                                style={{ backgroundColor: '#1db954', color: 'white' }}
                            >
                                {isLoggingIn ? "Logging in..." : (isAuthenticated ? "Re-authenticate with Spotify" : "Login with Spotify")}
                            </button>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button className="secondary-btn" onClick={onClose} style={{ flex: 1 }}>
                                    Close
                                </button>
                                <button 
                                    className="primary-btn" 
                                    onClick={handleSave}
                                    style={{ flex: 1 }}
                                >
                                    Save Config
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SpotifyConfigModal;
