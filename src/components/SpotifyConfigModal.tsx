import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ClientConfig } from "../structures";

interface SpotifyConfigModalProps {
    onClose: () => void;
}

function SpotifyConfigModal({ onClose }: SpotifyConfigModalProps) {
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");

    useEffect(()=>{
        invoke<ClientConfig>("get_client_config").then((clientConfig : ClientConfig)=>{
            setClientId(clientConfig.client_id);
            setClientSecret(clientConfig.client_secret);
        });

    },[]);

    const handleSave = async () => {
        invoke("set_client_config", { clientId, clientSecret });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Spotify Configuration</h2>

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

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="primary-btn" 
                        onClick={handleSave}
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpotifyConfigModal;
