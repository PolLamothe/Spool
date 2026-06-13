import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import PlaylistsPreview from "./PlaylistsPreview";
import { Folder, RustPlaylist } from "../structures";
import { showError } from "../utils/notifications";

interface EditFolderProps {
    folder: Folder;
    onClose: () => void;
    onUpdated?: () => void;
}

function EditFolder({ folder, onClose, onUpdated }: EditFolderProps) {
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(folder.id);
    const [playlists, setPlaylists] = useState<RustPlaylist[]>([]);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsLoadingPlaylists(true);
        invoke<RustPlaylist[]>("get_user_playlists").then((playlists: RustPlaylist[]) => {
            setPlaylists(playlists.map((playlist: RustPlaylist) => {
                // Ensure we extract the pure ID if it's in URI format (spotify:playlist:ID)
                if (playlist.id.includes(":")) {
                    playlist.id = playlist.id.split(":")[2];
                }
                return playlist;
            }));
        }).catch(error => {
            showError(error);
        }).finally(() => {
            setIsLoadingPlaylists(false);
        });
    }, []);

    const handleUpdate = async () => {
        if (!selectedPlaylistId) return;
        setIsSubmitting(true);
        try {
            await invoke("update_folder", { 
                path: folder.path, 
                oldId: folder.id, 
                newId: selectedPlaylistId 
            });
            if (onUpdated) onUpdated();
            onClose();
        } catch (error) {
            console.error("Failed to update folder:", error);
            alert("Error updating folder: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <h2>Edit Folder</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Folder Path</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, wordBreak: 'break-all' }}>{folder.path}</p>
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Spotify Playlist</label>
                    {isLoadingPlaylists ? (
                        <div className="loader-container" style={{ padding: '1rem' }}>
                            <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                            <p style={{ fontSize: '0.8rem' }}>Loading playlists...</p>
                        </div>
                    ) : (
                        <PlaylistsPreview 
                            playlists={playlists} 
                            selectedId={selectedPlaylistId}
                            onSelect={setSelectedPlaylistId}
                        />
                    )}
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button 
                        className="primary-btn" 
                        onClick={handleUpdate} 
                        disabled={selectedPlaylistId === folder.id || isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default EditFolder;
